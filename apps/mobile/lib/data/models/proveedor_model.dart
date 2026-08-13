class ProveedorModel {
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

  const ProveedorModel({
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

  factory ProveedorModel.fromJson(Map<String, dynamic> json) {
    return ProveedorModel(
      id: json['id'] as String,
      codigo: json['codigo'] as String? ?? '',
      nombre: json['nombre'] as String? ?? '',
      rfc: json['rfc'] as String?,
      email: json['email'] as String?,
      telefono: json['telefono'] as String?,
      pais: json['pais'] as String? ?? '',
      monedaDefault: json['moneda_default'] as String?,
      condicionesPago: json['condiciones_pago'] as String?,
      tipoProveedor: json['tipo_proveedor'] as String?,
      rating: (json['rating'] as num?)?.toInt() ?? 0,
      activo: json['activo'] as bool? ?? true,
    );
  }
}
