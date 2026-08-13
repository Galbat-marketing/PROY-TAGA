import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../entities/dashboard_kpi.dart';

abstract class DashboardRepository {
  Future<Either<Failure, DashboardKPI>> getKPIs();
}
