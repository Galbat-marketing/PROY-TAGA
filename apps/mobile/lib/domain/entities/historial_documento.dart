class HistorialDocumento {
  final String id;
  final String documentoId;
  final String accion;
  final String? usuarioId;
  final Map<String, dynamic>? metadata;
  final String createdAt;

  const HistorialDocumento({
    required this.id,
    required this.documentoId,
    required this.accion,
    this.usuarioId,
    this.metadata,
    required this.createdAt,
  });
}