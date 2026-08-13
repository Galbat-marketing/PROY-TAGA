class MfaFactor {
  final String id;
  final String userId;
  final String type; // 'totp' | 'phone' | 'email'
  final bool verified;
  final String? secret;
  final String? phoneNumber;
  final String? email;
  final int? expiresAt;

  const MfaFactor({
    required this.id,
    required this.userId,
    required this.type,
    this.verified = false,
    this.secret,
    this.phoneNumber,
    this.email,
    this.expiresAt,
  });
}