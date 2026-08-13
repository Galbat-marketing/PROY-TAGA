import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/date_utils.dart';
import '../../providers/data_providers.dart';

class NotificacionesPage extends ConsumerWidget {
  const NotificacionesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifAsync = ref.watch(notificacionesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        actions: [
          TextButton(
            onPressed: () {},
            child: const Text('Marcar todas leídas'),
          ),
        ],
      ),
      body: notifAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (notificaciones) {
          if (notificaciones.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_none, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('Sin notificaciones', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text('No tienes notificaciones pendientes', style: TextStyle(color: Colors.grey[500])),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(notificacionesProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: notificaciones.length,
              itemBuilder: (context, index) {
                final n = notificaciones[index];
                final iconData = switch (n.tipo) {
                  'alerta' => Icons.warning_amber_rounded,
                  'informacion' => Icons.info_outline,
                  'aprobacion' => Icons.task_alt,
                  'vencimiento' => Icons.event,
                  _ => Icons.circle_notifications,
                };
                final iconColor = switch (n.tipo) {
                  'alerta' => AppTheme.error,
                  'informacion' => AppTheme.info,
                  'aprobacion' => AppTheme.success,
                  'vencimiento' => AppTheme.warning,
                  _ => Colors.grey,
                };

                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  color: n.leida ? null : AppTheme.primaryLight,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () {
                      if (!n.leida) {
                        ref.read(notificacionRepositoryProvider).marcarLeida(n.id);
                        ref.invalidate(notificacionesProvider);
                        ref.invalidate(notificacionesNoLeidasProvider);
                      }
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: iconColor.withAlpha(20),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(iconData, color: iconColor, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        n.titulo,
                                        style: TextStyle(
                                          fontWeight: n.leida ? FontWeight.normal : FontWeight.w600,
                                          fontSize: 14,
                                        ),
                                      ),
                                    ),
                                    if (!n.leida)
                                      Container(
                                        width: 8,
                                        height: 8,
                                        decoration: const BoxDecoration(
                                          color: AppTheme.primary,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                  ],
                                ),
                                if (n.mensaje != null) ...[
                                  const SizedBox(height: 4),
                                  Text(n.mensaje!, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                ],
                                const SizedBox(height: 4),
                                Text(
                                  AppDateUtils.formatRelative(n.createdAt),
                                  style: TextStyle(color: Colors.grey[400], fontSize: 11),
                                ),
                              ],
                            ),
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
