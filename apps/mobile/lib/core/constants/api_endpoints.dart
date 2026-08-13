class ApiEndpoints {
  ApiEndpoints._();

  static const String ofertas = '/rest/v1/ofertas';
  static const String clientes = '/rest/v1/clientes';
  static const String productos = '/rest/v1/productos';
  static const String proveedores = '/rest/v1/proveedores';
  static const String contenedores = '/rest/v1/contenedores';
  static const String embarques = '/rest/v1/embarques';
  static const String facturas = '/rest/v1/facturas';
  static const String cobros = '/rest/v1/cobros';
  static const String pagos = '/rest/v1/pagos';
  static const String notificaciones = '/rest/v1/notificaciones';
  static const String categorias = '/rest/v1/categorias_productos';
  static const String usuarios = '/rest/v1/usuarios';
  static const String importadoras = '/rest/v1/importadoras';
  static const String codificadorComerciales = '/rest/v1/codificador_comerciales';
  static const String pagoComisiones = '/rest/v1/pago_comisiones';

  // Edge Functions
  static const String sincronizar = '/functions/v1/sincronizar-movil';
  static const String busqueda = '/functions/v1/busqueda-global';
}
