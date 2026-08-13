import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  AuthRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, bool>> signIn(String email, String password) async {
    try {
      final response = await _remote.signIn(email, password);
      await _local.saveSecure('session_token', response.session?.accessToken ?? '');
      return Right(true);
    } catch (e) {
      return Left(AuthFailure('Error al iniciar sesión: ${e.toString()}'));
    }
  }

  @override
  Future<Either<Failure, void>> signOut() async {
    try {
      await _remote.signOut();
      await _local.deleteSecure('session_token');
      await _local.clearCache();
      return const Right(null);
    } catch (e) {
      return Left(AuthFailure('Error al cerrar sesión'));
    }
  }

  @override
  Future<Either<Failure, bool>> isAuthenticated() async {
    try {
      final session = _remote.client.auth.currentSession;
      return Right(session != null);
    } catch (e) {
      return Right(false);
    }
  }

  @override
  Future<Either<Failure, String?>> getCurrentUserId() async {
    try {
      return Right(_remote.client.auth.currentUser?.id);
    } catch (e) {
      return Right(null);
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>?>> getCurrentUser() async {
    try {
      final user = _remote.client.auth.currentUser;
      if (user == null) return const Right(null);
      return Right({
        'id': user.id,
        'email': user.email,
        'nombre': user.userMetadata?['nombre'] ?? '',
      });
    } catch (e) {
      return Right(null);
    }
  }
}
