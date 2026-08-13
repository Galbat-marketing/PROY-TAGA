import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/contenedor.dart';
import '../../domain/repositories/contenedor_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';
import '../models/contenedor_model.dart';

class ContenedorRepositoryImpl implements ContenedorRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  ContenedorRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, List<Contenedor>>> getContenedores() async {
    try {
      final data = await _remote.query('contenedores',
        select: '*, embarques(*)',
        order: 'created_at',
        ascending: false,
      );
      final contenedores = data.map((json) => ContenedorModel.fromJson(json)).toList();
      await _local.cacheData('contenedores', data);
      return Right(contenedores.map((m) => _toEntity(m)).toList());
    } catch (e) {
      final cached = await _local.getCachedData('contenedores');
      if (cached != null) {
        final contenedores = (cached as List)
            .map((j) => _toEntity(ContenedorModel.fromJson(j as Map<String, dynamic>)))
            .toList();
        return Right(contenedores);
      }
      return Left(ServerFailure('Error al cargar contenedores'));
    }
  }

  @override
  Future<Either<Failure, Contenedor>> getContenedor(String id) async {
    try {
      final data = await _remote.query('contenedores',
        select: '*, embarques(*)',
        eq: 'id',
        eqValue: id,
      );
      if (data.isEmpty) return Left(ServerFailure('Contenedor no encontrado'));
      return Right(_toEntity(ContenedorModel.fromJson(data.first)));
    } catch (e) {
      return Left(ServerFailure('Error al cargar contenedor'));
    }
  }

  Contenedor _toEntity(ContenedorModel m) => Contenedor(
    id: m.id,
    numeroContenedor: m.numeroContenedor,
    tipo: m.tipo,
    tamano: m.tamano,
    booking: m.booking,
    naviera: m.naviera,
    importadoraNombre: m.importadoraNombre,
    eta: m.eta != null ? DateTime.tryParse(m.eta!) : null,
    etd: m.etd != null ? DateTime.tryParse(m.etd!) : null,
    puertoOrigen: m.puertoOrigen,
    puertoDestino: m.puertoDestino,
    estado: m.estado,
    embarques: m.embarques?.map((e) => Embarque(
      id: e.id,
      contenedorId: e.contenedorId,
      estado: e.estado,
      ubicacionActual: e.ubicacionActual,
      fechaEvento: DateTime.parse(e.fechaEvento),
      descripcion: e.descripcion,
    )).toList(),
  );
}
