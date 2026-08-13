import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/remote/supabase_datasource.dart';
import '../../data/datasources/local/local_storage_datasource.dart';
import '../../data/repositories/cliente_repository_impl.dart';
import '../../data/repositories/cobro_repository_impl.dart';
import '../../data/repositories/contenedor_repository_impl.dart';
import '../../data/repositories/dashboard_repository_impl.dart';
import '../../data/repositories/comercial_repository_impl.dart';
import '../../data/repositories/documento_repository_impl.dart';
import '../../data/repositories/factura_repository_impl.dart';
import '../../data/repositories/importadora_repository_impl.dart';
import '../../data/repositories/notificacion_repository_impl.dart';
import '../../data/repositories/oferta_repository_impl.dart';
import '../../data/repositories/pago_repository_impl.dart';
import '../../data/repositories/producto_repository_impl.dart';
import '../../data/repositories/proveedor_repository_impl.dart';
import '../../domain/entities/cliente.dart';
import '../../domain/entities/cobro.dart';
import '../../domain/entities/comercial.dart';
import '../../domain/entities/contenedor.dart';
import '../../domain/entities/dashboard_kpi.dart';
import '../../domain/entities/documento.dart';
import '../../domain/entities/factura.dart';
import '../../domain/entities/historial_documento.dart';
import '../../domain/entities/importadora.dart';
import '../../domain/entities/notificacion.dart';
import '../../domain/entities/oferta.dart';
import '../../domain/entities/pago.dart';
import '../../domain/entities/pago_comision.dart';
import '../../domain/entities/producto.dart';
import '../../domain/entities/proveedor.dart';
import '../../domain/entities/version_documento.dart';
import '../../domain/repositories/cliente_repository.dart';
import '../../domain/repositories/cobro_repository.dart';
import '../../domain/repositories/comercial_repository.dart';
import '../../domain/repositories/contenedor_repository.dart';
import '../../domain/repositories/dashboard_repository.dart';
import '../../domain/repositories/documento_repository.dart';
import '../../domain/repositories/factura_repository.dart';
import '../../domain/repositories/importadora_repository.dart';
import '../../domain/repositories/notificacion_repository.dart';
import '../../domain/repositories/oferta_repository.dart';
import '../../domain/repositories/pago_repository.dart';
import '../../domain/repositories/producto_repository.dart';
import '../../domain/repositories/proveedor_repository.dart';
import 'auth_provider.dart';

// ─── Repository Providers ───

final clienteRepositoryProvider = Provider<ClienteRepository>((ref) {
  return ClienteRepositoryImpl(
    ref.watch(supabaseDataSourceProvider),
    ref.watch(localStorageDataSourceProvider),
  );
});

final comercialRepositoryProvider = Provider<ComercialRepository>((ref) {
  return ComercialRepositoryImpl(
    ref.watch(supabaseDataSourceProvider),
    ref.watch(localStorageDataSourceProvider),
  );
});

final pagoRepositoryProvider = Provider<PagoRepository>((ref) {
  return PagoRepositoryImpl(
    ref.watch(supabaseDataSourceProvider),
    ref.watch(localStorageDataSourceProvider),
  );
});

final facturaRepositoryProvider = Provider<FacturaRepository>((ref) {
  return FacturaRepositoryImpl(
    ref.watch(supabaseDataSourceProvider),
    ref.watch(localStorageDataSourceProvider),
  );
});

final importadoraRepositoryProvider = Provider<ImportadoraRepository>((ref) {
  return ImportadoraRepositoryImpl(
    ref.watch(supabaseDataSourceProvider),
    ref.watch(localStorageDataSourceProvider),
  );
});

final proveedorRepositoryProvider = Provider<ProveedorRepository>((ref) {
  return ProveedorRepositoryImpl(
    ref.watch(supabaseDataSourceProvider),
    ref.watch(localStorageDataSourceProvider),
  );
});

final cobroRepositoryProvider = Provider<CobroRepository>((ref) {
  return CobroRepositoryImpl(
    ref.watch(supabaseDataSourceProvider),
    ref.watch(localStorageDataSourceProvider),
  );
});

final contenedorRepositoryProvider = Provider<ContenedorRepository>((ref) {
  return ContenedorRepositoryImpl(
    ref.watch(supabaseDataSourceProvider),
    ref.watch(localStorageDataSourceProvider),
  );
});

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepositoryImpl(ref.watch(supabaseDataSourceProvider));
});

final documentoRepositoryProvider = Provider<DocumentoRepository>((ref) {
  return DocumentoRepositoryImpl(
    ref.watch(supabaseDataSourceProvider),
    ref.watch(localStorageDataSourceProvider),
  );
});

final notificacionRepositoryProvider = Provider<NotificacionRepository>((ref) {
  return NotificacionRepositoryImpl(
    ref.watch(supabaseDataSourceProvider),
    ref.watch(localStorageDataSourceProvider),
  );
});

final ofertaRepositoryProvider = Provider<OfertaRepository>((ref) {
  return OfertaRepositoryImpl(
    ref.watch(supabaseDataSourceProvider),
    ref.watch(localStorageDataSourceProvider),
  );
});

final productoRepositoryProvider = Provider<ProductoRepository>((ref) {
  return ProductoRepositoryImpl(
    ref.watch(supabaseDataSourceProvider),
    ref.watch(localStorageDataSourceProvider),
  );
});

// ─── Data Providers ───

// Dashboard / KPIs
final dashboardKPIProvider = FutureProvider.autoDispose<DashboardKPI>((ref) async {
  final repo = ref.watch(dashboardRepositoryProvider);
  final result = await repo.getKPIs();
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

// Clientes
final clientesProvider = FutureProvider.autoDispose<List<Cliente>>((ref) async {
  final repo = ref.watch(clienteRepositoryProvider);
  final result = await repo.getClientes();
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

final clienteProvider = FutureProvider.autoDispose.family<Cliente, String>((ref, id) async {
  final repo = ref.watch(clienteRepositoryProvider);
  final result = await repo.getCliente(id);
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

// Contenedores
final contenedoresProvider = FutureProvider.autoDispose<List<Contenedor>>((ref) async {
  final repo = ref.watch(contenedorRepositoryProvider);
  final result = await repo.getContenedores();
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

final contenedorProvider = FutureProvider.autoDispose.family<Contenedor, String>((ref, id) async {
  final repo = ref.watch(contenedorRepositoryProvider);
  final result = await repo.getContenedor(id);
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

// Documentos
final documentosProvider = FutureProvider.autoDispose<List<Documento>>((ref) async {
  final repo = ref.watch(documentoRepositoryProvider);
  final result = await repo.getDocumentos();
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

final documentoProvider = FutureProvider.autoDispose.family<Documento, String>((ref, id) async {
  final repo = ref.watch(documentoRepositoryProvider);
  final result = await repo.getDocumento(id);
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

final versionHistoryProvider = FutureProvider.autoDispose.family<List<VersionDocumento>, String>((ref, documentoId) async {
  final repo = ref.watch(documentoRepositoryProvider);
  final result = await repo.getVersiones(documentoId);
  return result.fold((failure) => [], (data) => data);
});

final historialProvider = FutureProvider.autoDispose.family<List<HistorialDocumento>, String>((ref, documentoId) async {
  final repo = ref.watch(documentoRepositoryProvider);
  final result = await repo.getHistorial(documentoId);
  return result.fold((failure) => [], (data) => data);
});

// Cobros
final cobrosProvider = FutureProvider.autoDispose<List<Cobro>>((ref) async {
  final repo = ref.watch(cobroRepositoryProvider);
  final result = await repo.getCobros();
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

final cobroProvider = FutureProvider.autoDispose.family<Cobro?, String>((ref, id) async {
  final repo = ref.watch(cobroRepositoryProvider);
  final result = await repo.getCobro(id);
  return result.fold((failure) => null, (data) => data);
});

// Notificaciones
final notificacionesProvider = FutureProvider.autoDispose<List<Notificacion>>((ref) async {
  final repo = ref.watch(notificacionRepositoryProvider);
  final result = await repo.getNotificaciones();
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

final notificacionesNoLeidasProvider = FutureProvider.autoDispose<int>((ref) async {
  final repo = ref.watch(notificacionRepositoryProvider);
  final result = await repo.getNoLeidas();
  return result.fold((failure) => 0, (data) => data);
});

// Ofertas
final ofertasProvider = FutureProvider.autoDispose<List<Oferta>>((ref) async {
  final repo = ref.watch(ofertaRepositoryProvider);
  final result = await repo.getOfertas();
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

final ofertaProvider = FutureProvider.autoDispose.family<Oferta, String>((ref, id) async {
  final repo = ref.watch(ofertaRepositoryProvider);
  final result = await repo.getOferta(id);
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

// Productos
final productosProvider = FutureProvider.autoDispose<List<Producto>>((ref) async {
  final repo = ref.watch(productoRepositoryProvider);
  final result = await repo.getProductos();
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

final productoProvider = FutureProvider.autoDispose.family<Producto, String>((ref, id) async {
  final repo = ref.watch(productoRepositoryProvider);
  final result = await repo.getProducto(id);
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

// Reportes
final generarReporteProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, Map<String, dynamic>>((ref, params) async {
  final repo = ref.watch(documentoRepositoryProvider);
  final result = await repo.generarReporte(
    params['tipo'] as String,
    params['formato'] as String,
    params['filtro'] as Map<String, dynamic>?,
  );
  return result.fold(
    (failure) => throw Exception(failure.message),
    (data) => data,
  );
});

// ── Comerciales ──

final comercialesProvider = FutureProvider.autoDispose<List<Comercial>>((ref) async {
  final repo = ref.watch(comercialRepositoryProvider);
  final result = await repo.getComerciales();
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

final comercialProvider = FutureProvider.autoDispose.family<Comercial?, String>((ref, id) async {
  final repo = ref.watch(comercialRepositoryProvider);
  final result = await repo.getComercial(id);
  return result.fold((failure) => null, (data) => data);
});

final comisionesSemanalesProvider = FutureProvider.autoDispose.family<List<PagoComision>, String>((ref, comercialId) async {
  final repo = ref.watch(comercialRepositoryProvider);
  final result = await repo.getComisionesSemanales(comercialId);
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

// ── Pagos ──

final pagosProvider = FutureProvider.autoDispose<List<Pago>>((ref) async {
  final repo = ref.watch(pagoRepositoryProvider);
  final result = await repo.getPagos();
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

final pagoProvider = FutureProvider.autoDispose.family<Pago?, String>((ref, id) async {
  final repo = ref.watch(pagoRepositoryProvider);
  final result = await repo.getPago(id);
  return result.fold((failure) => null, (data) => data);
});

// ── Facturas ──

final facturasProvider = FutureProvider.autoDispose<List<Factura>>((ref) async {
  final repo = ref.watch(facturaRepositoryProvider);
  final result = await repo.getFacturas();
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

final facturaProvider = FutureProvider.autoDispose.family<Factura?, String>((ref, id) async {
  final repo = ref.watch(facturaRepositoryProvider);
  final result = await repo.getFactura(id);
  return result.fold((failure) => null, (data) => data);
});

// ── Importadoras ──

final importadorasProvider = FutureProvider.autoDispose<List<Importadora>>((ref) async {
  final repo = ref.watch(importadoraRepositoryProvider);
  final result = await repo.getImportadoras();
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

final importadoraProvider = FutureProvider.autoDispose.family<Importadora?, String>((ref, id) async {
  final repo = ref.watch(importadoraRepositoryProvider);
  final result = await repo.getImportadora(id);
  return result.fold((failure) => null, (data) => data);
});

// ── Proveedores ──

final proveedoresProvider = FutureProvider.autoDispose<List<Proveedor>>((ref) async {
  final repo = ref.watch(proveedorRepositoryProvider);
  final result = await repo.getProveedores();
  return result.fold((failure) => throw Exception(failure.message), (data) => data);
});

final proveedorProvider = FutureProvider.autoDispose.family<Proveedor?, String>((ref, id) async {
  final repo = ref.watch(proveedorRepositoryProvider);
  final result = await repo.getProveedor(id);
  return result.fold((failure) => null, (data) => data);
});
