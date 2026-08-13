class Producto {
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
  final DateTime createdAt;

  const Producto({
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
}
