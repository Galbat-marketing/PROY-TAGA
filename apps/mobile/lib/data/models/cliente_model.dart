class ClienteModel {
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

  const ClienteModel({
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

  factory ClienteModel.fromJson(Map<String, dynamic> json) {
    return ClienteModel(
      id: json['id'] as String,
      codigo: json['codigo'] as String,
      nombre: json['nombre'] as String,
      rfc: json['rfc'] as String?,
      email: json['email'] as String?,
      telefono: json['telefono'] as String?,
      pais: json['pais'] as String,
      monedaDefault: json['moneda_default'] as String? ?? 'USD',
      limiteCredito: (json['limite_credito'] as num?)?.toDouble() ?? 0,
      condicionesPago: json['condiciones_pago'] as String?,
      vendedorNombre: json['vendedor_nombre'] as String?,
      rating: json['rating'] as int? ?? 0,
      activo: json['activo'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'codigo': codigo,
    'nombre': nombre,
    'rfc': rfc,
    'email': email,
    'telefono': telefono,
    'pais': pais,
    'moneda_default': monedaDefault,
    'limite_credito': limiteCredito,
    'condiciones_pago': condicionesPago,
    'vendedor_nombre': vendedorNombre,
    'rating': rating,
    'activo': activo,
  };
}
