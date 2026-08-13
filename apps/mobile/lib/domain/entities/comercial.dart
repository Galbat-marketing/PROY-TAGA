class Comercial {
  final String id;
  final String codigo;
  final String nombre;
  final bool activo;

  const Comercial({
    required this.id,
    required this.codigo,
    required this.nombre,
    this.activo = true,
  });
}
