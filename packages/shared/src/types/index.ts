export interface Producto {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  categoria_id: string | null
  categoria_nombre?: string | null
  unidad_medida: string
  precio_base: number
  moneda: string
  fraccion_arancelaria: string | null
  pais_origen: string | null
  peso_kg: number | null
  volumen_m3: number | null
  activo: boolean
  imagen_url: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  codigo: string
  tipo_persona: "moral" | "fisica"
  nombre: string
  rfc: string | null
  email: string | null
  telefono: string | null
  pais: string
  moneda_default: string
  limite_credito: number
  condiciones_pago: string | null
  vendedor_id: string | null
  vendedor_nombre?: string | null
  industria: string | null
  rating: number
  notas: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Proveedor {
  id: string
  codigo: string
  nombre: string
  rfc: string | null
  email: string | null
  telefono: string | null
  pais: string
  moneda_default: string
  condiciones_pago: string | null
  tipo_proveedor: string | null
  rating: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Oferta {
  id: string
  folio: string
  cliente_id: string
  cliente_nombre?: string | null
  comercial_id: string
  comercial_nombre?: string | null
  fecha_emision: string
  fecha_vigencia: string | null
  estado: "borrador" | "enviada" | "aceptada" | "rechazada" | "convertida"
  tipo_operacion: string | null
  condiciones_pago: string | null
  incoterm: string | null
  moneda: string
  tipo_cambio: number | null
  subtotal: number
  descuento_global: number
  iva: number
  total: number
  notas: string | null
  notas_internas: string | null
  porcentaje_ganancia: number | null
  fichas?: FichaOferta[]
  created_at: string
  updated_at: string
}

export interface FichaOferta {
  id: string
  oferta_id: string
  producto_id: string
  producto_nombre?: string | null
  productoCodigo?: string | null
  proveedor_id: string | null
  proveedor_nombre?: string | null
  cantidad: number
  unidad_medida: string
  precio_unitario: number
  descuento: number
  subtotal: number
  notas: string | null
}

export interface Contenedor {
  id: string
  numero_contenedor: string
  tipo: string
  tamano: string | null
  booking: string | null
  naviera: string | null
  importadora_id: string | null
  importadora_nombre?: string | null
  eta: string | null
  etd: string | null
  puerto_origen: string | null
  puerto_destino: string | null
  sello: string | null
  peso_kg: number | null
  volumen_m3: number | null
  estado: string
  notas: string | null
  created_at: string
  updated_at: string
}

export interface Factura {
  id: string
  folio: string
  oferta_id: string | null
  cliente_id: string
  cliente_nombre?: string | null
  tipo: string
  subtotal: number
  iva: number
  total: number
  moneda: string
  tipo_cambio: number | null
  fecha_emision: string
  fecha_vencimiento: string | null
  estado: string
  uuid_cfdi: string | null
  created_at: string
  updated_at: string
}

export interface Documento {
  id: string
  tipo_documento: string
  nombre: string
  descripcion: string | null
  oferta_id: string | null
  cliente_id: string | null
  proveedor_id: string | null
  producto_id: string | null
  contenedor_id: string | null
  expediente_id: string | null
  version_actual: number
  firmado: boolean
  storage_path: string
  file_size: number | null
  file_type: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
  versiones?: VersionDocumento[]
  categoria_nombre?: string | null
  cliente_nombre?: string | null
  proveedor_nombre?: string | null
  producto_nombre?: string | null
  oferta_folio?: string | null
}

export interface VersionDocumento {
  id: string
  documento_id: string
  version: number
  storage_path: string
  file_size: number | null
  subido_por: string | null
  subido_por_nombre?: string | null
  notas_cambio: string | null
  created_at: string
}

export interface Categoria {
  id: string
  nombre: string
  created_at: string
}

export interface HistorialDocumento {
  id: string
  documento_id: string
  accion: string
  usuario_id: string | null
  usuario_nombre?: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Importadora {
  id: string
  codigo: string
  nombre: string
  rfc: string | null
  direccion: string | null
  aduana_asignada: string | null
  agente_aduanal: string | null
  email: string | null
  telefono: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Embarque {
  id: string
  contenedor_id: string
  estado: string
  ubicacion_actual: string | null
  fecha_evento: string
  descripcion: string | null
  usuario_registra: string | null
  contenedor_numero?: string | null
  created_at: string
  updated_at: string
}

export interface Cobro {
  id: string
  factura_id: string
  monto: number
  moneda: string
  tipo_cambio: number | null
  fecha_cobro: string
  metodo_pago: string | null
  referencia: string | null
  cobrador_id: string | null
  cobrador_nombre?: string | null
  factura_folio?: string | null
  cliente_nombre?: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

export interface Moneda {
  id: string
  codigo: string
  nombre: string
  simbolo: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface UnidadMedida {
  id: string
  codigo: string
  nombre: string
  categoria: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Pais {
  id: string
  codigo: string
  codigo_alpha3: string | null
  nombre: string
  nacionalidad: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Pago {
  id: string
  proveedor_id: string | null
  beneficiario: string | null
  oferta_id: string | null
  monto: number
  moneda: string
  tipo_cambio: number | null
  fecha_pago: string
  estado: string
  metodo_pago: string | null
  referencia: string | null
  pagador_id: string | null
  pagador_nombre?: string | null
  proveedor_nombre?: string | null
  notas: string | null
  created_at: string
  updated_at: string
}
