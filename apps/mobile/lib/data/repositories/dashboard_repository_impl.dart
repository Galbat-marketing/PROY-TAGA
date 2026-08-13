import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/dashboard_kpi.dart';
import '../../domain/repositories/dashboard_repository.dart';
import '../datasources/remote/supabase_datasource.dart';

class DashboardRepositoryImpl implements DashboardRepository {
  final SupabaseDataSource _remote;

  DashboardRepositoryImpl(this._remote);

  @override
  Future<Either<Failure, DashboardKPI>> getKPIs() async {
    try {
      final now = DateTime.now();
      final mesInicio = DateTime(now.year, now.month, 1).toIso8601String();
      final mesAnteriorInicio = DateTime(now.year, now.month - 1, 1).toIso8601String();
      final mesAnteriorFin = DateTime(now.year, now.month, 1).toIso8601String();

      // ── Ventas del mes actual (ofertas aceptadas/convertidas) ──
      final ventasMesData = await _remote.query('ofertas',
        select: 'total',
        order: 'created_at',
      );

      double totalVentasMes = 0;
      double totalVentasAnterior = 0;
      int ofertasActivas = 0;
      int ofertasNuevas = 0;
      final List<Map<String, dynamic>> ofertasRecientesRaw = [];

      for (final o in ventasMesData) {
        final createdAt = o['created_at'] as String? ?? '';
        final total = o['total'] != null ? double.tryParse(o['total'].toString()) ?? 0 : 0;
        final estado = o['estado'] as String? ?? '';

        if (createdAt >= mesInicio) {
          if (estado == 'aceptada' || estado == 'convertida') {
            totalVentasMes += total;
          }
          ofertasNuevas++;
        }
        if (createdAt >= mesAnteriorInicio && createdAt < mesAnteriorFin) {
          if (estado == 'aceptada' || estado == 'convertida') {
            totalVentasAnterior += total;
          }
        }
        if (estado == 'borrador' || estado == 'enviada') {
          ofertasActivas++;
        }
      }

      // ── Ofertas recientes (top 5) ──
      final ofertasRecientesData = await _remote.query('ofertas',
        select: 'id, folio, cliente_id, total, estado, comercial_id, created_at',
        order: 'created_at',
        ascending: false,
      );

      int count = 0;
      final List<OfertaReciente> ofertasRecientes = [];
      for (final o in ofertasRecientesData) {
        if (count >= 5) break;
        String? clienteNombre;
        String? comercialNombre;

        if (o['cliente_id'] != null) {
          final cliente = await _remote.getById('clientes', o['cliente_id'] as String);
          clienteNombre = cliente?['nombre'] as String?;
        }
        if (o['comercial_id'] != null) {
          final com = await _remote.getById('codificador_comerciales', o['comercial_id'] as String);
          comercialNombre = com?['nombre'] as String?;
        }

        ofertasRecientes.add(OfertaReciente(
          id: o['id'] as String,
          folio: o['folio'] as String? ?? '',
          clienteNombre: clienteNombre,
          total: o['total'] != null ? double.tryParse(o['total'].toString()) ?? 0 : 0,
          estado: o['estado'] as String? ?? '',
          comercialNombre: comercialNombre,
          createdAt: DateTime.tryParse(o['created_at'] as String? ?? '') ?? DateTime.now(),
        ));
        count++;
      }

      // ── Cobros del mes ──
      double totalCobradoMes = 0;
      double totalCobradoAnterior = 0;
      final cobrosData = await _remote.query('cobros',
        select: 'monto, fecha_cobro',
        order: 'fecha_cobro',
      );

      for (final c in cobrosData) {
        final fechaCobro = c['fecha_cobro'] as String? ?? '';
        final monto = c['monto'] != null ? double.tryParse(c['monto'].toString()) ?? 0 : 0;
        if (fechaCobro >= mesInicio) {
          totalCobradoMes += monto;
        } else if (fechaCobro >= mesAnteriorInicio && fechaCobro < mesAnteriorFin) {
          totalCobradoAnterior += monto;
        }
      }

      // ── Pendiente total (facturas - cobros) ──
      double pendienteTotal = 0;
      final facturasData = await _remote.query('facturas',
        select: 'id, total, estado',
      );

      for (final f in facturasData) {
        final estado = f['estado'] as String? ?? '';
        if (estado == 'pendiente' || estado == 'parcial') {
          final totalFactura = f['total'] != null ? double.tryParse(f['total'].toString()) ?? 0 : 0;
          final cobrosFactura = await _remote.query('cobros',
            select: 'monto',
            eq: 'factura_id',
            eqValue: f['id'] as String,
          );
          double cobrado = 0;
          for (final cf in cobrosFactura) {
            cobrado += cf['monto'] != null ? double.tryParse(cf['monto'].toString()) ?? 0 : 0;
          }
          pendienteTotal += totalFactura - cobrado;
        }
      }

      // ── Contenedores activos ──
      int contenedoresActivos = 0;
      int contenedoresAtrasados = 0;
      int contenedoresProximos = 0;
      final List<ContenedorResumen> contenedoresLista = [];

      final contenedoresData = await _remote.query('contenedores',
        select: 'id, numero_contenedor, estado, naviera, eta, puerto_origen, puerto_destino',
        order: 'eta',
      );

      for (final c in contenedoresData) {
        final estado = c['estado'] as String? ?? '';
        if (estado == 'entregado' || estado == 'cancelado') continue;

        contenedoresActivos++;
        final etaStr = c['eta'] as String?;
        DateTime? eta = etaStr != null ? DateTime.tryParse(etaStr) : null;

        if (eta != null) {
          if (eta.isBefore(now)) {
            contenedoresAtrasados++;
          }
          if (!eta.isBefore(now) && eta.isBefore(now.add(const Duration(days: 7)))) {
            contenedoresProximos++;
          }
        }

        contenedoresLista.add(ContenedorResumen(
          id: c['id'] as String,
          numeroContenedor: c['numero_contenedor'] as String? ?? '',
          estado: estado,
          naviera: c['naviera'] as String?,
          eta: eta,
          puertoOrigen: c['puerto_origen'] as String?,
          puertoDestino: c['puerto_destino'] as String?,
        ));
      }

      // ── Notificaciones no leídas ──
      int notificacionesNoLeidas = 0;
      try {
        final notifData = await _remote.query('notificaciones',
          select: 'id',
          eq: 'leida',
          eqValue: false,
        );
        notificacionesNoLeidas = notifData.length;
      } catch (_) {}

      final variacionVentas = totalVentasAnterior > 0
          ? ((totalVentasMes - totalVentasAnterior) / totalVentasAnterior) * 100
          : 0;
      final variacionCobrado = totalCobradoAnterior > 0
          ? ((totalCobradoMes - totalCobradoAnterior) / totalCobradoAnterior) * 100
          : 0;

      return Right(DashboardKPI(
        ventasMes: totalVentasMes,
        cobradoMes: totalCobradoMes,
        pendienteTotal: pendienteTotal,
        variacionVentas: variacionVentas,
        variacionCobrado: variacionCobrado,
        ofertasActivas: ofertasActivas,
        ofertasNuevas: ofertasNuevas,
        ofertasRecientes: ofertasRecientes,
        contenedoresActivos: contenedoresActivos,
        contenedoresProximos: contenedoresProximos,
        contenedoresAtrasados: contenedoresAtrasados,
        contenedoresLista: contenedoresLista,
        notificacionesNoLeidas: notificacionesNoLeidas,
      ));
    } catch (e) {
      return Left(ServerFailure('Error al cargar KPIs del dashboard'));
    }
  }
}
