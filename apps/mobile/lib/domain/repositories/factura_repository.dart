import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/factura.dart';

abstract class FacturaRepository {
  Future<Either<Failure, List<Factura>>> getFacturas();
  Future<Either<Failure, Factura>> getFactura(String id);
}
