import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/data_providers.dart';
import '../../shared/components/version_history.dart';
import '../../domain/entities/historial_documento.dart';

class HistorialPage extends ConsumerWidget {
  final String documentoId;
  const HistorialPage({super.key, required this.documentoId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historialAsync = ref.watch(histialProvider(documentoId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Historial del documento'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: historialAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (historial) {
          if (historial.isEmpty) {
            return const Center(
              child: Text('No hay historial registrado'),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: historial.length,
            itemBuilder: (context, index) {
              final evento = historial[index];
              return ListTile(
                title: Text(evento.accion),
                subtitle: Text(
                  evento.usuarioId != null ? 'Por: ${evento.usuarioId}' : 'Sin usuario registrado',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                trailing: Text(
                  evento.createdAt,
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
              );
            },
          );
        },
      ),
    );
  }
}