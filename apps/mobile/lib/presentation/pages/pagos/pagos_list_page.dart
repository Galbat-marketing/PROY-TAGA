import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/date_utils.dart';
import '../../providers/data_providers.dart';

class PagosListPage extends ConsumerWidget {
  const PagosListPage({super.key});

  Color _estadoColor(String estado) {
    return switch (estado) {
      'pendiente_aprobacion' => AppTheme.warning,
      'aprobado' => AppTheme.info,
      'rechazado' => AppTheme.error,
      'pagado' => AppTheme.success,
      _ => Colors.grey,
    };
  }

  String _estadoLabel(String estado) {
    return switch (estado) {
      'pendiente_aprobacion' => 'Pendiente',
      'aprobado' => 'Aprobado',
      'rechazado' => 'Rechazado',
      'pagado' => 'Pagado',
      _ => estado,
    };
  }

  IconData _estadoIcon(String estado) {
    return switch (estado) {
      'pendiente_aprobacion' => Icons.schedule,
      'aprobado' => Icons.check_circle,
      'rechazado' => Icons.cancel,
      'pagado' => Icons.paid,
      _ => Icons.payment,
    };
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pagosAsync = ref.watch(pagosProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pagos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(pagosProvider),
          ),
        ],
      ),
      body: pagosAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text('Error: $error', textAlign: TextAlign.center),
            ],
          ),
        ),
        data: (pagos) {
          if (pagos.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.payments_outlined, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('No hay pagos registrados',
                      style: Theme.of(context).textTheme.titleMedium),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(pagosProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: pagos.length,
              itemBuilder: (context, index) {
                final pago = pagos[index];
                final color = _estadoColor(pago.estado);

                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () => context.push('/pagos/${pago.id}'),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: color.withAlpha(20),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(_estadoIcon(pago.estado),
                                color: color, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  pago.beneficiarioDisplay,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w600, fontSize: 14),
                                ),
                                const SizedBox(height: 2),
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: color.withAlpha(25),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        _estadoLabel(pago.estado),
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: color,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      AppDateUtils.format(pago.fechaPago),
                                      style: TextStyle(
                                          color: Colors.grey[500], fontSize: 11),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '\$${AppDateUtils.formatCurrency(pago.monto)}',
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                              Text(pago.moneda,
                                  style: TextStyle(
                                      color: Colors.grey[500], fontSize: 11)),
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
