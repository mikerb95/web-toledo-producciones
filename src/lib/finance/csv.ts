// Serialización CSV (RFC 4180) con BOM UTF-8 para Excel y neutralización de
// fórmulas: celdas que empiezan por = + - @ se prefijan con ' para que un
// texto malicioso no se ejecute al abrir el archivo en una hoja de cálculo.

function cell(value: string | number): string {
  let s = String(value);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function toCsv(header: string[], rows: (string | number)[][]): string {
  const lines = [header.map(cell).join(','), ...rows.map((r) => r.map(cell).join(','))];
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}
