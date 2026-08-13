class Proveedor {
  final String id;
  final String codigo;
  final String nombre;
  final String? rfc;
  final String? email;
  final String? telefono;
  final String pais;
  final String? monedaDefault;
  final String? condicionesPago;
  final String? tipoProveedor;
  final int rating;
  final bool activo;

  const Proveedor({
    required this.id,
    required this.codigo,
    required this.nombre,
    this.rfc,
    this.email,
    this.telefono,
    required this.pais,
    this.monedaDefault,
    this.condicionesPago,
    this.tipoProveedor,
    this.rating = 0,
    this.activo = true,
  });
}
