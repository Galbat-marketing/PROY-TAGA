import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/data_providers.dart';
import '../../domain/entities/documento.dart';

class DocumentosListPage extends ConsumerWidget {
  const DocumentosListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final documentosAsync = ref.watch(documentosProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Documentos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.push('/documentos/nuevo'),
          ),
        ],
      ),
      body: documentosAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (documentos) {
          if (documentos.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.file_upload, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  Text('No hay documentos', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () => context.push('/documentos/nuevo'),
                    child: const Text('Crear documento'),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(documentosProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: documentos.length,
              itemBuilder: (context, index) {
                final documento = documentos[index];
                final estadoColor = AppTheme.getEstadoColor(documento.estado);

                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () => context.push('/documentos/${documento.id}'),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          // Icono de tipo de documento
                          Icon(
                            _mappingTipoDocumento(documento.tipoDocumento),
                            color: estadoColor,
                            size: 24,
                          ),
                          const SizedBox(width: 12),
                          // Información principal
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(documento.nombre, style: const TextStyle(fontWeight: FontWeight.w600)),
                                const SizedBox(height: 4),
                                Text(
                                  '${AppDateUtils.formatDocumento(documento.estado)} v${documento.versionActual}',
                                  style: TextStyle(
                                    color: AppTheme.textColorSecondary,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          // Fecha de creación
                          Text(
                            AppDateUtils.formatFecha(documento.createdAt),
                            style: TextStyle(color: Colors.grey[600], fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  IconData _mappingTipoDocumento(String tipo) {
    switch (tipo) {
      case 'contrato': return Icons.attach_money;
      case 'certificado': return Icons.smartcard;
      case 'proforma': return Icons.card_month;
      case 'factura': return Icons.payment;
      case 'bl': return Icons.truck;
      case 'booking': return Icons.schedule;
      case 'expediente': return Icons.file_folder;
      case 'inspeccion': return Icons.accessibility;
      case 'adjunto': return Icons.file_upload;
      default: return Icons.file;
    }
  }
}