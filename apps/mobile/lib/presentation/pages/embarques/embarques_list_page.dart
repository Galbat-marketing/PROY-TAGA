import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/date_utils.dart';
import '../../providers/data_providers.dart';

class EmbarquesListPage extends ConsumerWidget {
  const EmbarquesListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contenedoresAsync = ref.watch(contenedoresProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Embarques'),
        actions: [
          IconButton(icon: const Icon(Icons.filter_list), onPressed: () {}),
        ],
      ),
      body: contenedoresAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (contenedores) {
          if (contenedores.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.directions_boat_outlined, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('No hay embarques activos', style: Theme.of(context).textTheme.titleMedium),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(contenedoresProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: contenedores.length,
              itemBuilder: (context, index) {
                final c = contenedores[index];
                final estadoColor = switch (c.estado) {
                  'programado' => AppTheme.info,
                  'en_transito' => AppTheme.warning,
                  'en_aduana' => AppTheme.warning,
                  'liberado' => AppTheme.success,
                  'entregado' => AppTheme.success,
                  _ => Colors.grey,
                };
                final estadoIcon = switch (c.estado) {
                  'programado' => Icons.schedule,
                  'en_transito' => Icons.flight_takeoff,
                  'en_aduana' => Icons.account_balance,
                  'liberado' => Icons.check_circle_outline,
                  'entregado' => Icons.check_circle,
                  _ => Icons.help_outline,
                };

                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () => context.push('/embarques/${c.id}'),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: estadoColor.withAlpha(20),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(estadoIcon, color: estadoColor, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(c.numeroContenedor, style: const TextStyle(fontWeight: FontWeight.w600, fontFamily: 'monospace')),
                                    Text(c.naviera ?? '—', style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: estadoColor.withAlpha(25),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  c.estado.replaceAll('_', ' ')[0].toUpperCase() + c.estado.replaceAll('_', ' ').substring(1),
                                  style: TextStyle(fontSize: 10, color: estadoColor, fontWeight: FontWeight.w500),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              if (c.eta != null) ...[
                                Icon(Icons.calendar_today, size: 12, color: Colors.grey[500]),
                                const SizedBox(width: 4),
                                Text('ETA: ${AppDateUtils.format(c.eta!)}', style: TextStyle(color: Colors.grey[500], fontSize: 11)),
                                const SizedBox(width: 16),
                              ],
                              if (c.embarques != null && c.embarques!.isNotEmpty)
                                Text('${c.embarques!.length} eventos', style: TextStyle(color: Colors.grey[500], fontSize: 11)),
                            ],
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
    );
  }
}
