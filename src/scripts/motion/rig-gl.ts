// Haces volumétricos del rig del hero en WebGL2: un solo triángulo a pantalla
// completa y un fragment shader que dibuja, para cada cabeza, el cono de luz
// atravesando humo (ruido fbm que deriva lento), su núcleo, el brillo del
// lente y la mancha que deja en el piso; y el abanico láser como líneas finas
// que solo se ven donde hay humo, como en una pista real.
//
// No decide nada de la coreografía: hero.ts le pasa en cada cuadro dónde está
// cada lente, hacia dónde apunta y con qué intensidad. Si WebGL2 no existe, no
// compila o se pierde el contexto, devuelve null / avisa y el rig se queda con
// los haces CSS de RigLuces.astro.

export interface HazGL {
  /** Centro del lente en px CSS del lienzo. */
  x: number;
  y: number;
  /** Ángulo con la convención de rig.ts (grados, 0 = abajo, + = punta a la izquierda). */
  a: number;
  /** Intensidad 0..1. */
  i: number;
  color: [number, number, number];
}

export interface EstadoGL {
  t: number;
  haces: HazGL[];
  laser: { x: number; y: number; giro: number; apertura: number; i: number };
  /** Encendido general 0..1 (la entrada sube de 0 a 1 sin saltos). */
  nivel: number;
}

export interface RigGL {
  dibujar(e: EstadoGL): void;
  medir(ancho: number, alto: number): void;
  destruir(): void;
}

const MAX_HACES = 6;
const LINEAS_LASER = 11;

const VERT = `#version 300 es
in vec2 pos;
void main() { gl_Position = vec4(pos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uEscala;
uniform float uT;
uniform float uNivel;
uniform float uPiso;
uniform int uN;
uniform vec4 uHaz[${MAX_HACES}];
uniform vec3 uCol[${MAX_HACES}];
uniform vec4 uLaser;
uniform float uApertura;
out vec4 salida;

// Hash entero PCG 2D: estable con coordenadas grandes (los senos se degradan).
uvec2 pcg(uvec2 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * 1664525u; v.y += v.x * 1664525u;
  v ^= v >> 16u;
  v.x += v.y * 1664525u; v.y += v.x * 1664525u;
  v ^= v >> 16u;
  return v;
}
float hash(vec2 p) { return float(pcg(uvec2(ivec2(floor(p)) + 65536)).x) / 4294967295.0; }
float ruido(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int k = 0; k < 4; k++) { s += a * ruido(p); p = r * p * 2.03 + 17.1; a *= 0.5; }
  return s;
}

void main() {
  // Píxel en px CSS con y hacia abajo, como el resto del layout.
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uEscala;

  // Humo: dos capas de fbm que derivan a distinta velocidad y se multiplican,
  // así hay bancos densos y huecos en vez de una niebla pareja.
  vec2 q = p * 0.0038;
  float humo = fbm(q + vec2(uT * 0.016, -uT * 0.032));
  humo *= fbm(q * 1.9 + vec2(-uT * 0.027, uT * 0.011) + 5.2);
  humo = 0.25 + 2.6 * humo;

  vec3 luz = vec3(0.0);

  for (int k = 0; k < ${MAX_HACES}; k++) {
    if (k >= uN) break;
    vec4 h = uHaz[k];
    float a = radians(h.z);
    vec2 d = vec2(-sin(a), cos(a));   // hacia donde apunta el haz
    vec2 n = vec2(cos(a), sin(a));    // perpendicular
    vec2 v = p - h.xy;
    float s = dot(v, d);              // distancia a lo largo del haz
    float r = dot(v, n);              // distancia al eje

    // Cono: radio que crece con la distancia, perfil gaussiano con borde que
    // se apaga (sin canto duro) y un núcleo fino más brillante.
    float w = 6.0 + max(s, 0.0) * 0.15;
    float e = abs(r) / w;
    float cono = exp(-e * e * 2.4) * (1.0 - smoothstep(0.75, 1.2, e));
    float nucleo = exp(-e * e * 26.0);
    float largo = smoothstep(-4.0, 22.0, s) / (1.0 + max(s, 0.0) * 0.0024);
    float haz = (cono * 0.42 * humo + nucleo * 0.30 * (0.55 + 0.45 * humo)) * largo;

    // Mancha en el piso: donde el eje del haz corta la línea del piso.
    float piso = 0.0;
    if (d.y > 0.25) {
      float sh = (uPiso - h.y) / d.y;
      vec2 c = h.xy + d * sh;
      float wh = 6.0 + sh * 0.15;
      vec2 dp = vec2((p.x - c.x) / (wh * 1.25), (p.y - c.y) / (wh * 0.2));
      piso = exp(-dot(dp, dp)) * 0.55;
    }

    // Lente: brillo cercano, halo amplio y un destello horizontal anamórfico.
    float rl = length(v);
    float lente = exp(-rl * 0.11) * 1.6 + exp(-rl * 0.025) * 0.16;
    float destello = exp(-abs(v.y) * 0.45) * exp(-abs(v.x) * 0.014) * 0.10;

    luz += uCol[k] * ((haz + piso) * h.w + (lente + destello) * (0.35 + 0.65 * h.w));
  }

  // Láser: líneas nítidas desde un punto. Solo se ven donde hay humo.
  if (uLaser.z > 0.001) {
    vec2 v = p - uLaser.xy;
    float dist = length(v);
    float ang = atan(v.x, v.y);
    float acum = 0.0;
    for (int k = 0; k < ${LINEAS_LASER}; k++) {
      float ak = uLaser.w + (float(k) / ${LINEAS_LASER - 1}.0 - 0.5) * uApertura * 2.0;
      float dd = ang - ak;
      if (cos(dd) <= 0.0) continue;
      float perp = abs(sin(dd)) * dist;
      acum += exp(-perp * perp * 1.4) + exp(-perp * 0.4) * 0.1;
    }
    float fade = smoothstep(10.0, 60.0, dist) / (1.0 + dist * 0.0028);
    luz += vec3(1.0, 0.86, 0.52) * acum * fade * uLaser.z * (0.15 + 0.85 * humo);
  }

  // Un poco de aire iluminado bajo el truss, para que el humo exista también
  // entre haces.
  luz += vec3(0.95, 0.78, 0.45) * 0.022 * humo * exp(-p.y * 0.0045);

  luz *= uNivel;
  // Tone mapping suave (sin recortes a blanco) y dither contra el bandeado.
  vec3 c = 1.0 - exp(-luz * 1.15);
  c += (hash(gl_FragCoord.xy + fract(uT) * 97.0) - 0.5) / 255.0;
  salida = vec4(c, 1.0);
}`;

function compilar(gl: WebGL2RenderingContext, tipo: number, src: string): WebGLShader | null {
  const s = gl.createShader(tipo);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('[rig-gl]', gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

export function crearRigGL(canvas: HTMLCanvasElement, alPerder: () => void): RigGL | null {
  let gl: WebGL2RenderingContext | null = null;
  try {
    gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  if (!gl) return null;

  const vs = compilar(gl, gl.VERTEX_SHADER, VERT);
  const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('[rig-gl]', gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);

  // Un triángulo que cubre todo el lienzo (sin la costura de dos triángulos).
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (n: string) => gl!.getUniformLocation(prog, n);
  const uRes = u('uRes'), uEscala = u('uEscala'), uT = u('uT'), uNivel = u('uNivel'), uPiso = u('uPiso');
  const uN = u('uN'), uHaz = u('uHaz'), uCol = u('uCol'), uLaser = u('uLaser'), uApertura = u('uApertura');
  const haz = new Float32Array(MAX_HACES * 4);
  const col = new Float32Array(MAX_HACES * 3);

  let perdido = false;
  canvas.addEventListener('webglcontextlost', (ev) => { ev.preventDefault(); perdido = true; alPerder(); });

  // Resolución adaptativa: los haces son suaves y aguantan bien un buffer más
  // chico que la pantalla. Si la media de 40 cuadros pasa de ~24 ms, se baja.
  const movil = matchMedia('(max-width: 700px)').matches;
  let escala = Math.min(devicePixelRatio || 1, 2) * (movil ? 0.5 : 0.7);
  const MIN_ESCALA = 0.3;
  let anchoCss = 0, altoCss = 0;
  let ultimo = 0, suma = 0, cuadros = 0;

  const ajustar = () => {
    canvas.width = Math.max(1, Math.round(anchoCss * escala));
    canvas.height = Math.max(1, Math.round(altoCss * escala));
    gl!.viewport(0, 0, canvas.width, canvas.height);
  };

  return {
    medir(ancho, alto) {
      anchoCss = ancho;
      altoCss = alto;
      ajustar();
    },
    dibujar(e) {
      if (perdido || !gl) return;
      const ahora = performance.now();
      if (ultimo) {
        suma += Math.min(ahora - ultimo, 100);
        if (++cuadros === 40) {
          if (suma / cuadros > 24 && escala > MIN_ESCALA) { escala = Math.max(MIN_ESCALA, escala - 0.15); ajustar(); }
          suma = 0; cuadros = 0;
        }
      }
      ultimo = ahora;

      const n = Math.min(e.haces.length, MAX_HACES);
      for (let k = 0; k < n; k++) {
        const h = e.haces[k];
        haz.set([h.x, h.y, h.a, h.i], k * 4);
        col.set(h.color, k * 3);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uEscala, canvas.width / Math.max(anchoCss, 1));
      gl.uniform1f(uT, e.t);
      gl.uniform1f(uNivel, e.nivel);
      gl.uniform1f(uPiso, altoCss * 0.9);
      gl.uniform1i(uN, n);
      gl.uniform4fv(uHaz, haz);
      gl.uniform3fv(uCol, col);
      gl.uniform4f(uLaser, e.laser.x, e.laser.y, e.laser.i, e.laser.giro);
      gl.uniform1f(uApertura, e.laser.apertura);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destruir() {
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      gl = null;
    },
  };
}

/** "#F4C752" → [r, g, b] en 0..1. */
export function hexARgb(hex: string): [number, number, number] {
  const v = parseInt(hex.replace('#', ''), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}
