import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/documento.dart';
import '../entities/version_documento.dart';
import '../entities/historial_documento.dart';

abstract class DocumentoRepository {
  Future<Either<Failure, List<Documento>>> getDocumentos();
  Future<Either<Failure, Documento>> getDocumento(String id);
  Future<Either<Failure, List<VersionDocumento>>> getVersiones(String documentoId);
  Future<Either<Failure, List<HistorialDocumento>>> getHistorial(String documentoId);
  Future<Either<Failure, Map<String, dynamic>>> generarReporte(String tipo, String formato, Map<String, dynamic>? filtro);
}