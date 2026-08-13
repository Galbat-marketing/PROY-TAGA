import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/proveedor.dart';
import '../../domain/repositories/proveedor_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';
import '../models/proveedor_model.dart';

class ProveedorRepositoryImpl implements ProveedorRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  ProveedorRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, List<Proveedor>>> getProveedores() async {
    try {
      final data = await _remote.query('proveedores',
        select: '*',
        order: 'nombre',
        ascending: true,
      );
      await _local.cacheData('proveedores', data);
      return Right(data.map((j) => _toEntity(ProveedorModel.fromJson(j))).toList());
    } catch (e) {
      final cached = await _local.getCachedData('proveedores');
      if (cached != null) {
        return Right((cached as List)
            .map((j) => _toEntity(ProveedorModel.fromJson(j as Map<String, dynamic>)))
            .toList());
      }
      return Left(ServerFailure('Error al cargar proveedores'));
    }
  }

  @override
  Future<Either<Failure, Proveedor>> getProveedor(String id) async {
    try {
      final data = await _remote.query('proveedores',
        select: '*',
        eq: 'id',
        eqValue: id,
      );
      if (data.isEmpty) return Left(ServerFailure('Proveedor no encontrado'));
      return Right(_toEntity(ProveedorModel.fromJson(data.first)));
    } catch (e) {
      return Left(ServerFailure('Error al cargar proveedor'));
    }
  }

  Proveedor _toEntity(ProveedorModel m) => Proveedor(
    id: m.id,
    codigo: m.codigo,
    nombre: m.nombre,
    rfc: m.rfc,
    email: m.email,
    telefono: m.telefono,
    pais: m.pais,
    monedaDefault: m.monedaDefault,
    condicionesPago: m.condicionesPago,
    tipoProveedor: m.tipoProveedor,
    rating: m.rating,
    activo: m.activo,
  );
}
