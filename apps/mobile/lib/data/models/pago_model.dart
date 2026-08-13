class PagoModel {
  final String id;
  final String? proveedorId;
  final String? beneficiario;
  final String? proveedorNombre;
  final double monto;
  final String moneda;
  final double? tipoCambio;
  final String fechaPago;
  final String estado;
  final String? metodoPago;
  final String? referencia;
  final String? pagadorNombre;
  final String? notas;

  const PagoModel({
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

  factory PagoModel.fromJson(Map<String, dynamic> json) {
    final proveedor = json['proveedores'] as Map<String, dynamic>?;
    return PagoModel(
      id: json['id'] as String,
      proveedorId: json['proveedor_id'] as String?,
      beneficiario: json['beneficiario'] as String?,
      proveedorNombre: json['proveedor_nombre'] as String? ?? proveedor?['nombre'] as String?,
      monto: (json['monto'] as num?)?.toDouble() ?? 0,
      moneda: json['moneda'] as String? ?? 'USD',
      tipoCambio: (json['tipo_cambio'] as num?)?.toDouble(),
      fechaPago: json['fecha_pago'] as String? ?? '',
      estado: json['estado'] as String? ?? 'pendiente_aprobacion',
      metodoPago: json['metodo_pago'] as String?,
      referencia: json['referencia'] as String?,
      pagadorNombre: json['pagador_nombre'] as String?,
      notas: json['notas'] as String?,
    );
  }
}
