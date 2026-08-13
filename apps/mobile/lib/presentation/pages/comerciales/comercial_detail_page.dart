import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/date_utils.dart';
import '../../providers/data_providers.dart';

class ComercialDetailPage extends ConsumerWidget {
  final String comercialId;
  const ComercialDetailPage({super.key, required this.comercialId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final comercialAsync = ref.watch(comercialProvider(comercialId));
    final comisionesAsync = ref.watch(comisionesSemanalesProvider(comercialId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle Comercial'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.invalidate(comercialProvider(comercialId));
              ref.invalidate(comisionesSemanalesProvider(comercialId));
            },
          ),
        ],
      ),
      body: comercialAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (comercial) {
          if (comercial == null) {
            return const Center(child: Text('Comercial no encontrado'));
          }

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(comercialProvider(comercialId));
              ref.invalidate(comisionesSemanalesProvider(comercialId));
            },
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Header card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundColor: AppTheme.primaryLight,
                          child: Text(
                            comercial.nombre.isNotEmpty
                                ? comercial.nombre[0].toUpperCase()
                                : '?',
                            style: const TextStyle(
                                fontSize: 22,
                                color: AppTheme.primary,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(comercial.nombre,
                                  style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Text(comercial.codigo,
                                  style: TextStyle(
                                      color: Colors.grey[600], fontSize: 14)),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: comercial.activo
                                      ? AppTheme.success.withAlpha(25)
                                      : Colors.grey.withAlpha(25),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  comercial.activo ? 'Activo' : 'Inactivo',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: comercial.activo
                                        ? AppTheme.success
                                        : Colors.grey,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Weekly commissions section
                Text('Comisiones Semanales (1%)',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 12),

                comisionesAsync.when(
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (error, _) => Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text('Error al cargar comisiones: $error'),
                    ),
                  ),
                  data: (comisiones) {
                    if (comisiones.isEmpty) {
                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            children: [
                              Icon(Icons.monetization_on_outlined,
                                  size: 48, color: Colors.grey[300]),
                              const SizedBox(height: 12),
                              Text('Sin comisiones',
                                  style: Theme.of(context).textTheme.titleMedium),
                              const SizedBox(height: 4),
                              Text(
                                'No hay ventas con cobro registradas para este comercial.',
                                style: TextStyle(color: Colors.grey[500]),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                      );
                    }

                    return Column(
                      children: comisiones.map((comision) {
                        final inicio =
                            DateTime.parse(comision.semanaInicio);
                        final fin = inicio.add(const Duration(days: 6));

                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Week range
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      '${AppDateUtils.format(inicio)} — ${AppDateUtils.format(fin)}',
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                          fontSize: 13),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: comision.isPagado
                                            ? AppTheme.success.withAlpha(25)
                                            : AppTheme.warning.withAlpha(25),
                                        borderRadius:
                                            BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        comision.isPagado
                                            ? 'Realizado'
                                            : 'Pendiente',
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: comision.isPagado
                                              ? AppTheme.success
                                              : AppTheme.warning,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),

                                // Stats
                                Row(
                                  children: [
                                    _StatItem(
                                        label: 'Ventas',
                                        value: '${comision.ventas}'),
                                    const SizedBox(width: 24),
                                    _StatItem(
                                        label: 'Total Ventas',
                                        value:
                                            '\$${AppDateUtils.formatCurrency(comision.totalVentas)}'),
                                    const SizedBox(width: 24),
                                    _StatItem(
                                        label: 'Comisión',
                                        value:
                                            '\$${AppDateUtils.formatCurrency(comision.comision)}',
                                        valueColor: AppTheme.success),
                                  ],
                                ),

                                // Pay button for pending commissions
                                if (!comision.isPagado) ...[
                                  const SizedBox(height: 12),
                                  SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton.icon(
                                      onPressed: () =>
                                          _confirmarPago(context, ref,
                                              comercialId, comision),
                                      icon: const Icon(Icons.check_circle,
                                          size: 18),
                                      label: const Text('Marcar como Pagado'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppTheme.success,
                                        foregroundColor: Colors.white,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    );
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _confirmarPago(BuildContext context, WidgetRef ref,
      String comercialId, dynamic comision) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirmar pago'),
        content: Text(
            '¿Marcar comisión de \$${AppDateUtils.formatCurrency(comision.comision)} como pagada?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.success,
              foregroundColor: Colors.white,
            ),
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final repo = ref.read(comercialRepositoryProvider);
      final result = await repo.marcarComisionPagada(
        comercialId,
        comision.semanaInicio,
        comision.comision,
      );

      result.fold(
        (failure) => ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Error: ${failure.message}'),
              backgroundColor: AppTheme.error),
        ),
        (_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Comisión marcada como pagada'),
                backgroundColor: AppTheme.success),
          );
          ref.invalidate(comisionesSemanalesProvider(comercialId));
        },
      );
    }
  }
}

class _StatItem extends StatelessWidget {
  final String label, value;
  final Color? valueColor;

  const _StatItem({
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: TextStyle(fontSize: 11, color: Colors.grey[600])),
        const SizedBox(height: 2),
        Text(value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: valueColor,
            )),
      ],
    );
  }
}
