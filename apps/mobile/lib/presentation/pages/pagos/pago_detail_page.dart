import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/date_utils.dart';
import '../../providers/data_providers.dart';

class PagoDetailPage extends ConsumerStatefulWidget {
  final String pagoId;
  const PagoDetailPage({super.key, required this.pagoId});

  @override
  ConsumerState<PagoDetailPage> createState() => _PagoDetailPageState();
}

class _PagoDetailPageState extends ConsumerState<PagoDetailPage> {
  bool _showAprobarForm = false;
  final _metodoPagoController = TextEditingController();
  final _referenciaController = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _metodoPagoController.dispose();
    _referenciaController.dispose();
    super.dispose();
  }

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
      'pendiente_aprobacion' => 'Pendiente de aprobación',
      'aprobado' => 'Aprobado',
      'rechazado' => 'Rechazado',
      'pagado' => 'Pagado',
      _ => estado,
    };
  }

  @override
  Widget build(BuildContext context) {
    final pagoAsync = ref.watch(pagoProvider(widget.pagoId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de Pago'),
      ),
      body: pagoAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (pago) {
          if (pago == null) {
            return const Center(child: Text('Pago no encontrado'));
          }

          final color = _estadoColor(pago.estado);

          return RefreshIndicator(
            onRefresh: () async =>
                ref.invalidate(pagoProvider(widget.pagoId)),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Header
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: color.withAlpha(20),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(Icons.wallet,
                              color: color, size: 28),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(pago.beneficiarioDisplay,
                                  style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold)),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: color.withAlpha(25),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  _estadoLabel(pago.estado),
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: color,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
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
                                  fontSize: 22, fontWeight: FontWeight.bold),
                            ),
                            Text(pago.moneda,
                                style: TextStyle(
                                    color: Colors.grey[500], fontSize: 12)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Details
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _DetailRow(
                            label: 'Beneficiario',
                            value: pago.beneficiarioDisplay),
                        const Divider(),
                        _DetailRow(
                            label: 'Monto',
                            value:
                                '\$${AppDateUtils.formatCurrency(pago.monto)} ${pago.moneda}'),
                        if (pago.tipoCambio != null) ...[
                          const Divider(),
                          _DetailRow(
                              label: 'Tipo de Cambio',
                              value: pago.tipoCambio.toString()),
                        ],
                        const Divider(),
                        _DetailRow(
                            label: 'Fecha',
                            value: AppDateUtils.format(pago.fechaPago)),
                        const Divider(),
                        _DetailRow(
                            label: 'Método de Pago',
                            value: pago.metodoPago ?? '—'),
                        const Divider(),
                        _DetailRow(
                            label: 'Referencia',
                            value: pago.referencia ?? '—'),
                        if (pago.notas != null) ...[
                          const Divider(),
                          _DetailRow(label: 'Notas', value: pago.notas!),
                        ],
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Actions for pending approval
                if (pago.estado == 'pendiente_aprobacion' && !_showAprobarForm) ...[
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () =>
                          setState(() => _showAprobarForm = true),
                      icon: const Icon(Icons.check_circle, size: 20),
                      label: const Text('Aprobar Pago'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.success,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => _rechazarPago(context),
                      icon: const Icon(Icons.cancel, size: 20),
                      label: const Text('Rechazar Pago'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.error,
                        side: const BorderSide(color: AppTheme.error),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                ],

                // Approve form
                if (_showAprobarForm) ...[
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Aprobar Pago',
                              style: TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          DropdownButtonFormField<String>(
                            value: null,
                            decoration: const InputDecoration(
                              labelText: 'Método de Pago *',
                              border: OutlineInputBorder(),
                            ),
                            items: const [
                              DropdownMenuItem(
                                  value: 'transferencia',
                                  child: Text('Transferencia')),
                              DropdownMenuItem(
                                  value: 'cheque',
                                  child: Text('Cheque')),
                              DropdownMenuItem(
                                  value: 'efectivo',
                                  child: Text('Efectivo')),
                              DropdownMenuItem(
                                  value: 'tarjeta',
                                  child: Text('Tarjeta')),
                              DropdownMenuItem(
                                  value: 'carta_de_credito',
                                  child: Text('Carta de Crédito')),
                            ],
                            onChanged: (v) =>
                                _metodoPagoController.text = v ?? '',
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _referenciaController,
                            decoration: const InputDecoration(
                              labelText: 'Referencia *',
                              hintText: 'Ej: REF-001',
                              border: OutlineInputBorder(),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: _loading
                                      ? null
                                      : () => _aprobarPago(context),
                                  icon: _loading
                                      ? const SizedBox(
                                          width: 18,
                                          height: 18,
                                          child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                              color: Colors.white))
                                      : const Icon(Icons.check, size: 18),
                                  label: Text(
                                      _loading ? 'Procesando...' : 'Confirmar'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppTheme.success,
                                    foregroundColor: Colors.white,
                                    padding:
                                        const EdgeInsets.symmetric(vertical: 12),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              TextButton(
                                onPressed: () => setState(() {
                                  _showAprobarForm = false;
                                  _metodoPagoController.clear();
                                  _referenciaController.clear();
                                }),
                                child: const Text('Cancelar'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],

                const SizedBox(height: 24),

                // Delete option
                Center(
                  child: TextButton.icon(
                    onPressed: () => _eliminarPago(context),
                    icon: const Icon(Icons.delete_outline, size: 18),
                    label: const Text('Eliminar pago'),
                    style: TextButton.styleFrom(foregroundColor: AppTheme.error),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _aprobarPago(BuildContext context) async {
    final metodoPago = _metodoPagoController.text.trim();
    final referencia = _referenciaController.text.trim();

    if (metodoPago.isEmpty || referencia.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Completa el método de pago y la referencia'),
            backgroundColor: AppTheme.warning),
      );
      return;
    }

    setState(() => _loading = true);

    final repo = ref.read(pagoRepositoryProvider);
    final result = await repo.aprobarPago(widget.pagoId,
        metodoPago: metodoPago, referencia: referencia);

    setState(() => _loading = false);

    result.fold(
      (failure) => ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text('Error: ${failure.message}'),
            backgroundColor: AppTheme.error),
      ),
      (_) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Pago aprobado correctamente'),
              backgroundColor: AppTheme.success),
        );
        setState(() {
          _showAprobarForm = false;
          _metodoPagoController.clear();
          _referenciaController.clear();
        });
        ref.invalidate(pagoProvider(widget.pagoId));
        ref.invalidate(pagosProvider);
      },
    );
  }

  Future<void> _rechazarPago(BuildContext context) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Rechazar pago'),
        content: const Text('¿Estás seguro de rechazar este pago?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Rechazar'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final repo = ref.read(pagoRepositoryProvider);
      final result = await repo.rechazarPago(widget.pagoId);

      result.fold(
        (failure) => ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Error: ${failure.message}'),
              backgroundColor: AppTheme.error),
        ),
        (_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Pago rechazado'),
                backgroundColor: AppTheme.warning),
          );
          ref.invalidate(pagoProvider(widget.pagoId));
          ref.invalidate(pagosProvider);
        },
      );
    }
  }

  Future<void> _eliminarPago(BuildContext context) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Eliminar pago'),
        content: const Text(
            '¿Estás seguro? Esta acción no se puede deshacer.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final repo = ref.read(pagoRepositoryProvider);
      final result = await repo.eliminarPago(widget.pagoId);

      result.fold(
        (failure) => ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Error: ${failure.message}'),
              backgroundColor: AppTheme.error),
        ),
        (_) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Pago eliminado'),
                backgroundColor: AppTheme.success),
          );
          ref.invalidate(pagosProvider);
          context.pop();
        },
      );
    }
  }
}

class _DetailRow extends StatelessWidget {
  final String label, value;
  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(label,
                style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 13,
                    fontWeight: FontWeight.w500)),
          ),
          Expanded(
            child: Text(value,
                style:
                    const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}
