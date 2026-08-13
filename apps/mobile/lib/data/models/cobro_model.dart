class CobroModel {
  final String id;
  final String facturaId;
  final double monto;
  final String moneda;
  final String fechaCobro;
  final String metodoPago;
  final String? referencia;
  final String? cobradorNombre;
  final String? notas;
  final String? facturaFolio;
  final String? clienteNombre;

  const CobroModel({
    required this.id,
    required this.facturaId,
    required this.monto,
    this.moneda = 'USD',
    required this.fechaCobro,
    required this.metodoPago,
    this.referencia,
    this.cobradorNombre,
    this.notas,
    this.facturaFolio,
    this.clienteNombre,
  });

  factory CobroModel.fromJson(Map<String, dynamic> json) {
    final factura = json['facturas'] as Map<String, dynamic>?;
    return CobroModel(
      id: json['id'] as String,
      facturaId: json['factura_id'] as String,
      monto: (json['monto'] as num).toDouble(),
      moneda: json['moneda'] as String? ?? 'USD',
      fechaCobro: json['fecha_cobro'] as String,
      metodoPago: json['metodo_pago'] as String,
      referencia: json['referencia'] as String?,
      cobradorNombre: json['cobrador_nombre'] as String?,
      notas: json['notas'] as String?,
      facturaFolio: factura?['folio'] as String?,
      clienteNombre: json['cliente_nombre'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'factura_id': facturaId,
    'monto': monto,
    'moneda': moneda,
    'fecha_cobro': fechaCobro,
    'metodo_pago': metodoPago,
    'referencia': referencia,
    'notas': notas,
  };
}
