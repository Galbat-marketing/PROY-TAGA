class Cobro {
  final String id;
  final String facturaId;
  final double monto;
  final String moneda;
  final DateTime fechaCobro;
  final String metodoPago;
  final String? referencia;
  final String? cobradorNombre;
  final String? notas;
  final String? facturaFolio;
  final String? clienteNombre;

  const Cobro({
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
}
