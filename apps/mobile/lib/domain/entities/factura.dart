class Factura {
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
  final DateTime fechaEmision;
  final DateTime? fechaVencimiento;
  final String estado;

  const Factura({
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
    required this.fechaEmision,
    this.fechaVencimiento,
    this.estado = 'pendiente',
  });
}
