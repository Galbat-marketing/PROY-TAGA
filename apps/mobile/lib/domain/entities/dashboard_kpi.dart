class DashboardKPI {
  final double ventasMes;
  final double cobradoMes;
  final double pendienteTotal;
  final double variacionVentas;
  final double variacionCobrado;
  final int ofertasActivas;
  final int ofertasNuevas;
  final List<OfertaReciente> ofertasRecientes;
  final int contenedoresActivos;
  final int contenedoresProximos;
  final int contenedoresAtrasados;
  final List<ContenedorResumen> contenedoresLista;
  final int notificacionesNoLeidas;

  const DashboardKPI({
    this.ventasMes = 0,
    this.cobradoMes = 0,
    this.pendienteTotal = 0,
    this.variacionVentas = 0,
    this.variacionCobrado = 0,
    this.ofertasActivas = 0,
    this.ofertasNuevas = 0,
    this.ofertasRecientes = const [],
    this.contenedoresActivos = 0,
    this.contenedoresProximos = 0,
    this.contenedoresAtrasados = 0,
    this.contenedoresLista = const [],
    this.notificacionesNoLeidas = 0,
  });
}

class OfertaReciente {
  final String id;
  final String folio;
  final String? clienteNombre;
  final double total;
  final String estado;
  final String? comercialNombre;
  final DateTime createdAt;

  const OfertaReciente({
    required this.id,
    required this.folio,
    this.clienteNombre,
    required this.total,
    required this.estado,
    this.comercialNombre,
    required this.createdAt,
  });
}

class ContenedorResumen {
  final String id;
  final String numeroContenedor;
  final String estado;
  final String? naviera;
  final DateTime? eta;
  final String? puertoOrigen;
  final String? puertoDestino;

  const ContenedorResumen({
    required this.id,
    required this.numeroContenedor,
    required this.estado,
    this.naviera,
    this.eta,
    this.puertoOrigen,
    this.puertoDestino,
  });
}
