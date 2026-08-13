class Cliente {
  final String id;
  final String codigo;
  final String nombre;
  final String? rfc;
  final String? email;
  final String? telefono;
  final String pais;
  final String monedaDefault;
  final double limiteCredito;
  final String? condicionesPago;
  final String? vendedorNombre;
  final int rating;
  final bool activo;

  const Cliente({
    required this.id,
    required this.codigo,
    required this.nombre,
    this.rfc,
    this.email,
    this.telefono,
    required this.pais,
    this.monedaDefault = 'USD',
    this.limiteCredito = 0,
    this.condicionesPago,
    this.vendedorNombre,
    this.rating = 0,
    this.activo = true,
  });
}
