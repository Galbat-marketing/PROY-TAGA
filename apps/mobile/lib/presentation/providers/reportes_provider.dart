import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/documento_repository_impl.dart';
import '../../domain/entities/reporte.dart';
import '../../domain/repositories/documento_repository.dart';

final reportesProvider = FutureProvider.autoDispose<Representation>((ref) async {
  final repository = ref.watch(documentoRepositoryProvider);
  
  return repository.generarReporte(
    tipo: 'documentos',
    formato: 'pdf',
    filtro: {'estado': 'pendiente'},
  );
});