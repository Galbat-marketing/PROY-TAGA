import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/importadora.dart';
import '../../domain/repositories/importadora_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';
import '../models/importadora_model.dart';

class ImportadoraRepositoryImpl implements ImportadoraRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  ImportadoraRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, List<Importadora>>> getImportadoras() async {
    try {
      final data = await _remote.query('importadoras',
        select: '*',
        order: 'created_at',
        ascending: false,
      );
      await _local.cacheData('importadoras', data);
      return Right(data.map((j) => _toEntity(ImportadoraModel.fromJson(j))).toList());
    } catch (e) {
      final cached = await _local.getCachedData('importadoras');
      if (cached != null) {
        return Right((cached as List)
            .map((j) => _toEntity(ImportadoraModel.fromJson(j as Map<String, dynamic>)))
            .toList());
      }
      return Left(ServerFailure('Error al cargar importadoras'));
    }
  }

  @override
  Future<Either<Failure, Importadora>> getImportadora(String id) async {
    try {
      final data = await _remote.query('importadoras',
        select: '*',
        eq: 'id',
        eqValue: id,
      );
      if (data.isEmpty) return Left(ServerFailure('Importadora no encontrada'));
      return Right(_toEntity(ImportadoraModel.fromJson(data.first)));
    } catch (e) {
      return Left(ServerFailure('Error al cargar importadora'));
    }
  }

  Importadora _toEntity(ImportadoraModel m) => Importadora(
    id: m.id,
    codigo: m.codigo,
    nombre: m.nombre,
    rfc: m.rfc,
    direccion: m.direccion,
    aduanaAsignada: m.aduanaAsignada,
    agenteAduanal: m.agenteAduanal,
    email: m.email,
    telefono: m.telefono,
    activo: m.activo,
  );
}
