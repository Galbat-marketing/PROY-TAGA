import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/oferta.dart';
import '../../domain/repositories/oferta_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';
import '../models/oferta_model.dart';

class OfertaRepositoryImpl implements OfertaRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  OfertaRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, List<Oferta>>> getOfertas() async {
    try {
      final data = await _remote.query('ofertas',
        select: '*, clientes!left(nombre), codificador_comerciales!left(nombre)',
        order: 'created_at',
        ascending: false,
      );
      final ofertas = data.map((json) {
        final cliente = json['clientes'] as Map<String, dynamic>?;
        json['cliente_nombre'] = cliente?['nombre'];
        final comercial = json['codificador_comerciales'] as Map<String, dynamic>?;
        json['comercial_nombre'] = comercial?['nombre'];
        return OfertaModel.fromJson(json);
      }).toList();

      await _local.cacheData('ofertas', data);
      return Right(ofertas.map((m) => _toEntity(m)).toList());
    } catch (e) {
      final cached = await _local.getCachedData('ofertas');
      if (cached != null) {
        final ofertas = (cached as List).map((j) => _toEntity(OfertaModel.fromJson(j as Map<String, dynamic>))).toList();
        return Right(ofertas);
      }
      return Left(ServerFailure('Error al cargar ofertas'));
    }
  }

  @override
  Future<Either<Failure, Oferta>> getOferta(String id) async {
    try {
      final data = await _remote.query('ofertas',
        select: '*, clientes!left(nombre), codificador_comerciales!left(nombre), fichas_oferta(*, productos!left(nombre, codigo))',
        eq: 'id',
        eqValue: id,
      );
      if (data.isEmpty) return Left(ServerFailure('Oferta no encontrada'));
      final json = data.first;
      final cliente = json['clientes'] as Map<String, dynamic>?;
      json['cliente_nombre'] = cliente?['nombre'];
      final comercial = json['codificador_comerciales'] as Map<String, dynamic>?;
      json['comercial_nombre'] = comercial?['nombre'];
      final fichas = json['fichas_oferta'] as List?;
      if (fichas != null) {
        json['fichas'] = fichas.map((f) {
          final fJson = f as Map<String, dynamic>;
          final prod = fJson['productos'] as Map<String, dynamic>?;
          fJson['producto_nombre'] = prod?['nombre'];
          fJson['producto_codigo'] = prod?['codigo'];
          return fJson;
        }).toList();
      }
      return Right(_toEntity(OfertaModel.fromJson(json)));
    } catch (e) {
      return Left(ServerFailure('Error al cargar oferta'));
    }
  }

  @override
  Future<Either<Failure, Oferta>> crearOferta(Map<String, dynamic> data) async {
    try {
      final result = await _remote.insert('ofertas', data);
      return Right(_toEntity(OfertaModel.fromJson(result)));
    } catch (e) {
      return Left(ServerFailure('Error al crear oferta'));
    }
  }

  @override
  Future<Either<Failure, void>> actualizarEstado(String id, String estado) async {
    try {
      await _remote.update('ofertas', id, {'estado': estado});
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure('Error al actualizar estado'));
    }
  }

  Oferta _toEntity(OfertaModel m) => Oferta(
    id: m.id,
    folio: m.folio,
    clienteId: m.clienteId,
    clienteNombre: m.clienteNombre,
    comercialId: m.comercialId,
    comercialNombre: m.comercialNombre,
    fechaEmision: DateTime.parse(m.fechaEmision),
    fechaVigencia: m.fechaVigencia != null ? DateTime.tryParse(m.fechaVigencia!) : null,
    estado: m.estado,
    tipoOperacion: m.tipoOperacion,
    condicionesPago: m.condicionesPago,
    incoterm: m.incoterm,
    moneda: m.moneda,
    subtotal: m.subtotal,
    descuentoGlobal: m.descuentoGlobal,
    iva: m.iva,
    total: m.total,
    fichas: m.fichas?.map((f) => FichaOferta(
      id: f.id,
      ofertaId: f.ofertaId,
      productoId: f.productoId,
      productoNombre: f.productoNombre,
      productoCodigo: f.productoCodigo,
      cantidad: f.cantidad,
      unidadMedida: f.unidadMedida,
      precioUnitario: f.precioUnitario,
      descuento: f.descuento,
      subtotal: f.subtotal,
    )).toList(),
  );
}
