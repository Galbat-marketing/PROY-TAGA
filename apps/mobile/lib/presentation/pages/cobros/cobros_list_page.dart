import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/date_utils.dart';
import '../../providers/data_providers.dart';

class CobrosListPage extends ConsumerWidget {
  const CobrosListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cobrosAsync = ref.watch(cobrosProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cobros'),
        actions: [
          IconButton(icon: const Icon(Icons.filter_list), onPressed: () {}),
        ],
      ),
      body: cobrosAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (cobros) {
          if (cobros.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.account_balance_wallet_outlined, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('No hay cobros registrados', style: Theme.of(context).textTheme.titleMedium),
                ],
              ),
            );
          }

          final total = cobros.fold<double>(0, (sum, c) => sum + c.monto);

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(cobrosProvider),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total cobrado', style: TextStyle(fontWeight: FontWeight.w500)),
                        Text(
                          '\$${AppDateUtils.formatCurrency(total)}',
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.success),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                ...cobros.map((cobro) {
                  final metodoIcon = switch (cobro.metodoPago) {
                    'transferencia' => Icons.account_balance,
                    'efectivo' => Icons.money,
                    'cheque' => Icons.receipt_long,
                    'tarjeta' => Icons.credit_card,
                    _ => Icons.payment,
                  };

                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.success.withAlpha(20),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.check_circle, color: AppTheme.success, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    if (cobro.facturaFolio != null)
                                      Text(cobro.facturaFolio!, style: const TextStyle(fontWeight: FontWeight.w600, fontFamily: 'monospace', fontSize: 13)),
                                    if (cobro.facturaFolio != null && cobro.clienteNombre != null)
                                      const SizedBox(width: 8),
                                    if (cobro.clienteNombre != null)
                                      Text(cobro.clienteNombre!, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Row(
                                  children: [
                                    Icon(metodoIcon, size: 12, color: Colors.grey[500]),
                                    const SizedBox(width: 4),
                                    Text(
                                      cobro.metodoPago[0].toUpperCase() + cobro.metodoPago.substring(1),
                                      style: TextStyle(color: Colors.grey[500], fontSize: 11),
                                    ),
                                    const SizedBox(width: 12),
                                    Text(
                                      AppDateUtils.format(cobro.fechaCobro),
                                      style: TextStyle(color: Colors.grey[500], fontSize: 11),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '\$${AppDateUtils.formatCurrency(cobro.monto)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          );
        },
      ),
    );
  }
}
