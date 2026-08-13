class Contenedor {
  final String id;
  final String numeroContenedor;
  final String tipo;
  final String? tamano;
  final String? booking;
  final String? naviera;
  final String? importadoraNombre;
  final DateTime? eta;
  final DateTime? etd;
  final String? puertoOrigen;
  final String? puertoDestino;
  final String estado;
  final List<Embarque>? embarques;

  const Contenedor({
    required this.id,
    required this.numeroContenedor,
    required this.tipo,
    this.tamano,
    this.booking,
    this.naviera,
    this.importadoraNombre,
    this.eta,
    this.etd,
    this.puertoOrigen,
    this.puertoDestino,
    required this.estado,
    this.embarques,
  });
}

class Embarque {
  final String id;
  final String contenedorId;
  final String estado;
  final String? ubicacionActual;
  final DateTime fechaEvento;
  final String? descripcion;

  const Embarque({
    required this.id,
    required this.contenedorId,
    required this.estado,
    this.ubicacionActual,
    required this.fechaEvento,
    this.descripcion,
  });
}
