class Oferta {
  final String id;
  final String folio;
  final String clienteId;
  final String? clienteNombre;
  final String comercialId;
  final String? comercialNombre;
  final DateTime fechaEmision;
  final DateTime? fechaVigencia;
  final String estado;
  final String? tipoOperacion;
  final String? condicionesPago;
  final String? incoterm;
  final String moneda;
  final double subtotal;
  final double descuentoGlobal;
  final double iva;
  final double total;
  final List<FichaOferta>? fichas;

  const Oferta({
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
}

class FichaOferta {
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

  const FichaOferta({
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
}
