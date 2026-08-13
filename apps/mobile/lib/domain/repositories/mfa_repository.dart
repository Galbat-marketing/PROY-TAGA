import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/mfa_factor.dart';

abstract class MfaRepository {
  Future<Either<Failure, MfaFactor>> setupTotp(String userId);
  Future<Either<Failure, bool>> verifyTotp(String userId, String code);
  Future<Either<Failure, List<MfaFactor>>> getFactors(String userId);
  Future<Either<Failure, bool>> disableFactor(String factorId);
}