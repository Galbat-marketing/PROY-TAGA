class VersionDocumentoModel {
  final String id;
  final String documentoId;
  final int version;
  final String storagePath;
  final int fileSize;
  final String subidoPor;
  final String? notasCambio;
  final String createdAt;

  const VersionDocumentoModel({
    required this.id,
    required this.documentoId,
    required this.version,
    required this.storagePath,
    required this.fileSize,
    required this.subidoPor,
    this.notasCambio,
    required this.createdAt,
  });

  factory VersionDocumentoModel.fromJson(Map<String, dynamic> json) {
    return VersionDocumentoModel(
      id: json['id'] as String,
      documentoId: json['documento_id'] as String,
      version: json['version'] as int,
      storagePath: json['storage_path'] as String,
      fileSize: json['file_size'] as int? ?? 0,
      subidoPor: json['subido_por'] as String? ?? '',
      notasCambio: json['notas_cambio'] as String?,
      createdAt: json['created_at'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'documento_id': documentoId,
    'version': version,
    'storage_path': storagePath,
    'file_size': fileSize,
    'subido_por': subidoPor,
    'notas_cambio': notasCambio,
    'created_at': createdAt,
  };
}