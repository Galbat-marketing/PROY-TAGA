import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/notificacion.dart';

abstract class NotificacionRepository {
  Future<Either<Failure, List<Notificacion>>> getNotificaciones();
  Future<Either<Failure, void>> marcarLeida(String id);
  Future<Either<Failure, int>> getNoLeidas();
}
