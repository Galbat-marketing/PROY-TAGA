import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/date_utils.dart';
import '../../providers/data_providers.dart';

class EmbarqueDetailPage extends ConsumerWidget {
  final String contenedorId;
  const EmbarqueDetailPage({super.key, required this.contenedorId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contenedoresAsync = ref.watch(contenedoresProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle Embarque'),
        actions: [
          PopupMenuButton(
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'refresh', child: Text('Actualizar estado')),
              const PopupMenuItem(value: 'share', child: Text('Compartir')),
            ],
          ),
        ],
      ),
      body: contenedoresAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (contenedores) {
          final c = contenedores.firstWhere(
            (c) => c.id == contenedorId,
            orElse: () => throw Exception('Contenedor no encontrado'),
          );

          final estadoColor = switch (c.estado) {
            'programado' => AppTheme.info,
            'en_transito' => AppTheme.warning,
            'en_aduana' => AppTheme.warning,
            'liberado' => AppTheme.success,
            'entregado' => AppTheme.success,
            _ => Colors.grey,
          };

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(c.numeroContenedor, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                              Text(c.tipo, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: estadoColor.withAlpha(25),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              c.estado.replaceAll('_', ' ')[0].toUpperCase() + c.estado.replaceAll('_', ' ').substring(1),
                              style: TextStyle(color: estadoColor, fontWeight: FontWeight.w600, fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 24),
                      if (c.naviera != null) _InfoRow(label: 'Naviera', value: c.naviera!),
                      if (c.booking != null) _InfoRow(label: 'Booking', value: c.booking!),
                      if (c.importadoraNombre != null) _InfoRow(label: 'Importadora', value: c.importadoraNombre!),
                      if (c.puertoOrigen != null) _InfoRow(label: 'Puerto origen', value: c.puertoOrigen!),
                      if (c.puertoDestino != null) _InfoRow(label: 'Puerto destino', value: c.puertoDestino!),
                      if (c.eta != null) _InfoRow(label: 'ETA', value: AppDateUtils.format(c.eta!)),
                      if (c.etd != null) _InfoRow(label: 'ETD', value: AppDateUtils.format(c.etd!)),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),
              Text('Seguimiento', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              if (c.embarques != null && c.embarques!.isNotEmpty)
                ...c.embarques!.map((e) {
                  final eColor = switch (e.estado) {
                    'programado' => AppTheme.info,
                    'en_transito' => AppTheme.warning,
                    'en_aduana' => AppTheme.warning,
                    'liberado' => AppTheme.success,
                    'entregado' => AppTheme.success,
                    _ => Colors.grey,
                  };

                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            margin: const EdgeInsets.only(top: 2),
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: eColor,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  e.estado.replaceAll('_', ' ')[0].toUpperCase() + e.estado.replaceAll('_', ' ').substring(1),
                                  style: const TextStyle(fontWeight: FontWeight.w500),
                                ),
                                if (e.descripcion != null)
                                  Text(e.descripcion!, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                if (e.ubicacionActual != null)
                                  Text('📍 ${e.ubicacionActual}', style: TextStyle(color: Colors.grey[500], fontSize: 11)),
                                const SizedBox(height: 4),
                                Text(
                                  AppDateUtils.format(e.fechaEvento, format: 'dd/MM/yyyy HH:mm'),
                                  style: TextStyle(color: Colors.grey[400], fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                })
              else
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Center(
                      child: Text('Sin eventos de seguimiento', style: TextStyle(color: Colors.grey[500])),
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
