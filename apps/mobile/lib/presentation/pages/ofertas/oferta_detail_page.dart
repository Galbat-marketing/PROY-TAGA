import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/data_providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/date_utils.dart';

class OfertaDetailPage extends ConsumerWidget {
  final String ofertaId;
  const OfertaDetailPage({super.key, required this.ofertaId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ofertaAsync = ref.watch(ofertasProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle Oferta'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {},
          ),
          PopupMenuButton(
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'pdf', child: Text('Generar PDF')),
              const PopupMenuItem(value: 'duplicate', child: Text('Duplicar')),
            ],
          ),
        ],
      ),
      body: ofertaAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (ofertas) {
          final oferta = ofertas.firstWhere(
            (o) => o.id == ofertaId,
            orElse: () => throw Exception('Oferta no encontrada'),
          );

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Header
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(oferta.folio, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppTheme.success.withAlpha(25),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              oferta.estado[0].toUpperCase() + oferta.estado.substring(1),
                              style: TextStyle(color: AppTheme.success, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 24),
                      _InfoRow(label: 'Cliente', value: oferta.clienteNombre ?? '—'),
                      _InfoRow(label: 'Comercial', value: oferta.comercialNombre ?? '—'),
                      _InfoRow(label: 'Fecha', value: AppDateUtils.format(oferta.fechaEmision)),
                      if (oferta.incoterm != null) _InfoRow(label: 'Incoterm', value: oferta.incoterm!),
                      if (oferta.condicionesPago != null) _InfoRow(label: 'Pago', value: oferta.condicionesPago!),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Products
              Text('Productos', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              if (oferta.fichas != null)
                ...oferta.fichas!.map((ficha) => Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(ficha.productoNombre ?? 'Producto', style: const TextStyle(fontWeight: FontWeight.w500)),
                              Text('${ficha.cantidad} x \$${AppDateUtils.formatCurrency(ficha.precioUnitario)}',
                                style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                            ],
                          ),
                        ),
                        Text('\$${AppDateUtils.formatCurrency(ficha.subtotal)}',
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                )),

              const SizedBox(height: 16),

              // Totals
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _TotalRow(label: 'Subtotal', value: '\$${AppDateUtils.formatCurrency(oferta.subtotal)}'),
                      _TotalRow(label: 'Descuento', value: '-\$${AppDateUtils.formatCurrency(oferta.descuentoGlobal)}'),
                      _TotalRow(label: 'IVA', value: '\$${AppDateUtils.formatCurrency(oferta.iva)}'),
                      const Divider(),
                      _TotalRow(label: 'Total', value: '\$${AppDateUtils.formatCurrency(oferta.total)}', bold: true),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Actions
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.check_circle),
                label: const Text('Aceptar oferta'),
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.success),
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.close),
                label: const Text('Rechazar oferta'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.error,
                  side: const BorderSide(color: AppTheme.error),
                  minimumSize: const Size(double.infinity, 50),
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

class _TotalRow extends StatelessWidget {
  final String label, value;
  final bool bold;
  const _TotalRow({required this.label, required this.value, this.bold = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontWeight: bold ? FontWeight.w600 : FontWeight.normal, fontSize: 14)),
          Text(value, style: TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.normal, fontSize: 14)),
        ],
      ),
    );
  }
}
