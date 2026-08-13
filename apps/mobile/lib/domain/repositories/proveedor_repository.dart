import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/proveedor.dart';

abstract class ProveedorRepository {
  Future<Either<Failure, List<Proveedor>>> getProveedores();
  Future<Either<Failure, Proveedor>> getProveedor(String id);
}
