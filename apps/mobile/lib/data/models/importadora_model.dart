class ImportadoraModel {
  final String id;
  final String codigo;
  final String nombre;
  final String? rfc;
  final String? direccion;
  final String? aduanaAsignada;
  final String? agenteAduanal;
  final String? email;
  final String? telefono;
  final bool activo;

  const ImportadoraModel({
    required this.id,
    required this.codigo,
    required this.nombre,
    this.rfc,
    this.direccion,
    this.aduanaAsignada,
    this.agenteAduanal,
    this.email,
    this.telefono,
    this.activo = true,
  });

  factory ImportadoraModel.fromJson(Map<String, dynamic> json) {
    return ImportadoraModel(
      id: json['id'] as String,
      codigo: json['codigo'] as String? ?? '',
      nombre: json['nombre'] as String? ?? '',
      rfc: json['rfc'] as String?,
      direccion: json['direccion'] as String?,
      aduanaAsignada: json['aduana_asignada'] as String?,
      agenteAduanal: json['agente_aduanal'] as String?,
      email: json['email'] as String?,
      telefono: json['telefono'] as String?,
      activo: json['activo'] as bool? ?? true,
    );
  }
}
