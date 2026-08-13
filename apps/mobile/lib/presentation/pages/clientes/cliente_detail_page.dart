import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/data_providers.dart';

class ClienteDetailPage extends ConsumerWidget {
  final String clienteId;
  const ClienteDetailPage({super.key, required this.clienteId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final clientesAsync = ref.watch(clientesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle Cliente'),
        actions: [
          IconButton(icon: const Icon(Icons.edit), onPressed: () {}),
          PopupMenuButton(
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'ofertas', child: Text('Ver ofertas')),
              const PopupMenuItem(value: 'historial', child: Text('Historial')),
            ],
          ),
        ],
      ),
      body: clientesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (clientes) {
          final cliente = clientes.firstWhere(
            (c) => c.id == clienteId,
            orElse: () => throw Exception('Cliente no encontrado'),
          );

          final rating = cliente.rating;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 32,
                        backgroundColor: AppTheme.primary.withAlpha(30),
                        child: Text(
                          cliente.nombre[0].toUpperCase(),
                          style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppTheme.primary),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(cliente.nombre, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      Text(cliente.codigo, style: TextStyle(color: Colors.grey[500], fontFamily: 'monospace', fontSize: 12)),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(5, (i) => Icon(
                          i < rating ? Icons.star : Icons.star_border,
                          color: AppTheme.warning,
                          size: 20,
                        )),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),
              Text('Información general', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _InfoRow(label: 'RFC', value: cliente.rfc ?? '—'),
                      _InfoRow(label: 'País', value: cliente.pais),
                      _InfoRow(label: 'Email', value: cliente.email ?? '—'),
                      _InfoRow(label: 'Teléfono', value: cliente.telefono ?? '—'),
                      _InfoRow(label: 'Moneda', value: cliente.monedaDefault),
                      _InfoRow(label: 'Condiciones pago', value: cliente.condicionesPago ?? '—'),
                      _InfoRow(label: 'Límite crédito', value: '\$${cliente.limiteCredito.toStringAsFixed(2)}'),
                      _InfoRow(label: 'Comercial', value: cliente.vendedorNombre ?? '—'),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.call),
                      label: const Text('Llamar'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.email_outlined),
                      label: const Text('Email'),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),
              Text('Últimas ofertas', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Card(
                child: ListTile(
                  title: const Text('OF-2026-00123', style: TextStyle(fontFamily: 'monospace')),
                  subtitle: const Text('\$45,000 · Aceptada'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push('/ofertas/${cliente.id}'),
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
