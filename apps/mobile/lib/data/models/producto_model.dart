class ProductoModel {
  final String id;
  final String codigo;
  final String nombre;
  final String? descripcion;
  final String? categoriaId;
  final String? categoriaNombre;
  final String unidadMedida;
  final double precioBase;
  final String moneda;
  final String? fraccionArancelaria;
  final String? paisOrigen;
  final double? pesoKg;
  final double? volumenM3;
  final bool activo;
  final String? imagenUrl;
  final String createdAt;

  const ProductoModel({
    required this.id,
    required this.codigo,
    required this.nombre,
    this.descripcion,
    this.categoriaId,
    this.categoriaNombre,
    required this.unidadMedida,
    required this.precioBase,
    this.moneda = 'USD',
    this.fraccionArancelaria,
    this.paisOrigen,
    this.pesoKg,
    this.volumenM3,
    this.activo = true,
    this.imagenUrl,
    required this.createdAt,
  });

  factory ProductoModel.fromJson(Map<String, dynamic> json) {
    return ProductoModel(
      id: json['id'] as String,
      codigo: json['codigo'] as String,
      nombre: json['nombre'] as String,
      descripcion: json['descripcion'] as String?,
      categoriaId: json['categoria_id'] as String?,
      categoriaNombre: json['categoria_nombre'] as String?,
      unidadMedida: json['unidad_medida'] as String,
      precioBase: (json['precio_base'] as num).toDouble(),
      moneda: json['moneda'] as String? ?? 'USD',
      fraccionArancelaria: json['fraccion_arancelaria'] as String?,
      paisOrigen: json['pais_origen'] as String?,
      pesoKg: (json['peso_kg'] as num?)?.toDouble(),
      volumenM3: (json['volumen_m3'] as num?)?.toDouble(),
      activo: json['activo'] as bool? ?? true,
      imagenUrl: json['imagen_url'] as String?,
      createdAt: json['created_at'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'codigo': codigo,
    'nombre': nombre,
    'descripcion': descripcion,
    'categoria_id': categoriaId,
    'categoria_nombre': categoriaNombre,
    'unidad_medida': unidadMedida,
    'precio_base': precioBase,
    'moneda': moneda,
    'fraccion_arancelaria': fraccionArancelaria,
    'pais_origen': paisOrigen,
    'peso_kg': pesoKg,
    'volumen_m3': volumenM3,
    'activo': activo,
    'imagen_url': imagenUrl,
    'created_at': createdAt,
  };
}
