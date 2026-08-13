import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/date_utils.dart';
import '../../providers/data_providers.dart';

class ProductoDetailPage extends ConsumerWidget {
  final String productoId;
  const ProductoDetailPage({super.key, required this.productoId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productosAsync = ref.watch(productosProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle Producto'),
        actions: [
          IconButton(icon: const Icon(Icons.edit), onPressed: () {}),
        ],
      ),
      body: productosAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (productos) {
          final producto = productos.firstWhere(
            (p) => p.id == productoId,
            orElse: () => throw Exception('Producto no encontrado'),
          );

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withAlpha(20),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: producto.imagenUrl != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: Image.network(producto.imagenUrl!, fit: BoxFit.cover),
                            )
                          : const Icon(Icons.inventory_2, size: 40, color: AppTheme.primary),
                      ),
                      const SizedBox(height: 12),
                      Text(producto.nombre, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      Text(producto.codigo, style: TextStyle(color: Colors.grey[500], fontFamily: 'monospace', fontSize: 12)),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: producto.activo ? AppTheme.success.withAlpha(25) : Colors.grey.withAlpha(25),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          producto.activo ? 'Activo' : 'Inactivo',
                          style: TextStyle(
                            color: producto.activo ? AppTheme.success : Colors.grey,
                            fontWeight: FontWeight.w500,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),
              Text('Información', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _InfoRow(label: 'Código', value: producto.codigo),
                      _InfoRow(label: 'Unidad medida', value: producto.unidadMedida),
                      _InfoRow(label: 'Precio base', value: '${producto.moneda} ${AppDateUtils.formatCurrency(producto.precioBase)}'),
                      if (producto.categoriaNombre != null) _InfoRow(label: 'Categoría', value: producto.categoriaNombre!),
                      if (producto.fraccionArancelaria != null) _InfoRow(label: 'Fracción arancelaria', value: producto.fraccionArancelaria!),
                      if (producto.paisOrigen != null) _InfoRow(label: 'País origen', value: producto.paisOrigen!),
                      if (producto.pesoKg != null) _InfoRow(label: 'Peso (kg)', value: producto.pesoKg!.toString()),
                      if (producto.volumenM3 != null) _InfoRow(label: 'Volumen (m³)', value: producto.volumenM3!.toString()),
                    ],
                  ),
                ),
              ),

              if (producto.descripcion != null && producto.descripcion!.isNotEmpty) ...[
                const SizedBox(height: 16),
                Text('Descripción', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(producto.descripcion!, style: const TextStyle(fontSize: 14)),
                  ),
                ),
              ],

              const SizedBox(height: 16),
              Text('Precios', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _InfoRow(label: 'Precio base', value: '${producto.moneda} ${AppDateUtils.formatCurrency(producto.precioBase)}'),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label, value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
        ],
      ),
    );
  }
}
