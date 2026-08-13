import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/data_providers.dart';

class ComercialesListPage extends ConsumerWidget {
  const ComercialesListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final comercialesAsync = ref.watch(comercialesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Comerciales'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(comercialesProvider),
          ),
        ],
      ),
      body: comercialesAsync.when(
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
        data: (comerciales) {
          if (comerciales.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.people_outline, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('No hay comerciales registrados',
                      style: Theme.of(context).textTheme.titleMedium),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(comercialesProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: comerciales.length,
              itemBuilder: (context, index) {
                final comercial = comerciales[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: AppTheme.primaryLight,
                      child: Text(
                        comercial.nombre.isNotEmpty
                            ? comercial.nombre[0].toUpperCase()
                            : '?',
                        style: const TextStyle(
                            color: AppTheme.primary, fontWeight: FontWeight.bold),
                      ),
                    ),
                    title: Text(comercial.nombre,
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Row(
                      children: [
                        Text(comercial.codigo,
                            style: TextStyle(
                                color: Colors.grey[600], fontSize: 12)),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: comercial.activo
                                ? AppTheme.success.withAlpha(25)
                                : Colors.grey.withAlpha(25),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            comercial.activo ? 'Activo' : 'Inactivo',
                            style: TextStyle(
                              fontSize: 10,
                              color:
                                  comercial.activo ? AppTheme.success : Colors.grey,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/comerciales/${comercial.id}'),
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
