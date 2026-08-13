class PagoComision {
  final String semanaInicio;
  final int ventas;
  final double totalVentas;
  final double comision;
  final String? pagoId;
  final String estado;
  final DateTime? fechaPago;

  const PagoComision({
    required this.semanaInicio,
    this.ventas = 0,
    this.totalVentas = 0,
    this.comision = 0,
    this.pagoId,
    this.estado = 'pendiente',
    this.fechaPago,
  });

  bool get isPagado => estado == 'realizado';
}
