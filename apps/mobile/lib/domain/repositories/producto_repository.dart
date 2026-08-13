import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/producto.dart';

abstract class ProductoRepository {
  Future<Either<Failure, List<Producto>>> getProductos({String? search});
  Future<Either<Failure, Producto>> getProducto(String id);
  Future<Either<Failure, List<Producto>>> searchProductos(String query);
}
