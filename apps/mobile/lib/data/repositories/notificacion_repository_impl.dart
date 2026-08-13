import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/notificacion.dart';
import '../../domain/repositories/notificacion_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';
import '../models/notificacion_model.dart';

class NotificacionRepositoryImpl implements NotificacionRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  NotificacionRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, List<Notificacion>>> getNotificaciones() async {
    try {
      final data = await _remote.query('notificaciones',
        order: 'created_at',
        ascending: false,
      );
      await _local.cacheData('notificaciones', data);
      return Right(data.map((j) => _toEntity(NotificacionModel.fromJson(j))).toList());
    } catch (e) {
      final cached = await _local.getCachedData('notificaciones');
      if (cached != null) {
        return Right((cached as List)
            .map((j) => _toEntity(NotificacionModel.fromJson(j as Map<String, dynamic>)))
            .toList());
      }
      return Left(ServerFailure('Error al cargar notificaciones'));
    }
  }

  @override
  Future<Either<Failure, void>> marcarLeida(String id) async {
    try {
      await _remote.update('notificaciones', id, {'leida': true, 'fecha_lectura': DateTime.now().toIso8601String()});
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure('Error al marcar notificación'));
    }
  }

  @override
  Future<Either<Failure, int>> getNoLeidas() async {
    try {
      final data = await _remote.query('notificaciones',
        select: 'id',
        eq: 'leida',
        eqValue: false,
      );
      return Right(data.length);
    } catch (e) {
      return const Right(0);
    }
  }

  Notificacion _toEntity(NotificacionModel m) => Notificacion(
    id: m.id,
    usuarioId: m.usuarioId,
    tipo: m.tipo,
    titulo: m.titulo,
    mensaje: m.mensaje,
    referenciaModulo: m.referenciaModulo,
    referenciaId: m.referenciaId,
    leida: m.leida,
    createdAt: DateTime.parse(m.createdAt),
  );
}
