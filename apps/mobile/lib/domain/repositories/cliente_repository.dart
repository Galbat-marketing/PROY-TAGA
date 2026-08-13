import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/cliente.dart';

abstract class ClienteRepository {
  Future<Either<Failure, List<Cliente>>> getClientes({String? search});
  Future<Either<Failure, Cliente>> getCliente(String id);
}
