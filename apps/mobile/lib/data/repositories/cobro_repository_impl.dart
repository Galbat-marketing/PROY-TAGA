import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/cobro.dart';
import '../../domain/repositories/cobro_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';
import '../models/cobro_model.dart';

class CobroRepositoryImpl implements CobroRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  CobroRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, List<Cobro>>> getCobros() async {
    try {
      final data = await _remote.query('cobros',
        select: '*, facturas!left(folio, clientes!left(nombre))',
        order: 'fecha_cobro',
        ascending: false,
      );
      final cobros = data.map((json) {
        final factura = json['facturas'] as Map<String, dynamic>?;
        json['factura_folio'] = factura?['folio'];
        json['cliente_nombre'] = (factura?['clientes'] as Map<String, dynamic>?)?['nombre'];
        return CobroModel.fromJson(json);
      }).toList();
      await _local.cacheData('cobros', data);
      return Right(cobros.map((m) => _toEntity(m)).toList());
    } catch (e) {
      final cached = await _local.getCachedData('cobros');
      if (cached != null) {
        return Right((cached as List)
            .map((j) => _toEntity(CobroModel.fromJson(j as Map<String, dynamic>)))
            .toList());
      }
      return Left(ServerFailure('Error al cargar cobros'));
    }
  }

  @override
  Future<Either<Failure, Cobro>> getCobro(String id) async {
    try {
      final data = await _remote.query('cobros',
        select: '*, facturas!left(folio, clientes!left(nombre))',
        eq: 'id',
        eqValue: id,
      );
      if (data.isEmpty) return Left(ServerFailure('Cobro no encontrado'));
      final json = data.first;
      final factura = json['facturas'] as Map<String, dynamic>?;
      json['factura_folio'] = factura?['folio'];
      json['cliente_nombre'] = (factura?['clientes'] as Map<String, dynamic>?)?['nombre'];
      return Right(_toEntity(CobroModel.fromJson(json)));
    } catch (e) {
      return Left(ServerFailure('Error al cargar cobro'));
    }
  }

  Cobro _toEntity(CobroModel m) => Cobro(
    id: m.id,
    facturaId: m.facturaId,
    monto: m.monto,
    moneda: m.moneda,
    fechaCobro: DateTime.parse(m.fechaCobro),
    metodoPago: m.metodoPago,
    referencia: m.referencia,
    cobradorNombre: m.cobradorNombre,
    notas: m.notas,
    facturaFolio: m.facturaFolio,
    clienteNombre: m.clienteNombre,
  );
}
