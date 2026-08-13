class Importadora {
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

  const Importadora({
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
}
