class ContenedorModel {
  final String id;
  final String numeroContenedor;
  final String tipo;
  final String? tamano;
  final String? booking;
  final String? naviera;
  final String? importadoraNombre;
  final String? eta;
  final String? etd;
  final String? puertoOrigen;
  final String? puertoDestino;
  final String estado;
  final List<EmbarqueModel>? embarques;

  const ContenedorModel({
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

  factory ContenedorModel.fromJson(Map<String, dynamic> json) {
    List<EmbarqueModel>? embarques;
    if (json['embarques'] != null) {
      embarques = (json['embarques'] as List)
          .map((e) => EmbarqueModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    return ContenedorModel(
      id: json['id'] as String,
      numeroContenedor: json['numero_contenedor'] as String,
      tipo: json['tipo'] as String,
      tamano: json['tamano'] as String?,
      booking: json['booking'] as String?,
      naviera: json['naviera'] as String?,
      importadoraNombre: json['importadora_nombre'] as String?,
      eta: json['eta'] as String?,
      etd: json['etd'] as String?,
      puertoOrigen: json['puerto_origen'] as String?,
      puertoDestino: json['puerto_destino'] as String?,
      estado: json['estado'] as String,
      embarques: embarques,
    );
  }
}

class EmbarqueModel {
  final String id;
  final String contenedorId;
  final String estado;
  final String? ubicacionActual;
  final String fechaEvento;
  final String? descripcion;

  const EmbarqueModel({
    required this.id,
    required this.contenedorId,
    required this.estado,
    this.ubicacionActual,
    required this.fechaEvento,
    this.descripcion,
  });

  factory EmbarqueModel.fromJson(Map<String, dynamic> json) {
    return EmbarqueModel(
      id: json['id'] as String,
      contenedorId: json['contenedor_id'] as String,
      estado: json['estado'] as String,
      ubicacionActual: json['ubicacion_actual'] as String?,
      fechaEvento: json['fecha_evento'] as String,
      descripcion: json['descripcion'] as String?,
    );
  }
}
