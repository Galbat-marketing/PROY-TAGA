import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/pago.dart';
import '../../domain/repositories/pago_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';
import '../models/pago_model.dart';

class PagoRepositoryImpl implements PagoRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  PagoRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, List<Pago>>> getPagos() async {
    try {
      final data = await _remote.query('pagos',
        select: '*, proveedores!left(nombre)',
        order: 'fecha_pago',
        ascending: false,
      );
      final pagos = data.map((json) {
        final proveedor = json['proveedores'] as Map<String, dynamic>?;
        json['proveedor_nombre'] = proveedor?['nombre'];
        return PagoModel.fromJson(json);
      }).toList();
      await _local.cacheData('pagos', data);
      return Right(pagos.map((m) => _toEntity(m)).toList());
    } catch (e) {
      final cached = await _local.getCachedData('pagos');
      if (cached != null) {
        return Right((cached as List)
            .map((j) => _toEntity(PagoModel.fromJson(j as Map<String, dynamic>)))
            .toList());
      }
      return Left(ServerFailure('Error al cargar pagos'));
    }
  }

  @override
  Future<Either<Failure, Pago>> getPago(String id) async {
    try {
      final data = await _remote.query('pagos',
        select: '*, proveedores!left(nombre)',
        eq: 'id',
        eqValue: id,
      );
      if (data.isEmpty) return Left(ServerFailure('Pago no encontrado'));
      final json = data.first;
      final proveedor = json['proveedores'] as Map<String, dynamic>?;
      json['proveedor_nombre'] = proveedor?['nombre'];
      return Right(_toEntity(PagoModel.fromJson(json)));
    } catch (e) {
      return Left(ServerFailure('Error al cargar pago'));
    }
  }

  @override
  Future<Either<Failure, void>> aprobarPago(String id, {
    required String metodoPago,
    required String referencia,
  }) async {
    try {
      await _remote.update('pagos', id, {
        'estado': 'aprobado',
        'metodo_pago': metodoPago,
        'referencia': referencia,
        'updated_at': DateTime.now().toIso8601String(),
      });
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure('Error al aprobar pago'));
    }
  }

  @override
  Future<Either<Failure, void>> rechazarPago(String id) async {
    try {
      await _remote.update('pagos', id, {
        'estado': 'rechazado',
        'updated_at': DateTime.now().toIso8601String(),
      });
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure('Error al rechazar pago'));
    }
  }

  @override
  Future<Either<Failure, void>> eliminarPago(String id) async {
    try {
      await _remote.update('pagos', id, {
        'deleted_at': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      });
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure('Error al eliminar pago'));
    }
  }

  Pago _toEntity(PagoModel m) => Pago(
    id: m.id,
    proveedorId: m.proveedorId,
    beneficiario: m.beneficiario,
    proveedorNombre: m.proveedorNombre,
    monto: m.monto,
    moneda: m.moneda,
    tipoCambio: m.tipoCambio,
    fechaPago: DateTime.parse(m.fechaPago),
    estado: m.estado,
    metodoPago: m.metodoPago,
    referencia: m.referencia,
    pagadorNombre: m.pagadorNombre,
    notas: m.notas,
  );
}
