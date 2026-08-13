class ComercialModel {
  final String id;
  final String codigo;
  final String nombre;
  final bool activo;

  const ComercialModel({
    required this.id,
    required this.codigo,
    required this.nombre,
    this.activo = true,
  });

  factory ComercialModel.fromJson(Map<String, dynamic> json) {
    return ComercialModel(
      id: json['id'] as String,
      codigo: json['codigo'] as String? ?? '',
      nombre: json['nombre'] as String? ?? '',
      activo: json['activo'] as bool? ?? true,
    );
  }
}
