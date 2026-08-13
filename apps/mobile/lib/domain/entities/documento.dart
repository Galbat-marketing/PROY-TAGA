class Documento {
  final String id;
  final String nombre;
  final String? tipoDocumento;
  final String? descripcion;
  final String? estado;
  final String? versionActual;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const Documento({
    required this.id,
    required this.nombre,
    this.tipoDocumento,
    this.descripcion,
    this.estado,
    this.versionActual,
    required this.createdAt,
    this.updatedAt,
  });
}
