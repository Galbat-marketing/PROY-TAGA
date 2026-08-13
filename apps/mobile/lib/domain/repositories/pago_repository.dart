import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/pago.dart';

abstract class PagoRepository {
  Future<Either<Failure, List<Pago>>> getPagos();
  Future<Either<Failure, Pago>> getPago(String id);

  /// Aprueba un pago con método de pago y referencia
  Future<Either<Failure, void>> aprobarPago(String id, {required String metodoPago, required String referencia});

  /// Rechaza un pago
  Future<Either<Failure, void>> rechazarPago(String id);

  /// Elimina un pago (soft delete)
  Future<Either<Failure, void>> eliminarPago(String id);
}
