import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/factura.dart';
import '../../domain/repositories/factura_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';
import '../models/factura_model.dart';

class FacturaRepositoryImpl implements FacturaRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  FacturaRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, List<Factura>>> getFacturas() async {
    try {
      final data = await _remote.query('facturas',
        select: '*, clientes!inner(nombre)',
        order: 'fecha_emision',
        ascending: false,
      );
      final facturas = data.map((json) {
        final cliente = json['clientes'] as Map<String, dynamic>?;
        json['cliente_nombre'] = cliente?['nombre'];
        return FacturaModel.fromJson(json);
      }).toList();
      await _local.cacheData('facturas', data);
      return Right(facturas.map((m) => _toEntity(m)).toList());
    } catch (e) {
      final cached = await _local.getCachedData('facturas');
      if (cached != null) {
        return Right((cached as List)
            .map((j) => _toEntity(FacturaModel.fromJson(j as Map<String, dynamic>)))
            .toList());
      }
      return Left(ServerFailure('Error al cargar facturas'));
    }
  }

  @override
  Future<Either<Failure, Factura>> getFactura(String id) async {
    try {
      final data = await _remote.query('facturas',
        select: '*, clientes!inner(nombre)',
        eq: 'id',
        eqValue: id,
      );
      if (data.isEmpty) return Left(ServerFailure('Factura no encontrada'));
      final json = data.first;
      final cliente = json['clientes'] as Map<String, dynamic>?;
      json['cliente_nombre'] = cliente?['nombre'];
      return Right(_toEntity(FacturaModel.fromJson(json)));
    } catch (e) {
      return Left(ServerFailure('Error al cargar factura'));
    }
  }

  Factura _toEntity(FacturaModel m) => Factura(
    id: m.id,
    folio: m.folio,
    ofertaId: m.ofertaId,
    clienteId: m.clienteId,
    clienteNombre: m.clienteNombre,
    tipo: m.tipo,
    subtotal: m.subtotal,
    iva: m.iva,
    total: m.total,
    moneda: m.moneda,
    fechaEmision: DateTime.parse(m.fechaEmision),
    fechaVencimiento: m.fechaVencimiento != null ? DateTime.tryParse(m.fechaVencimiento!) : null,
    estado: m.estado,
  );
}
