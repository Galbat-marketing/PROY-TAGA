import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/importadora.dart';

abstract class ImportadoraRepository {
  Future<Either<Failure, List<Importadora>>> getImportadoras();
  Future<Either<Failure, Importadora>> getImportadora(String id);
}
