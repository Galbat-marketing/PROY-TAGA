import 'package:dartz/dartz.dart';

class MfaFactorModel {
  final String id;
  final String userId;
  final String factorType;
  final String? secret;
  final bool verified;
  final DateTime createdAt;
  final String? updatedAt;

  const MfaFactorModel({
    required this.id,
    required this.userId,
    required this.factorType,
    this.secret,
    this.verified = false,
    this.createdAt: DateTime.now().toIso8601String(),
    this.updatedAt,
  });

  factory MfaFactorModel.fromJson(Map<String, dynamic> json) {
    return MfaFactorModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      factorType: json['factorType'] as String,
      secret: json['secret'] as String?,
      verified: json['verified'] as bool?,
      createdAt: DateTime.tryParse(json['createdAt'] ?? ''),
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt'] ?? '') : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'factorType': factorType,
      'secret': secret,
      'verified': verified,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}