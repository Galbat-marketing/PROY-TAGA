class Notificacion {
  final String id;
  final String usuarioId;
  final String tipo;
  final String titulo;
  final String? mensaje;
  final String? referenciaModulo;
  final String? referenciaId;
  final bool leida;
  final DateTime createdAt;

  const Notificacion({
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
}
