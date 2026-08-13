import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/comercial.dart';
import '../entities/pago_comision.dart';

abstract class ComercialRepository {
  Future<Either<Failure, List<Comercial>>> getComerciales();
  Future<Either<Failure, Comercial>> getComercial(String id);

  /// Obtiene las comisiones semanales de un comercial (1% de ventas cobradas)
  Future<Either<Failure, List<PagoComision>>> getComisionesSemanales(String comercialId);

  /// Marca una comisión semanal como pagada (crea el registro en pago_comisiones)
  Future<Either<Failure, void>> marcarComisionPagada(String comercialId, String semanaInicio, double monto);
}
