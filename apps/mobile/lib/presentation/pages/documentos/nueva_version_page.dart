import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/data_providers.dart';
import '../../domain/entities/version_documento.dart';
import '../../shared/components/file_uploader.dart';

class NuevaVersionPage extends ConsumerStatefulWidget {
  final String documentoId;
  const NuevaVersionPage({super.key, required this.documentoId});

  @override
  ConsumerState<NuevaVersionPage> createState() => _NuevaVersionPageState();
}

class _NuevaVersionPageState extends ConsumerState<NuevaVersionPage> {
  final _formKey = GlobalKey<FormState>();
  String? _notes;

  @override
  Widget build(BuildContext context) {
    final docId = widget.documentoId;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nueva versión'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Adjuntar archivo',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              FileUploader(
                onUpload: (file) async {
                  // TODO: implement upload using repository
                  // For now just show a snackbar
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Archivo subido (simulado)')),
                  );
                  // Navigate back to detail after upload (simulate)
                  Future.microtask(() => context.pop());
                },
              ),
              const SizedBox(height: 24),
              const Text(
                'Notas de la versión (opcional)',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              TextFormField(
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: 'Describe los cambios realizados',
                ),
                maxLines: 3,
                onSaved: (value) => _notes = value,
                validator: (value) {
                  if (value != null && value.length > 500) {
                    return 'Máximo 500 caracteres';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  if (_formKey.currentState?.validate() ?? false) {
                    _formKey.currentState?.save();
                    // TODO: call repository to upload version with notes
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Versión guardada: $_notes')),
                    );
                    // Optionally navigate back to detail
                    Future.microtask(() => context.pop());
                  }
                },
                child: const Text('Guardar versión'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}