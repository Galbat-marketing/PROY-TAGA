import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';

abstract class AuthRepository {
  Future<Either<Failure, bool>> signIn(String email, String password);
  Future<Either<Failure, void>> signOut();
  Future<Either<Failure, bool>> isAuthenticated();
  Future<Either<Failure, String?>> getCurrentUserId();
  Future<Either<Failure, Map<String, dynamic>?>> getCurrentUser();
}
