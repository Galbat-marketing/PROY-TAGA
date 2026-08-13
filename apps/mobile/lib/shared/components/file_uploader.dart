import 'package:flutter/material.dart';
import 'package:path/path.dart' as path;

class FileUploader extends StatelessWidget {
  final Function(File) onUpload;
  const FileUploader({required this.onUpload});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Selecciona un archivo:', style: TextStyle(fontWeight: FontWeight.bold)),
        ElevatedButton(
          onPressed: () async {
            try {
              // Implementar lógica de selección de archivo para la plataforma
              // Aquí se puede integrar con expo_file_manager_file o paquetes específicos de Flutter
              // Por simplicidad, se dejará como placeholder
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Selección de archivo implementado en plataforma destino')),
              );
            } catch (e) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Error al seleccionar archivo: $e')),
              );
            }
          },
          child: const Text('Elegir archivo'),
        ),
        if (onUpload is void Function(File)?)
          ElevatedButton(
            onPressed: () async {
              // Placeholder para subir archivo
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Subida implementada en plataforma destino')),
              );
            },
            child: const Text('Subir archivo'),
          ),
      ],
    );
  }
}