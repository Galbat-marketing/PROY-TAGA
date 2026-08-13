import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/comercial.dart';
import '../../domain/entities/pago_comision.dart';
import '../../domain/repositories/comercial_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';
import '../models/comercial_model.dart';

class ComercialRepositoryImpl implements ComercialRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  ComercialRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, List<Comercial>>> getComerciales() async {
    try {
      final data = await _remote.query('codificador_comerciales',
        select: '*',
        order: 'codigo',
        ascending: true,
      );
      await _local.cacheData('comerciales', data);
      return Right(data.map((j) => _toEntity(ComercialModel.fromJson(j))).toList());
    } catch (e) {
      final cached = await _local.getCachedData('comerciales');
      if (cached != null) {
        return Right((cached as List)
            .map((j) => _toEntity(ComercialModel.fromJson(j as Map<String, dynamic>)))
            .toList());
      }
      return Left(ServerFailure('Error al cargar comerciales'));
    }
  }

  @override
  Future<Either<Failure, Comercial>> getComercial(String id) async {
    try {
      final data = await _remote.query('codificador_comerciales',
        select: '*',
        eq: 'id',
        eqValue: id,
      );
      if (data.isEmpty) return Left(ServerFailure('Comercial no encontrado'));
      return Right(_toEntity(ComercialModel.fromJson(data.first)));
    } catch (e) {
      return Left(ServerFailure('Error al cargar comercial'));
    }
  }

  @override
  Future<Either<Failure, List<PagoComision>>> getComisionesSemanales(String comercialId) async {
    try {
      // 1. Obtener ofertas aceptadas/convertidas del comercial
      final ofertas = await _remote.query('ofertas',
        select: 'id, total, moneda, facturas!inner(id, cobros!inner(fecha_cobro))',
        order: 'created_at',
        ascending: false,
      );

      // 2. Obtener pagos de comisiones ya registrados
      final pagosData = await _remote.query('pago_comisiones',
        select: '*',
        eq: 'comercial_id',
        eqValue: comercialId,
      );

      final pagosMap = <String, Map<String, dynamic>>{};
      for (final p in pagosData) {
        final semana = p['semana_inicio'] as String?;
        if (semana != null) {
          pagosMap[semana] = p;
        }
      }

      // 3. Agrupar ofertas por semana de cobro
      final semanas = <String, double>{};
      final ventasPorSemana = <String, int>{};

      for (final o in ofertas) {
        final facturas = o['facturas'] as List<dynamic>?;
        if (facturas == null || facturas.isEmpty) continue;
        final cobros = (facturas.first as Map<String, dynamic>)['cobros'] as List<dynamic>?;
        if (cobros == null || cobros.isEmpty) continue;
        final fechaCobro = (cobros.first as Map<String, dynamic>)['fecha_cobro'] as String?;
        if (fechaCobro == null) continue;

        final key = _getMonday(DateTime.parse(fechaCobro));
        final total = (o['total'] as num?)?.toDouble() ?? 0;

        semanas[key] = (semanas[key] ?? 0) + total;
        ventasPorSemana[key] = (ventasPorSemana[key] ?? 0) + 1;
      }

      // 4. Construir resultado
      final result = <PagoComision>[];
      final sortedKeys = semanas.keys.toList()..sort((a, b) => b.compareTo(a));

      for (final key in sortedKeys) {
        final totalVentas = semanas[key]!;
        final comision = (totalVentas * 0.01 * 100).round() / 100;
        final pagoExistente = pagosMap[key];

        result.add(PagoComision(
          semanaInicio: key,
          ventas: ventasPorSemana[key] ?? 0,
          totalVentas: totalVentas,
          comision: comision,
          pagoId: pagoExistente?['id'] as String?,
          estado: pagoExistente?['estado'] as String? ?? 'pendiente',
          fechaPago: pagoExistente?['fecha_pago'] != null
              ? DateTime.tryParse(pagoExistente!['fecha_pago'] as String)
              : null,
        ));
      }

      return Right(result);
    } catch (e) {
      return Left(ServerFailure('Error al calcular comisiones'));
    }
  }

  @override
  Future<Either<Failure, void>> marcarComisionPagada(
    String comercialId, String semanaInicio, double monto) async {
    try {
      // Verificar si ya existe un pago para esta semana
      final existente = await _remote.query('pago_comisiones',
        select: 'id',
        eq: 'comercial_id',
        eqValue: comercialId,
      );

      final yaPagado = existente.any((p) => p['semana_inicio'] == semanaInicio);

      if (yaPagado) {
        // Actualizar estado a realizado
        final pago = existente.firstWhere((p) => p['semana_inicio'] == semanaInicio);
        await _remote.update('pago_comisiones', pago['id'] as String, {
          'estado': 'realizado',
          'fecha_pago': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
        });
      } else {
        // Crear nuevo registro
        await _remote.insert('pago_comisiones', {
          'comercial_id': comercialId,
          'semana_inicio': semanaInicio,
          'monto': monto,
          'estado': 'realizado',
          'fecha_pago': DateTime.now().toIso8601String(),
        });
      }

      return const Right(null);
    } catch (e) {
      return Left(ServerFailure('Error al marcar comisión como pagada'));
    }
  }

  String _getMonday(DateTime date) {
    final d = DateTime(date.year, date.month, date.day);
    final day = d.weekday; // Monday=1, Sunday=7 in Dart
    final diff = day - 1;
    final monday = d.subtract(Duration(days: diff));
    return monday.toIso8601String().split('T')[0];
  }

  Comercial _toEntity(ComercialModel m) => Comercial(
    id: m.id,
    codigo: m.codigo,
    nombre: m.nombre,
    activo: m.activo,
  );
}
