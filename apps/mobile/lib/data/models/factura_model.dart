class FacturaModel {
  final String id;
  final String folio;
  final String? ofertaId;
  final String clienteId;
  final String? clienteNombre;
  final String tipo;
  final double subtotal;
  final double iva;
  final double total;
  final String moneda;
  final double? tipoCambio;
  final String fechaEmision;
  final String? fechaVencimiento;
  final String estado;

  const FacturaModel({
    required this.id,
    required this.folio,
    this.ofertaId,
    required this.clienteId,
    this.clienteNombre,
    required this.tipo,
    this.subtotal = 0,
    this.iva = 0,
    required this.total,
    this.moneda = 'USD',
    this.tipoCambio,
    required this.fechaEmision,
    this.fechaVencimiento,
    this.estado = 'pendiente',
  });

  factory FacturaModel.fromJson(Map<String, dynamic> json) {
    final cliente = json['clientes'] as Map<String, dynamic>?;
    return FacturaModel(
      id: json['id'] as String,
      folio: json['folio'] as String? ?? '',
      ofertaId: json['oferta_id'] as String?,
      clienteId: json['cliente_id'] as String? ?? '',
      clienteNombre: json['cliente_nombre'] as String? ?? cliente?['nombre'] as String?,
      tipo: json['tipo'] as String? ?? '',
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0,
      iva: (json['iva'] as num?)?.toDouble() ?? 0,
      total: (json['total'] as num?)?.toDouble() ?? 0,
      moneda: json['moneda'] as String? ?? 'USD',
      tipoCambio: (json['tipo_cambio'] as num?)?.toDouble(),
      fechaEmision: json['fecha_emision'] as String? ?? '',
      fechaVencimiento: json['fecha_vencimiento'] as String?,
      estado: json['estado'] as String? ?? 'pendiente',
    );
  }
}
