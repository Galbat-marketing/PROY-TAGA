import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/data_providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/date_utils.dart';

class OfertasListPage extends ConsumerWidget {
  const OfertasListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ofertasAsync = ref.watch(ofertasProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ofertas'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {},
          ),
        ],
      ),
      body: ofertasAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (ofertas) {
          if (ofertas.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.description_outlined, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('No hay ofertas', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () {},
                    child: const Text('Nueva oferta'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(ofertasProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: ofertas.length,
              itemBuilder: (context, index) {
                final oferta = ofertas[index];
                final estadoColor = switch (oferta.estado) {
                  'aceptada' => AppTheme.success,
                  'borrador' => AppTheme.warning,
                  'enviada' => AppTheme.info,
                  'rechazada' => AppTheme.error,
                  _ => Colors.grey,
                };

                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () => context.push('/ofertas/${oferta.id}'),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(oferta.folio, style: const TextStyle(fontWeight: FontWeight.w600, fontFamily: 'monospace')),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: estadoColor.withAlpha(25),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        oferta.estado[0].toUpperCase() + oferta.estado.substring(1),
                                        style: TextStyle(fontSize: 10, color: estadoColor, fontWeight: FontWeight.w500),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  oferta.clienteNombre ?? 'Sin cliente',
                                  style: TextStyle(color: Colors.grey[600], fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${oferta.moneda} ${AppDateUtils.formatCurrency(oferta.total)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        icon: const Icon(Icons.add),
        label: const Text('Nueva'),
      ),
    );
  }
}
