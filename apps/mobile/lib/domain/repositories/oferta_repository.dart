import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/oferta.dart';

abstract class OfertaRepository {
  Future<Either<Failure, List<Oferta>>> getOfertas();
  Future<Either<Failure, Oferta>> getOferta(String id);
  Future<Either<Failure, Oferta>> crearOferta(Map<String, dynamic> data);
  Future<Either<Failure, void>> actualizarEstado(String id, String estado);
}
