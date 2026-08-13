import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:go_file_opener/go_file_opener.dart';
import '../../../core/theme/app_theme.dart';
import 'package:expo_file_manager_file/permission_handlers.dart';
import 'package:expo_file_manager_file/file_handler.dart';
import '../../providers/data_providers.dart';
import '../../domain/entities/documento.dart';
import '../../shared/components/file_uploader.dart';
import '../../shared/components/version_history.dart';

class DocumentoDetailPage extends ConsumerWidget {
  final String documentoId;
  const DocumentoDetailPage({super.key, required this.documentoId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final documentoAsync = ref.watch(documentoProvider(id: documentoId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalles del Documento'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () => context.push('/documentos/${documentoId}/nueva-version'),
          ),
        ],
      ),
      body: documentoAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (documento) {
          return Column(
            children: [
              // Información general
              Card(
                margin: const EdgeInsets.all(16),
                child: ListTile(
                  title: Text(documento.nombre),
                  subtitle: Text(
                    '${AppDateUtils.formatDocumento(documento.estado)} v${documento.versionActual}',
                    style: TextStyle(
                      color: AppTheme.getEstadoColor(documento.estado),
                      fontSize: 14,
                    ),
                  ),
                  trailing: Text(
                    AppDateUtils.formatFecha(documento.createdAt),
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                ),
              ),

              // Botones de acciones
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  ElevatedButton(
                    onPressed: () => context.push('/documentos/${documento.id}/nueva-version'),
                    child: const Text('Subir nueva versión'),
                  ),
                  const SizedBox(width: 16),
                  ElevatedButton(
                    onPressed: () => context.push('/documentos/${documento.id}/historial'),
                    child: const Text('Ver historial'),
                  ),
                ],
              ),

              // Historial de versiones
              const SizedBox(height: 16),
              Expanded(
                child: FutureBuilder<List<VersionDocumento>>(
                  future: ref.watch(versionHistoryProvider(documentoId)),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return const Center(child: CircularProgressIndicator());
                    } else if (snapshot.hasError) {
                      return Center(child: Text('Error al cargar historial: ${snapshot.error}'));
                    } else {
                      return VersionHistory(
                        versiones: snapshot.data ?? [],
                        onDownload: (version) => _downloadVersion(context, version),
                      );
                    }
                  },
                ),
              ),

              // Sección de preview (si hay archivo subido)
              if (documento.storagePath != null)
                const SizedBox(height: 16),
              if (documento.storagePath != null)
                TextButton(
                  onPressed: () => _abrirArchivo(context, documento.storagePath),
                  child: const Text('Abrir archivo'),
                ),
            ],
          );
        },
      ),
    );
  }

  void _abrirArchivo(BuildContext context, String storagePath) {
    try {
      final handler = PermissionHandler();
      final path = pathFromFileStoragePath(storagePath);
      GoFileOpener.open(path);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('No se puede abrir el archivo: $e'),
        duration: const Duration(seconds: 3),
      ));
    }
  }

  Future<void> _downloadVersion(BuildContext context, VersionDocumento version) async {
    try {
      final url = await fetchDownloadUrl(version.storagePath); // Implementar función para obtener URL de descarga
      await GoFileOpener.open(url);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Error al descargar: $e'),
        duration: const Duration(seconds: 3),
      ));
    }
  }
}