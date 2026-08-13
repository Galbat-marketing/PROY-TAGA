class Pago {
  final String id;
  final String? proveedorId;
  final String? beneficiario;
  final String? proveedorNombre;
  final double monto;
  final String moneda;
  final double? tipoCambio;
  final DateTime fechaPago;
  final String estado;
  final String? metodoPago;
  final String? referencia;
  final String? pagadorNombre;
  final String? notas;

  const Pago({
    required this.id,
    this.proveedorId,
    this.beneficiario,
    this.proveedorNombre,
    required this.monto,
    this.moneda = 'USD',
    this.tipoCambio,
    required this.fechaPago,
    this.estado = 'pendiente_aprobacion',
    this.metodoPago,
    this.referencia,
    this.pagadorNombre,
    this.notas,
  });

  String get beneficiarioDisplay => proveedorNombre ?? beneficiario ?? '—';
}
