"use client"

import { supabase } from "@/lib/supabase"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  Producto, Cliente, Contenedor, Proveedor, Oferta,
  Categoria, Documento, VersionDocumento, HistorialDocumento,
  Importadora, Embarque, Factura, Cobro, Pago,
} from "@shared/types"
import type { DashboardKPIs } from "@/lib/actions/dashboard"
import type { ProductoFormValues } from "@shared/schemas"
import type { OfertaFormValues, AprobarOfertaFormValues } from "@shared/schemas"
import type { ClienteFormValues } from "@shared/schemas"
import type { ProveedorFormValues } from "@shared/schemas"
import type { ContenedorFormValues } from "@shared/schemas"
import type { EmbarqueFormValues } from "@shared/schemas"
import type { ImportadoraFormValues } from "@shared/schemas"
import type { DocumentoFormValues } from "@shared/schemas"
import type { PagoFormValues } from "@shared/schemas"

import * as productoSrv from "@/lib/actions/productos"
import * as clienteSrv from "@/lib/actions/clientes"
import * as proveedorSrv from "@/lib/actions/proveedores"
import * as ofertaSrv from "@/lib/actions/ofertas"
import * as contenedorSrv from "@/lib/actions/contenedores"
import * as embarqueSrv from "@/lib/actions/embarques"
import * as importadoraSrv from "@/lib/actions/importadoras"
import * as facturaSrv from "@/lib/actions/facturas"
import * as cobroSrv from "@/lib/actions/cobros"
import * as pagoSrv from "@/lib/actions/pagos"
import * as documentoSrv from "@/lib/actions/documentos"
import * as authSrv from "@/lib/actions/auth"
import * as usuarioSrv from "@/lib/actions/usuarios"

const STALE = {
  MIN: 60 * 1000,
  MED: 5 * 60 * 1000,
  HIGH: 10 * 60 * 1000,
}

// ─── Helpers ────────────────────────────────────────────

function useListQuery<T>(key: (string | null)[], fn: () => Promise<T[]>, staleTime = STALE.MIN) {
  return useQuery<T[]>({ queryKey: key, queryFn: fn, staleTime })
}

function useDetailQuery<T>(key: (string | null)[], fn: () => Promise<T>, enabled = true, staleTime = STALE.MIN) {
  return useQuery<T>({ queryKey: key, queryFn: fn, enabled, staleTime })
}

// ─── Productos ──────────────────────────────────────────

async function fetchProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias_productos!left(nombre)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map((p) => ({
    ...p,
    categoria_nombre: (p.categorias_productos as { nombre?: string } | null)?.nombre ?? null,
    categorias_productos: undefined,
  })) as unknown as Producto[]
}

async function fetchProducto(id: string): Promise<Producto> {
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias_productos!left(nombre)")
    .eq("id", id)
    .single()
  if (error) throw error
  return {
    ...data,
    categoria_nombre: (data.categorias_productos as { nombre?: string } | null)?.nombre ?? null,
    categorias_productos: undefined,
  } as unknown as Producto
}

export function useProductos() { return useListQuery<Producto>(["productos"], fetchProductos) }
export function useProducto(id: string) { return useDetailQuery<Producto>(["productos", id], () => fetchProducto(id), !!id) }

export function useCrearProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductoFormValues & { imagenFile?: File | null }) => productoSrv.crearProducto(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productos"] }),
  })
}

export function useActualizarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductoFormValues }) => productoSrv.actualizarProducto(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productos"] }),
  })
}

export function useEliminarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productoSrv.eliminarProducto(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productos"] }),
  })
}

export function useSubirImagenProducto() {
  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      productoSrv.subirImagenProducto(productId, file),
  })
}

// ─── Clientes ───────────────────────────────────────────

async function fetchClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*, usuarios!left(nombre, apellido)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map((c) => ({
    ...c,
    vendedor_nombre: c.usuarios
      ? `${(c.usuarios as { nombre?: string; apellido?: string }).nombre ?? ""} ${(c.usuarios as { nombre?: string; apellido?: string }).apellido ?? ""}`.trim() || null
      : null,
    usuarios: undefined,
  })) as unknown as Cliente[]
}

async function fetchCliente(id: string): Promise<Cliente> {
  const { data, error } = await supabase
    .from("clientes")
    .select("*, usuarios!left(nombre, apellido)")
    .eq("id", id)
    .single()
  if (error) throw error
  return {
    ...data,
    vendedor_nombre: data.usuarios
      ? `${(data.usuarios as { nombre?: string; apellido?: string }).nombre ?? ""} ${(data.usuarios as { nombre?: string; apellido?: string }).apellido ?? ""}`.trim() || null
      : null,
    usuarios: undefined,
  } as unknown as Cliente
}

export function useClientes() { return useListQuery<Cliente>(["clientes"], fetchClientes) }
export function useCliente(id: string) { return useDetailQuery<Cliente>(["clientes", id], () => fetchCliente(id), !!id) }

export function useCrearCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ClienteFormValues) => clienteSrv.crearCliente(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  })
}

export function useActualizarCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClienteFormValues }) => clienteSrv.actualizarCliente(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  })
}

export function useEliminarCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clienteSrv.eliminarCliente(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  })
}

// ─── Proveedores ────────────────────────────────────────

async function fetchProveedores(): Promise<Proveedor[]> {
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Proveedor[]
}

async function fetchProveedor(id: string): Promise<Proveedor> {
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data as unknown as Proveedor
}

export function useProveedores() { return useListQuery<Proveedor>(["proveedores"], fetchProveedores) }
export function useProveedor(id: string) { return useDetailQuery<Proveedor>(["proveedores", id], () => fetchProveedor(id), !!id) }

export function useCrearProveedor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProveedorFormValues) => proveedorSrv.crearProveedor(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proveedores"] }),
  })
}

export function useActualizarProveedor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProveedorFormValues }) => proveedorSrv.actualizarProveedor(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proveedores"] }),
  })
}

export function useEliminarProveedor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => proveedorSrv.eliminarProveedor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proveedores"] }),
  })
}

// ─── Ofertas ────────────────────────────────────────────

async function fetchOfertas(): Promise<Oferta[]> {
  const { data, error } = await supabase
    .from("ofertas")
    .select("*, clientes!left(nombre), codificador_comerciales!left(nombre)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map((o) => ({
    ...o,
    cliente_nombre: (o.clientes as { nombre?: string } | null)?.nombre ?? null,
    clientes: undefined,
    comercial_nombre: (o.codificador_comerciales as { nombre?: string } | null)?.nombre ?? null,
    codificador_comerciales: undefined,
  })) as unknown as Oferta[]
}

async function fetchOferta(id: string): Promise<Oferta> {
  const { data, error } = await supabase
    .from("ofertas")
    .select("*, clientes!left(nombre), codificador_comerciales!left(nombre), fichas_oferta(*, productos!left(nombre, codigo), proveedores!left(nombre))")
    .eq("id", id)
    .single()
  if (error) throw error
  return {
    ...data,
    cliente_nombre: (data.clientes as { nombre?: string } | null)?.nombre ?? null,
    clientes: undefined,
    comercial_nombre: (data.codificador_comerciales as { nombre?: string } | null)?.nombre ?? null,
    codificador_comerciales: undefined,
    fichas: (data.fichas_oferta ?? []).map((f: Record<string, unknown>) => ({
      ...f,
      producto_nombre: (f.productos as { nombre?: string } | null)?.nombre ?? null,
      productoCodigo: (f.productos as { codigo?: string } | null)?.codigo ?? null,
      proveedor_nombre: (f.proveedores as { nombre?: string } | null)?.nombre ?? null,
      productos: undefined,
      proveedores: undefined,
    })),
    fichas_oferta: undefined,
  } as unknown as Oferta
}

export function useOfertas() { return useListQuery<Oferta>(["ofertas"], fetchOfertas) }
export function useOferta(id: string) { return useDetailQuery<Oferta>(["ofertas", id], () => fetchOferta(id), !!id) }

export function useCrearOferta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: OfertaFormValues) => ofertaSrv.crearOferta(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ofertas"] }),
  })
}

export function useActualizarOferta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OfertaFormValues }) => ofertaSrv.actualizarOferta(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ofertas"] }),
  })
}

export function useActualizarEstadoOferta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => ofertaSrv.actualizarEstadoOferta(id, estado as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ofertas"] }),
  })
}

export function useAprobarOferta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AprobarOfertaFormValues }) => ofertaSrv.aprobarOferta(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ofertas"] }); qc.invalidateQueries({ queryKey: ["facturas"] }); qc.invalidateQueries({ queryKey: ["cobros"] }); qc.invalidateQueries({ queryKey: ["pagos"] }) },
  })
}

export function useEliminarOferta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ofertaSrv.eliminarOferta(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ofertas"] }),
  })
}

// ─── Contenedores ───────────────────────────────────────

async function fetchContenedores(): Promise<Contenedor[]> {
  const { data, error } = await supabase
    .from("contenedores")
    .select("*, importadoras!left(nombre)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map((c) => ({
    ...c,
    importadora_nombre: (c.importadoras as { nombre?: string } | null)?.nombre ?? null,
    importadoras: undefined,
  })) as unknown as Contenedor[]
}

async function fetchContenedor(id: string): Promise<Contenedor> {
  const { data, error } = await supabase
    .from("contenedores")
    .select("*, importadoras!left(nombre), embarques(*, usuarios!left(nombre, apellido))")
    .eq("id", id)
    .single()
  if (error) throw error
  return {
    ...data,
    importadora_nombre: (data.importadoras as { nombre?: string } | null)?.nombre ?? null,
    importadoras: undefined,
  } as unknown as Contenedor
}

export function useContenedores() { return useListQuery<Contenedor>(["contenedores"], fetchContenedores) }
export function useContenedor(id: string) { return useDetailQuery<Contenedor>(["contenedores", id], () => fetchContenedor(id), !!id) }

export function useCrearContenedor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ContenedorFormValues) => contenedorSrv.crearContenedor(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contenedores"] }),
  })
}

export function useActualizarContenedor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContenedorFormValues }) => contenedorSrv.actualizarContenedor(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contenedores"] }),
  })
}

// ─── Embarques ──────────────────────────────────────────

async function fetchEmbarques(): Promise<Embarque[]> {
  const { data, error } = await supabase
    .from("embarques")
    .select("*, contenedores!inner(numero_contenedor)")
    .is("deleted_at", null)
    .order("fecha_evento", { ascending: false })
  if (error) throw error
  return (data ?? []).map((e) => ({
    ...e,
    contenedor_numero: (e as Record<string, unknown>).contenedores
      ? ((e as Record<string, unknown>).contenedores as Record<string, unknown>).numero_contenedor
      : null,
    contenedores: undefined,
  })) as unknown as Embarque[]
}

async function fetchEmbarque(id: string): Promise<Embarque> {
  const { data, error } = await supabase
    .from("embarques")
    .select("*, contenedores!inner(numero_contenedor)")
    .eq("id", id)
    .single()
  if (error) throw error
  return {
    ...data,
    contenedor_numero: (data as Record<string, unknown>).contenedores
      ? ((data as Record<string, unknown>).contenedores as Record<string, unknown>).numero_contenedor
      : null,
    contenedores: undefined,
  } as unknown as Embarque
}

export function useEmbarques() { return useListQuery<Embarque>(["embarques"], fetchEmbarques) }
export function useEmbarque(id: string) { return useDetailQuery<Embarque>(["embarques", id], () => fetchEmbarque(id), !!id) }

export function useCrearEmbarque() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EmbarqueFormValues) => embarqueSrv.crearEmbarque(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["embarques"] }),
  })
}

export function useActualizarEmbarque() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmbarqueFormValues }) => embarqueSrv.actualizarEmbarque(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["embarques"] }),
  })
}

export function useEliminarEmbarque() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => embarqueSrv.eliminarEmbarque(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["embarques"] }),
  })
}

// ─── Importadoras ───────────────────────────────────────

async function fetchImportadoras(): Promise<Importadora[]> {
  const { data, error } = await supabase
    .from("importadoras")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Importadora[]
}

async function fetchImportadora(id: string): Promise<Importadora> {
  const { data, error } = await supabase
    .from("importadoras")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data as unknown as Importadora
}

export function useImportadoras() { return useListQuery<Importadora>(["importadoras"], fetchImportadoras) }
export function useImportadora(id: string) { return useDetailQuery<Importadora>(["importadoras", id], () => fetchImportadora(id), !!id) }

export function useCrearImportadora() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ImportadoraFormValues) => importadoraSrv.crearImportadora(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["importadoras"] }),
  })
}

export function useActualizarImportadora() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ImportadoraFormValues }) => importadoraSrv.actualizarImportadora(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["importadoras"] }),
  })
}

export function useEliminarImportadora() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => importadoraSrv.eliminarImportadora(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["importadoras"] }),
  })
}

// ─── Facturas ───────────────────────────────────────────

async function fetchFacturas(): Promise<Factura[]> {
  const { data, error } = await supabase
    .from("facturas")
    .select("*, clientes!inner(nombre)")
    .is("deleted_at", null)
    .order("fecha_emision", { ascending: false })
  if (error) throw error
  return (data ?? []).map((f) => ({
    ...f,
    cliente_nombre: (f as Record<string, unknown>).clientes
      ? ((f as Record<string, unknown>).clientes as Record<string, unknown>).nombre
      : null,
    clientes: undefined,
  })) as unknown as Factura[]
}

async function fetchFactura(id: string): Promise<Factura> {
  const { data, error } = await supabase
    .from("facturas")
    .select("*, clientes!inner(nombre)")
    .eq("id", id)
    .single()
  if (error) throw error
  return {
    ...data,
    cliente_nombre: (data as Record<string, unknown>).clientes
      ? ((data as Record<string, unknown>).clientes as Record<string, unknown>).nombre
      : null,
    clientes: undefined,
  } as unknown as Factura
}

export function useFacturas() { return useListQuery<Factura>(["facturas"], fetchFacturas) }
export function useFactura(id: string) { return useDetailQuery<Factura>(["facturas", id], () => fetchFactura(id), !!id) }

export function useActualizarEstadoFactura() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => facturaSrv.actualizarEstadoFactura(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["facturas"] }),
  })
}

export function useEliminarFactura() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => facturaSrv.eliminarFactura(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["facturas"] }),
  })
}

// ─── Cobros ─────────────────────────────────────────────

async function fetchCobros(): Promise<Cobro[]> {
  const { data, error } = await supabase
    .from("cobros")
    .select("*, facturas!inner(folio, clientes!inner(nombre))")
    .is("deleted_at", null)
    .order("fecha_cobro", { ascending: false })
  if (error) throw error
  return (data ?? []).map((c) => {
    const factura = (c as Record<string, unknown>).facturas as Record<string, unknown> | undefined
    return {
      ...c,
      factura_folio: factura?.folio ?? null,
      cliente_nombre: (factura?.clientes as Record<string, unknown> | undefined)?.nombre ?? null,
      facturas: undefined,
    }
  }) as unknown as Cobro[]
}

async function fetchCobro(id: string): Promise<Cobro> {
  const { data, error } = await supabase
    .from("cobros")
    .select("*, facturas!inner(folio, clientes!inner(nombre))")
    .eq("id", id)
    .single()
  if (error) throw error
  const factura = (data as Record<string, unknown>).facturas as Record<string, unknown> | undefined
  return {
    ...data,
    factura_folio: factura?.folio ?? null,
    cliente_nombre: (factura?.clientes as Record<string, unknown> | undefined)?.nombre ?? null,
    facturas: undefined,
  } as unknown as Cobro
}

export function useCobros() { return useListQuery<Cobro>(["cobros"], fetchCobros) }
export function useCobro(id: string) { return useDetailQuery<Cobro>(["cobros", id], () => fetchCobro(id), !!id) }

export function useEliminarCobro() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cobroSrv.eliminarCobro(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cobros"] }),
  })
}

// ─── Pagos ──────────────────────────────────────────────

async function fetchPagos(): Promise<Pago[]> {
  const { data, error } = await supabase
    .from("pagos")
    .select("*, proveedores!left(nombre)")
    .is("deleted_at", null)
    .order("fecha_pago", { ascending: false })
  if (error) throw error
  return (data ?? []).map((p) => ({
    ...p,
    proveedor_nombre: (p as Record<string, unknown>).proveedores
      ? ((p as Record<string, unknown>).proveedores as Record<string, unknown>).nombre
      : null,
    proveedores: undefined,
  })) as unknown as Pago[]
}

async function fetchPago(id: string): Promise<Pago> {
  const { data, error } = await supabase
    .from("pagos")
    .select("*, proveedores!left(nombre)")
    .eq("id", id)
    .single()
  if (error) throw error
  return {
    ...data,
    proveedor_nombre: (data as Record<string, unknown>).proveedores
      ? ((data as Record<string, unknown>).proveedores as Record<string, unknown>).nombre
      : null,
    proveedores: undefined,
  } as unknown as Pago
}

export function usePagos() { return useListQuery<Pago>(["pagos"], fetchPagos) }
export function usePago(id: string) { return useDetailQuery<Pago>(["pagos", id], () => fetchPago(id), !!id) }

export function useCrearPago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PagoFormValues) => pagoSrv.crearPago(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pagos"] }),
  })
}

export function useActualizarEstadoPago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado, data }: { id: string; estado: string; data?: { metodo_pago?: string; referencia?: string } }) =>
      pagoSrv.actualizarEstadoPago(id, estado, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pagos"] }),
  })
}

export function useEliminarPago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pagoSrv.eliminarPago(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pagos"] }),
  })
}

// ─── Categorías ─────────────────────────────────────────

async function fetchCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from("categorias_productos")
    .select("*")
    .is("deleted_at", null)
    .eq("activo", true)
    .order("orden", { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as Categoria[]
}

export function useCategorias() { return useListQuery<Categoria>(["categorias"], fetchCategorias, STALE.HIGH) }

// ─── Documentos ─────────────────────────────────────────

export interface DocumentoFiltros {
  cliente_id?: string
  proveedor_id?: string
  producto_id?: string
  oferta_id?: string
  tipo_documento?: string
}

async function fetchDocumentos(filtros: DocumentoFiltros = {}): Promise<Documento[]> {
  let query = supabase
    .from("documentos")
    .select("*, clientes!left(nombre), proveedores!left(nombre), productos!left(nombre), ofertas!left(folio)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (filtros.cliente_id) query = query.eq("cliente_id", filtros.cliente_id)
  if (filtros.proveedor_id) query = query.eq("proveedor_id", filtros.proveedor_id)
  if (filtros.producto_id) query = query.eq("producto_id", filtros.producto_id)
  if (filtros.oferta_id) query = query.eq("oferta_id", filtros.oferta_id)
  if (filtros.tipo_documento) query = query.eq("tipo_documento", filtros.tipo_documento)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((d) => ({
    ...d,
    cliente_nombre: (d.clientes as { nombre?: string } | null)?.nombre ?? null,
    proveedor_nombre: (d.proveedores as { nombre?: string } | null)?.nombre ?? null,
    producto_nombre: (d.productos as { nombre?: string } | null)?.nombre ?? null,
    oferta_folio: (d.ofertas as { folio?: string } | null)?.folio ?? null,
    clientes: undefined,
    proveedores: undefined,
    productos: undefined,
    ofertas: undefined,
  })) as unknown as Documento[]
}

async function fetchDocumento(id: string): Promise<Documento> {
  const { data, error } = await supabase
    .from("documentos")
    .select("*, clientes!left(nombre), proveedores!left(nombre), productos!left(nombre), ofertas!left(folio)")
    .eq("id", id)
    .single()
  if (error) throw error
  return {
    ...data,
    cliente_nombre: (data.clientes as { nombre?: string } | null)?.nombre ?? null,
    proveedor_nombre: (data.proveedores as { nombre?: string } | null)?.nombre ?? null,
    producto_nombre: (data.productos as { nombre?: string } | null)?.nombre ?? null,
    oferta_folio: (data.ofertas as { folio?: string } | null)?.folio ?? null,
    clientes: undefined,
    proveedores: undefined,
    productos: undefined,
    ofertas: undefined,
  } as unknown as Documento
}

async function fetchVersiones(documentoId: string): Promise<VersionDocumento[]> {
  const { data, error } = await supabase
    .from("versiones_documento")
    .select("*, usuarios!left(nombre, apellido)")
    .eq("documento_id", documentoId)
    .order("version", { ascending: false })
  if (error) throw error
  return (data ?? []).map((v) => ({
    ...v,
    subido_por_nombre: v.usuarios
      ? `${(v.usuarios as { nombre?: string; apellido?: string }).nombre ?? ""} ${(v.usuarios as { nombre?: string; apellido?: string }).apellido ?? ""}`.trim() || null
      : null,
    usuarios: undefined,
  })) as unknown as VersionDocumento[]
}

async function fetchHistorial(documentoId: string): Promise<HistorialDocumento[]> {
  const { data, error } = await supabase
    .from("historial_documento")
    .select("*, usuarios!left(nombre, apellido)")
    .eq("documento_id", documentoId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map((h) => ({
    ...h,
    usuario_nombre: h.usuarios
      ? `${(h.usuarios as { nombre?: string; apellido?: string }).nombre ?? ""} ${(h.usuarios as { nombre?: string; apellido?: string }).apellido ?? ""}`.trim() || null
      : null,
    usuarios: undefined,
  })) as unknown as HistorialDocumento[]
}

export function useDocumentos(filtros?: DocumentoFiltros) {
  return useListQuery<Documento>(["documentos", "lista", JSON.stringify(filtros ?? {})], () => fetchDocumentos(filtros))
}
export function useDocumentosPorEntidad(
  entidad: "cliente" | "proveedor" | "producto" | "oferta" | "contenedor" | "expediente",
  entityId: string
) {
  return useQuery<Documento[]>({
    queryKey: ["documentos", "por-entidad", entidad, entityId],
    queryFn: () => fetchDocumentos({ [`${entidad}_id`]: entityId } as DocumentoFiltros),
    enabled: !!entityId,
    staleTime: STALE.MIN,
  })
}
export function useDocumento(id: string) { return useDetailQuery<Documento>(["documentos", id], () => fetchDocumento(id), !!id) }
export function useVersiones(documentoId: string) { return useDetailQuery<VersionDocumento[]>(["documentos", documentoId, "versiones"], () => fetchVersiones(documentoId), !!documentoId) }
export function useHistorial(documentoId: string) { return useDetailQuery<HistorialDocumento[]>(["documentos", documentoId, "historial"], () => fetchHistorial(documentoId), !!documentoId) }

export function useCrearDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DocumentoFormValues) => documentoSrv.crearDocumento(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documentos"] }),
  })
}

export function useActualizarDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DocumentoFormValues> }) =>
      documentoSrv.actualizarDocumento(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documentos"] }),
  })
}

export function useEliminarDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentoSrv.eliminarDocumento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documentos"] }),
  })
}

export function useFirmarDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentoSrv.firmarDocumento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documentos"] }),
  })
}

export function useSubirArchivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ documentoId, file, notasCambio }: { documentoId: string; file: File; notasCambio?: string }) =>
      documentoSrv.subirArchivo(documentoId, file, notasCambio),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documentos"] }),
  })
}

// ─── Dashboard & Reports ────────────────────────────────

export function useDashboardKPIs() {
  return useDetailQuery<DashboardKPIs>(["dashboard", "kpis"], async () => {
    const res = await fetch("/api/dashboard/kpis")
    if (!res.ok) throw new Error("Error al cargar KPIs")
    return res.json()
  }, true, STALE.MED)
}

export function useReporte() {
  return useMutation({
    mutationFn: (data: { tipo: string; formato: string; filtro?: Record<string, unknown> }) =>
      fetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()) as Promise<{ url?: string; error?: string }>,
  })
}

// ─── Usuarios / Roles / Auditoría / Codificadores ───────

type UsuarioRow = { id: string; email: string; nombre: string; apellido: string; telefono: string | null; activo: boolean; ultimo_acceso: string | null; created_at: string }
type RolRow = { id: string; nombre: string; descripcion: string; jerarquia: number }
type AuditRow = { id: string; tabla: string; operacion: string; registro_id: string | null; usuario_id: string | null; usuario_nombre: string | null; datos_previos: unknown; datos_nuevos: unknown; ip_address: string | null; created_at: string }
type ActividadRow = { id: string; usuario_id: string | null; usuario_nombre: string | null; accion: string; modulo: string; metadata: unknown; ip_address: string | null; created_at: string }
type MonedaItem = { id: string; codigo: string; nombre: string; simbolo: string | null; activo: boolean }
type UnidadItem = { id: string; codigo: string; nombre: string; categoria: string; activo: boolean }
type PaisItem = { id: string; codigo: string; codigo_alpha3: string | null; nombre: string; nacionalidad: string | null; activo: boolean }
type CategoriaItem = { id: string; nombre: string; descripcion: string | null; padre_id: string | null; activo: boolean; orden: number }
type ComercialItem = { id: string; codigo: string; nombre: string; activo: boolean }

export function useUsuarios() {
  return useDetailQuery<UsuarioRow[]>(["usuarios"],
    () => fetch("/api/usuarios").then((r) => r.json()),
    true, STALE.MED)
}

export function useRoles() {
  return useDetailQuery<RolRow[]>(["roles"],
    () => fetch("/api/roles").then((r) => r.json()),
    true, STALE.HIGH)
}

type PermisoItem = { id: string; codigo: string; nombre: string; modulo: string; accion: string }

export function usePermisos() {
  return useDetailQuery<PermisoItem[]>(["permisos"],
    () => usuarioSrv.getPermisos(),
    true, STALE.HIGH)
}

export function useRolesPermisos(rolId: string | null) {
  return useDetailQuery<string[]>(["roles", rolId, "permisos"],
    () => usuarioSrv.getRolesPermisos(rolId!),
    !!rolId, STALE.HIGH)
}

export function useCrearRol() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { nombre: string; descripcion: string; jerarquia: number; permisos: string[] }) =>
      usuarioSrv.crearRol(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  })
}

export function useActualizarRol() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nombre: string; descripcion: string; jerarquia: number; permisos: string[] } }) =>
      usuarioSrv.actualizarRol(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  })
}

export function useEliminarRol() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usuarioSrv.eliminarRol(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  })
}

export function usePermiso(id: string | null) {
  return useDetailQuery<PermisoItem>(["permisos", id],
    () => usuarioSrv.getPermiso(id!),
    !!id, STALE.HIGH)
}

export function useCrearPermiso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { codigo: string; nombre: string; modulo: string; accion: string }) =>
      usuarioSrv.crearPermiso(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["permisos"] }),
  })
}

export function useActualizarPermiso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { codigo: string; nombre: string; modulo: string; accion: string } }) =>
      usuarioSrv.actualizarPermiso(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["permisos"] }),
  })
}

export function useEliminarPermiso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usuarioSrv.eliminarPermiso(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["permisos"] }),
  })
}

export function useCrearUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { email: string; password: string; nombre: string; apellido: string; rol_id?: string }) =>
      fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(async (res) => {
        if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Error al crear usuario") }
        return res.json()
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usuarios"] }),
  })
}

export function useAuditoria() {
  return useDetailQuery<{ auditoria: AuditRow[]; actividad: ActividadRow[] }>(["auditoria"],
    () => fetch("/api/auditoria").then((r) => r.json()),
    true, STALE.MED)
}

export function useCodificadores() {
  return useDetailQuery<{ monedas: MonedaItem[]; unidadesMedida: UnidadItem[]; paises: PaisItem[]; categorias: CategoriaItem[]; comerciales: ComercialItem[] }>(["codificadores"],
    () => fetch("/api/codificadores").then((r) => r.json()),
    true, STALE.HIGH)
}

// ─── Auth ───────────────────────────────────────────────

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => authSrv.logout(),
    onSuccess: () => qc.clear(),
  })
}
