class VersionDocumento {
  final String id;
  final String documentoId;
  final int version;
  final String storagePath;
  final int fileSize;
  final String subidoPor;
  final String? notasCambio;
  final String createdAt;

  const VersionDocumento({
    required this.id,
    required this.documentoId,
    required this.version,
    required this.storagePath,
    required this.fileSize,
    required this.subidoPor,
    this.notasCambio,
    required this.createdAt,
  });
}