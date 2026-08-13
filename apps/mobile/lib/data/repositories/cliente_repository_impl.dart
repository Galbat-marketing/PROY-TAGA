import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/cliente.dart';
import '../../domain/repositories/cliente_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';
import '../models/cliente_model.dart';

class ClienteRepositoryImpl implements ClienteRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  ClienteRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, List<Cliente>>> getClientes({String? search}) async {
    try {
      final data = await _remote.query('clientes', select: '*, usuarios!left(nombre, apellido)');
      final clientes = data.map((json) {
        final user = json['usuarios'] as Map<String, dynamic>?;
        if (user != null) {
          json['vendedor_nombre'] = '${user['nombre'] ?? ''} ${user['apellido'] ?? ''}'.trim();
        }
        return ClienteModel.fromJson(json);
      }).toList();

      await _local.cacheData('clientes', data);

      return Right(clientes.map((m) => _toEntity(m)).toList());
    } catch (e) {
      final cached = await _local.getCachedData('clientes');
      if (cached != null) {
        final clientes = (cached as List).map((j) => _toEntity(ClienteModel.fromJson(j as Map<String, dynamic>))).toList();
        return Right(clientes);
      }
      return Left(ServerFailure('Error al cargar clientes'));
    }
  }

  @override
  Future<Either<Failure, Cliente>> getCliente(String id) async {
    try {
      final data = await _remote.getById('clientes', id);
      if (data == null) return Left(ServerFailure('Cliente no encontrado'));
      return Right(_toEntity(ClienteModel.fromJson(data)));
    } catch (e) {
      return Left(ServerFailure('Error al cargar cliente'));
    }
  }

  Cliente _toEntity(ClienteModel m) => Cliente(
    id: m.id,
    codigo: m.codigo,
    nombre: m.nombre,
    rfc: m.rfc,
    email: m.email,
    telefono: m.telefono,
    pais: m.pais,
    monedaDefault: m.monedaDefault,
    limiteCredito: m.limiteCredito,
    condicionesPago: m.condicionesPago,
    vendedorNombre: m.vendedorNombre,
    rating: m.rating,
    activo: m.activo,
  );
}
