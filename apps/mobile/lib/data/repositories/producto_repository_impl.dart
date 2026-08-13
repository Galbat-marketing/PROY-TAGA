import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../domain/entities/producto.dart';
import '../../domain/repositories/producto_repository.dart';
import '../datasources/remote/supabase_datasource.dart';
import '../datasources/local/local_storage_datasource.dart';
import '../models/producto_model.dart';

class ProductoRepositoryImpl implements ProductoRepository {
  final SupabaseDataSource _remote;
  final LocalStorageDataSource _local;

  ProductoRepositoryImpl(this._remote, this._local);

  @override
  Future<Either<Failure, List<Producto>>> getProductos({String? search}) async {
    try {
      final data = await _remote.query('productos', select: '*, categorias_productos!left(nombre)');
      final productos = data.map((json) {
        final cats = json['categorias_productos'] as Map<String, dynamic>?;
        json['categoria_nombre'] = cats?['nombre'];
        return ProductoModel.fromJson(json);
      }).toList();

      await _local.cacheData('productos', data);

      return Right(productos.map((m) => _toEntity(m)).toList());
    } catch (e) {
      // Try cache
      final cached = await _local.getCachedData('productos');
      if (cached != null) {
        final productos = (cached as List).map((j) => _toEntity(ProductoModel.fromJson(j as Map<String, dynamic>))).toList();
        return Right(productos);
      }
      return Left(ServerFailure('Error al cargar productos'));
    }
  }

  @override
  Future<Either<Failure, Producto>> getProducto(String id) async {
    try {
      final data = await _remote.getById('productos', id);
      if (data == null) return Left(ServerFailure('Producto no encontrado'));
      return Right(_toEntity(ProductoModel.fromJson(data)));
    } catch (e) {
      return Left(ServerFailure('Error al cargar producto'));
    }
  }

  @override
  Future<Either<Failure, List<Producto>>> searchProductos(String query) async {
    try {
      final response = await _remote.callFunction('busqueda-global', {'q': query});
      final data = response.data as Map<String, dynamic>?;
      final productos = (data?['resultados']?['productos'] as List?)
          ?.map((j) => ProductoModel.fromJson(j as Map<String, dynamic>))
          .toList() ?? [];
      return Right(productos.map((m) => _toEntity(m)).toList());
    } catch (e) {
      return Left(ServerFailure('Error en la búsqueda'));
    }
  }

  Producto _toEntity(ProductoModel m) => Producto(
    id: m.id,
    codigo: m.codigo,
    nombre: m.nombre,
    descripcion: m.descripcion,
    categoriaId: m.categoriaId,
    categoriaNombre: m.categoriaNombre,
    unidadMedida: m.unidadMedida,
    precioBase: m.precioBase,
    moneda: m.moneda,
    fraccionArancelaria: m.fraccionArancelaria,
    paisOrigen: m.paisOrigen,
    pesoKg: m.pesoKg,
    volumenM3: m.volumenM3,
    activo: m.activo,
    imagenUrl: m.imagenUrl,
    createdAt: DateTime.parse(m.createdAt),
  );
}
