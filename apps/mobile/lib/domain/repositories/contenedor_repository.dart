import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/contenedor.dart';

abstract class ContenedorRepository {
  Future<Either<Failure, List<Contenedor>>> getContenedores();
  Future<Either<Failure, Contenedor>> getContenedor(String id);
}
