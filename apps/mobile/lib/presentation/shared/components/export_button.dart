import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';

class ExportButton extends ConsumerWidget {
  final String tipo;
  final Map<String, dynamic>? filtro;

  const ExportButton({
    super.key,
    required this.tipo,
    this.filtro,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.download),
      onSelected: (formato) => _exportar(context, formato),
      itemBuilder: (context) => [
        const PopupMenuItem(
          value: 'excel',
          child: Row(
            children: [
              Icon(Icons.table_chart),
              SizedBox(width: 8),
              Text('Excel (.xlsx)'),
            ],
          ),
        ),
        const PopupMenuItem(
          value: 'csv',
          child: Row(
            children: [
              Icon(Icons.description),
              SizedBox(width: 8),
              Text('CSV (.csv)'),
            ],
          ),
        ),
        const PopupMenuItem(
          value: 'pdf',
          child: Row(
            children: [
              Icon(Icons.picture_as_pdf),
              SizedBox(width: 8),
              Text('PDF (.pdf)'),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _exportar(BuildContext context, String formato) async {
    try {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Generando reporte...')),
      );

      // TODO: Llamar al endpoint /api/reportes o Edge Function
      // Por ahora simulamos la generación
      await Future.delayed(const Duration(seconds: 1));
      
      // Simular URL de descarga
      final url = 'https://api.taga-erp.com/reportes/${tipo}-${DateTime.now().millisecondsSinceEpoch}.$formato';
      
      // Compartir el enlace
      await Share.share(
        'Reporte de $tipo en formato $formato:\n$url',
        subject: 'Reporte $tipo',
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Reporte $formato generado y compartido')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al exportar: $e')),
      );
    }
  }
}