import 'package:flutter/material.dart';
import '../../domain/entities/version_documento.dart';

class VersionHistory extends StatelessWidget {
  final List<VersionDocumento> versiones;
  final Function(VersionDocumento) onDownload;
  const VersionHistory({required this.versiones, required this.onDownload});

  @override
  Widget build(BuildContext context) {
    if (versiones.isEmpty) {
      return const Center(child: Text('No hay versiones registradas'));
    }

    return ListView.builder(
      itemCount: versiones.length,
      itemBuilder: (context, index) {
        final version = versiones[index];
        return ListTile(
          title: Text('Versión ${version.version}'),
          subtitle: Text(version.notasCambio ?? 'Sin notas'),
          trailing: Text(
            '${version.fileSize != null ? (version.fileSize! / 1024 / 1024).toStringAsFixed(2) : 0} MB',
            style: TextStyle(color: Colors.grey[600]),
          ),
          onTap: () => onDownload(version),
        );
      },
    );
  }
}