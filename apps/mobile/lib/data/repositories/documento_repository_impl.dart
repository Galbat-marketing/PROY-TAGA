import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/documento.dart';
import '../../domain/entities/version_documento.dart';
import '../../domain/entities/historial_documento.dart';
import '../../domain/repositories/documento_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';
import '../models/documento_model.dart';
import '../models/version_documento_model.dart';
import '../models/historial_documento_model.dart';

class DocumentoRepositoryImpl implements DocumentoRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  DocumentoRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, List<Documento>>> getDocumentos() async {
    try {
      final data = await _remote.query('documentos',
        select: '*, clientes!left(nombre)',
        order: 'created_at',
        ascending: false,
      );
      final documentos = data.map((json) => DocumentoModel.fromJson(json)).toList();
      await _local.cacheData('documentos', data);
      return Right(documentos.map((m) => _toEntity(m)).toList());
    } catch (e) {
      final cached = await _local.getCachedData('documentos');
      if (cached != null) {
        final documentos = (cached as List)
            .map((j) => _toEntity(DocumentoModel.fromJson(j as Map<String, dynamic>)))
            .toList();
        return Right(documentos);
      }
      return Left(ServerFailure('Error al cargar documentos'));
    }
  }

  @override
  Future<Either<Failure, Documento>> getDocumento(String id) async {
    try {
      final data = await _remote.query('documentos',
        select: '*, clientes!left(nombre)',
        eq: 'id',
        eqValue: id,
      );
      if (data.isEmpty) return Left(ServerFailure('Documento no encontrado'));
      return Right(_toEntity(DocumentoModel.fromJson(data.first)));
    } catch (e) {
      return Left(ServerFailure('Error al cargar documento'));
    }
  }

  @override
  Future<Either<Failure, List<VersionDocumento>>> getVersiones(String documentoId) async {
    try {
      final data = await _remote.query('versiones_documento',
        select: '*',
        eq: 'documento_id',
        eqValue: documentoId,
        order: 'version',
        ascending: true,
      );
      final versiones = data.map((json) => VersionDocumentoModel.fromJson(json)).toList();
      return Right(versiones.map((m) => _toVersionEntity(m)).toList());
    } catch (e) {
      return Left(ServerFailure('Error al cargar versiones'));
    }
  }

@override
  Future<Either<Failure, List<VersionDocumento>>> getVersiones(String documentoId) async {
    try {
      final data = await _remote.query('versiones_documento',
        select: '*',
        eq: 'documento_id',
        eqValue: documentoId,
        order: 'version',
        ascending: true,
      );
      final versiones = data.map((json) => VersionDocumentoModel.fromJson(json)).toList();
      return Right(versiones.map((m) => _toVersionEntity(m)).toList());
    } catch (e) {
      return Left(ServerFailure('Error al cargar versiones'));
    }
  }

  @override
  Future<Either<Failure, List<HistorialDocumento>>> getHistorial(String documentoId) async {
    try {
      final data = await _remote.query('historial_documento',
        select: '*',
        eq: 'documento_id',
        eqValue: documentoId,
        order: 'created_at',
        ascending: false,
      );
      final historial = data.map((json) => HistorialDocumentoModel.fromJson(json)).toList();
      return Right(historial.map((m) => _toHistorialEntity(m)).toList());
    } catch (e) {
      return Left(ServerFailure('Error al cargar historial'));
    }
  }

  @override
  Future<Either<Failure, Map<String, dynamic>>> generarReporte(
    String tipo, 
    String formato, 
    Map<String, dynamic>? filtro,
  ) async {
    try {
      // Construir la URL de la Edge Function
      final url = 'https://<your-project>.supabase.co/functions/v1/generar-reporte';
      final query = filtro;
      
      final response = await supabase.storage
        .from('reports')
        .upload('', ''); // This is just to trigger the function
      
      // Better approach: use supabase-js fetch
      final response2 = await supabase.rpc('generar-reporte', {
        'tipo': tipo,
        'formato': formato,
        ...filtro,
      });
      
      return Right(await response2);
    } catch (e) {
      return Left(ServerFailure('Error generando reporte'));
    }
  }
  }

  Documento _toEntity(DocumentoModel m) => Documento(
    id: m.id,
    nombre: m.nombre,
    tipoDocumento: m.tipoDocumento,
    descripcion: m.descripcion,
    estado: m.estado,
    versionActual: m.versionActual,
    createdAt: DateTime.parse(m.createdAt),
    updatedAt: m.updatedAt != null ? DateTime.tryParse(m.updatedAt!) : null,
  );

  VersionDocumento _toVersionEntity(VersionDocumentoModel m) => VersionDocumento(
    id: m.id,
    documentoId: m.documentoId,
    version: m.version,
    storagePath: m.storagePath,
    fileSize: m.fileSize,
    subidoPor: m.subidoPor,
    notasCambio: m.notasCambio,
    createdAt: m.createdAt,
  );

  HistorialDocumento _toHistorialEntity(HistorialDocumentoModel m) => HistorialDocumento(
    id: m.id,
    documentoId: m.documentoId,
    accion: m.accion,
    usuarioId: m.usuarioId,
    metadata: m.metadata,
    createdAt: m.createdAt,
  );

  @override
  Future<Either<Failure, Map<String, dynamic>>> generarReporte(
    String tipo, 
    String formato, 
    Map<String, dynamic>? filtro,
  ) async {
    try {
      final data = await _remote.query(tipo, select: '*');
      // TODO: Implement actual report generation
      // For now, return a mock URL
      return Right({
        'url': 'https://api.taga-erp.com/reportes/$tipo.$formato',
        'fileName': '$tipo.$formato',
      });
    } catch (e) {
      return Left(ServerFailure('Error generando reporte'));
    }
  }
}
