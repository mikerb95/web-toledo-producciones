// Catálogos del módulo de finanzas, compartidos entre servidor y cliente.
// Las claves se guardan en BD; las etiquetas son solo para mostrar.

export type TxType = 'ingreso' | 'gasto';
export type PaymentStatus = 'pendiente' | 'pagado' | 'vencido';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'nequi' | 'daviplata' | 'otro' | '';
export type ContractKind = 'arrendamiento' | 'evento' | 'otro';
export type ContractStatus = 'activo' | 'finalizado' | 'cancelado';

export const INGRESO_CATEGORIES: Record<string, string> = {
  arrendamiento_equipos: 'Alquiler de equipos',
  evento_paquete: 'Evento / paquete',
  servicio_adicional: 'Servicio adicional',
  otro_ingreso: 'Otro ingreso',
};

export const GASTO_CATEGORIES: Record<string, string> = {
  arrendamiento: 'Arrendamiento',
  equipos: 'Equipos',
  transporte: 'Transporte',
  nomina: 'Nómina',
  mantenimiento: 'Mantenimiento',
  publicidad: 'Publicidad',
  servicios: 'Servicios',
  otro_gasto: 'Otro gasto',
};

export function categoriesFor(type: TxType): Record<string, string> {
  return type === 'ingreso' ? INGRESO_CATEGORIES : GASTO_CATEGORIES;
}

export function categoryLabel(key: string): string {
  return INGRESO_CATEGORIES[key] || GASTO_CATEGORIES[key] || key;
}

export const PAYMENT_STATUSES: Record<PaymentStatus, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  vencido: 'Vencido',
};

export const METHODS: Record<Exclude<PaymentMethod, ''>, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  otro: 'Otro',
};

export const CONTRACT_KINDS: Record<ContractKind, string> = {
  arrendamiento: 'Arrendamiento',
  evento: 'Evento',
  otro: 'Otro',
};

export const CONTRACT_STATUSES: Record<ContractStatus, string> = {
  activo: 'Activo',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

// Tope de monto por movimiento: 100 mil millones COP (entero, sin centavos).
export const MAX_AMOUNT = 100_000_000_000;

export const ATTACHMENT_MAX_SIZE = 8 * 1024 * 1024; // 8 MB
export const ATTACHMENT_MAX_COUNT = 5;
export const ATTACHMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

// ── Formas de fila que viajan por la API (montos siempre INTEGER COP) ──
export interface ClientRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  document_id: string;
  notes: string;
  contract_count: number;
  tx_count: number;
  total_ingresos: number;
  created_at: string;
  updated_at: string;
}

export interface ContractRow {
  id: number;
  client_id: number;
  title: string;
  kind: ContractKind;
  start_date: string;
  end_date: string;
  total_agreed: number;
  status: ContractStatus;
  notes: string;
  paid_total: number;
  created_at: string;
  updated_at: string;
}

export interface TxRow {
  id: number;
  type: TxType;
  category: string;
  amount: number;
  tx_date: string;
  description: string;
  client_id: number | null;
  contract_id: number | null;
  client_name: string | null;
  contract_title: string | null;
  payment_status: PaymentStatus;
  due_date: string;
  method: PaymentMethod;
  attachment_count: number;
  created_at: string;
  updated_at: string;
}

export interface AttachmentRow {
  id: number;
  transaction_id: number;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
}

export interface SummaryData {
  balance: number;
  month: { ym: string; ingresos: number; gastos: number };
  pendiente: { count: number; total: number };
  vencido: { count: number; total: number };
  months: { ym: string; ingresos: number; gastos: number }[]; // últimos 12, ascendente
}
