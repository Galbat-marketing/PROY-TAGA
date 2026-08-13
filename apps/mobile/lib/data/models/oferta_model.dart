class OfertaModel {
  final String id;
  final String folio;
  final String clienteId;
  final String? clienteNombre;
  final String comercialId;
  final String? comercialNombre;
  final String fechaEmision;
  final String? fechaVigencia;
  final String estado;
  final String? tipoOperacion;
  final String? condicionesPago;
  final String? incoterm;
  final String moneda;
  final double subtotal;
  final double descuentoGlobal;
  final double iva;
  final double total;
  final List<FichaOfertaModel>? fichas;

  const OfertaModel({
    required this.id,
    required this.folio,
    required this.clienteId,
    this.clienteNombre,
    required this.comercialId,
    this.comercialNombre,
    required this.fechaEmision,
    this.fechaVigencia,
    required this.estado,
    this.tipoOperacion,
    this.condicionesPago,
    this.incoterm,
    this.moneda = 'USD',
    this.subtotal = 0,
    this.descuentoGlobal = 0,
    this.iva = 0,
    this.total = 0,
    this.fichas,
  });

  factory OfertaModel.fromJson(Map<String, dynamic> json) {
    List<FichaOfertaModel>? fichas;
    if (json['fichas'] != null) {
      fichas = (json['fichas'] as List)
          .map((f) => FichaOfertaModel.fromJson(f as Map<String, dynamic>))
          .toList();
    }

    return OfertaModel(
      id: json['id'] as String,
      folio: json['folio'] as String,
      clienteId: json['cliente_id'] as String,
      clienteNombre: json['cliente_nombre'] as String?,
      comercialId: json['comercial_id'] as String,
      comercialNombre: json['comercial_nombre'] as String?,
      fechaEmision: json['fecha_emision'] as String,
      fechaVigencia: json['fecha_vigencia'] as String?,
      estado: json['estado'] as String,
      tipoOperacion: json['tipo_operacion'] as String?,
      condicionesPago: json['condiciones_pago'] as String?,
      incoterm: json['incoterm'] as String?,
      moneda: json['moneda'] as String? ?? 'USD',
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0,
      descuentoGlobal: (json['descuento_global'] as num?)?.toDouble() ?? 0,
      iva: (json['iva'] as num?)?.toDouble() ?? 0,
      total: (json['total'] as num?)?.toDouble() ?? 0,
      fichas: fichas,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'folio': folio,
    'cliente_id': clienteId,
    'cliente_nombre': clienteNombre,
    'comercial_id': comercialId,
    'comercial_nombre': comercialNombre,
    'fecha_emision': fechaEmision,
    'fecha_vigencia': fechaVigencia,
    'estado': estado,
    'tipo_operacion': tipoOperacion,
    'condiciones_pago': condicionesPago,
    'incoterm': incoterm,
    'moneda': moneda,
    'subtotal': subtotal,
    'descuento_global': descuentoGlobal,
    'iva': iva,
    'total': total,
  };
}

class FichaOfertaModel {
  final String id;
  final String ofertaId;
  final String productoId;
  final String? productoNombre;
  final String? productoCodigo;
  final double cantidad;
  final String unidadMedida;
  final double precioUnitario;
  final double descuento;
  final double subtotal;

  const FichaOfertaModel({
    required this.id,
    required this.ofertaId,
    required this.productoId,
    this.productoNombre,
    this.productoCodigo,
    required this.cantidad,
    required this.unidadMedida,
    required this.precioUnitario,
    this.descuento = 0,
    this.subtotal = 0,
  });

  factory FichaOfertaModel.fromJson(Map<String, dynamic> json) {
    return FichaOfertaModel(
      id: json['id'] as String,
      ofertaId: json['oferta_id'] as String,
      productoId: json['producto_id'] as String,
      productoNombre: json['producto_nombre'] as String?,
      productoCodigo: json['producto_codigo'] as String?,
      cantidad: (json['cantidad'] as num).toDouble(),
      unidadMedida: json['unidad_medida'] as String,
      precioUnitario: (json['precio_unitario'] as num).toDouble(),
      descuento: (json['descuento'] as num?)?.toDouble() ?? 0,
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0,
    );
  }
}
