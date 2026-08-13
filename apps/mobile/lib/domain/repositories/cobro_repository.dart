import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/cobro.dart';

abstract class CobroRepository {
  Future<Either<Failure, List<Cobro>>> getCobros();
  Future<Either<Failure, Cobro>> getCobro(String id);
}
