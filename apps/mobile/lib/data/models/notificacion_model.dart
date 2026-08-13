class NotificacionModel {
  final String id;
  final String usuarioId;
  final String tipo;
  final String titulo;
  final String? mensaje;
  final String? referenciaModulo;
  final String? referenciaId;
  final bool leida;
  final String createdAt;

  const NotificacionModel({
    required this.id,
    required this.usuarioId,
    required this.tipo,
    required this.titulo,
    this.mensaje,
    this.referenciaModulo,
    this.referenciaId,
    this.leida = false,
    required this.createdAt,
  });

  factory NotificacionModel.fromJson(Map<String, dynamic> json) {
    return NotificacionModel(
      id: json['id'] as String,
      usuarioId: json['usuario_id'] as String,
      tipo: json['tipo'] as String,
      titulo: json['titulo'] as String,
      mensaje: json['mensaje'] as String?,
      referenciaModulo: json['referencia_modulo'] as String?,
      referenciaId: json['referencia_id'] as String?,
      leida: json['leida'] as bool? ?? false,
      createdAt: json['created_at'] as String,
    );
  }
}
