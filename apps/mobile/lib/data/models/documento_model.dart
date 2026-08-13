class DocumentoModel {
  final String id;
  final String nombre;
  final String? tipoDocumento;
  final String? descripcion;
  final String? estado;
  final String? versionActual;
  final String createdAt;
  final String? updatedAt;

  const DocumentoModel({
    required this.id,
    required this.nombre,
    this.tipoDocumento,
    this.descripcion,
    this.estado,
    this.versionActual,
    required this.createdAt,
    this.updatedAt,
  });

  factory DocumentoModel.fromJson(Map<String, dynamic> json) {
    return DocumentoModel(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
      tipoDocumento: json['tipo_documento'] as String?,
      descripcion: json['descripcion'] as String?,
      estado: json['estado'] as String?,
      versionActual: json['version_actual'] as String?,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'nombre': nombre,
    'tipo_documento': tipoDocumento,
    'descripcion': descripcion,
    'estado': estado,
    'version_actual': versionActual,
    'created_at': createdAt,
    'updated_at': updatedAt,
  };
}
