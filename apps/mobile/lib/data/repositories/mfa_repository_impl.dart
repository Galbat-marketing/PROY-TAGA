import 'dart:convert';
import 'dart:typed_data';
import 'package:dartz/dartz.dart';
import 'package:crypto/crypto.dart';
import 'package:uuid/uuid.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/mfa_factor.dart';
import '../../domain/repositories/mfa_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';
import '../models/mfa_factor_model.dart';

class MfaRepositoryImpl implements MfaRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  MfaRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, MfaFactor>> setupTotp(String userId) async {
    try {
      final secret = _generateBase32Secret(16);
      
      final factorModel = MfaFactorModel(
        id: const Uuid().v4(),
        userId: userId,
        factorType: 'totp',
        secret: secret,
        verified: false,
        createdAt: DateTime.now(),
        updatedAt: null,
      );

      final result = await _remote.insert('mfa_factors', factorModel.toJson());
      
      if (result.isLeft()) {
        return Left(result);
      }
      
      return Right(MfaFactor(
        id: factorModel.id,
        userId: userId,
        type: 'totp',
        secret: secret,
        verified: false,
      ));
    } catch (e) {
      return Left(ServerFailure('Failed to setup TOTP: $e'));
    }
  }

  @override
  Future<Either<Failure, bool>> verifyTotp(String userId, String code) async {
    try {
      final factorsResult = await getFactors(userId);
      if (factorsResult.isLeft()) {
        return Left(factorsResult);
      }
      
      final factors = factorsResult;
      final totpFactor = factors.firstWhere(
        (f) => f.type == 'totp',
        orElse: () => throw const Exception('No TOTP factor found'),
      );
      
      final isValid = _verifyTotpCode(totpFactor.secret, code);
      
      if (isValid) {
        await _remote.update('mfa_factors', totpFactor.id, {
          'verified': true,
          'updated_at': DateTime.now().toIso8601String(),
        });
      }
      
      return Right(isValid);
    } catch (e) {
      return Left(ServerFailure('Failed to verify TOTP: $e'));
    }
  }

  @override
  Future<Either<Failure, List<MfaFactor>>> getFactors(String userId) async {
    try {
      final result = await _remote.select(
        'mfa_factors',
        filter: {'user_id': userId},
      );
      
      if (result.isLeft()) {
        return Left(result);
      }
      
      final List<dynamic> jsonList = result as List<dynamic>;
      final factors = jsonList
          .map((e) => MfaFactorModel.fromJson(e as Map<String, dynamic>))
          .map((model) => MfaFactor(
            id: model.id,
            userId: model.userId,
            type: model.factorType,
            secret: model.secret,
            verified: model.verified,
          ))
          .toList();
      
      return Right(factors);
    } catch (e) {
      return Left(ServerFailure('Failed to fetch MFA factors: $e'));
    }
  }

  @override
  Future<Either<Failure, bool>> disableFactor(String factorId) async {
    try {
      final result = await _remote.delete('mfa_factors', factorId);
      if (result.isLeft()) {
        return Left(result);
      }
      return const Right(true);
    } catch (e) {
      return Left(ServerFailure('Failed to disable factor: $e'));
    }
  }

  String _generateBase32Secret(int length) {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    final random = Random.secure();
    return List.generate(length, (_) => base32Chars[random.nextInt(base32Chars.length)]).join();
  }

  bool _verifyTotpCode(String secret, String code) {
    try {
      final secretBytes = base32Decode(secret);
      final timeStep = (DateTime.now().millisecondsSinceEpoch ~/ 1000) ~/ 30;
      final key = utf8.encode(base32Encode(secretBytes));
      final hmac = Hmac(sha1, key);
      final hash = hmac.convert(intToByteArray(timeStep));
      
      final offset = hash.bytes[hash.bytes.length - 1] & 0xf;
      final binary =
          ((hash.bytes[offset] & 0x7f) << 24) |
          ((hash.bytes[offset + 1] & 0xff) << 16) |
          ((hash.bytes[offset + 2] & 0xff) << 8) |
          (hash.bytes[offset + 3] & 0xff);
      
      final otp = binary % 1000000;
      final otpString = otp.toString().padLeft(6, '0');
      
      return otpString == code;
    } catch (e) {
      return false;
    }
  }

  List<int> base32Decode(String input) {
    const base32Map = {
      'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7,
      'I': 8, 'J': 9, 'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15,
      'Q': 16, 'R': 17, 'S': 18, 'T': 19, 'U': 20, 'V': 21, 'W': 22, 'X': 23,
      'Y': 24, 'Z': 25, '2': 26, '3': 27, '4': 28, '5': 29, '6': 30, '7': 31
    };
    
    final bytes = <int>[];
    var buffer = 0;
    var bitsLeft = 0;
    
    for (var char in input.toUpperCase().codeUnits) {
      final value = base32Map[String.fromCharCode(char)];
      if (value == null) continue;
      
      buffer = (buffer << 5) | value;
      bitsLeft += 5;
      
      if (bitsLeft >= 8) {
        bytes.add(buffer >> (bitsLeft - 8));
        bitsLeft -= 8;
      }
    }
    
    return bytes;
  }

  String base32Encode(List<int> input) {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    var buffer = 0;
    var bitsLeft = 0;
    var result = '';
    
    for (var byte in input) {
      buffer = (buffer << 8) | byte;
      bitsLeft += 8;
      
      while (bitsLeft >= 5) {
        result += base32Chars[buffer >> (bitsLeft - 5)];
        bitsLeft -= 5;
        buffer &= (1 << bitsLeft) - 1;
      }
    }
    
    if (bitsLeft > 0) {
      result += base32Chars[buffer << (5 - bitsLeft)];
    }
    
    return result;
  }

  List<int> intToByteArray(int value) {
    return [
      (value >> 56) & 0xff,
      (value >> 48) & 0xff,
      (value >> 40) & 0xff,
      (value >> 32) & 0xff,
      (value >> 24) & 0xff,
      (value >> 16) & 0xff,
      (value >> 8) & 0xff,
      value & 0xff,
    ];
  }
}