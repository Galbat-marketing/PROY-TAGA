import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/data_providers.dart';
import '../../../core/utils/date_utils.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final noLeidas = ref.watch(notificacionesNoLeidasProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Hola, ${user?['nombre'] ?? 'Usuario'}'),
        leading: Builder(
          builder: (ctx) => IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Scaffold.of(ctx).openDrawer(),
          ),
        ),
        actions: [
          IconButton(
            icon: Badge(
              smallSize: 8,
              isLabelVisible: noLeidas.valueOrNull != null && noLeidas.valueOrNull! > 0,
              label: Text('${noLeidas.valueOrNull ?? 0}'),
              child: const Icon(Icons.notifications_outlined),
            ),
            onPressed: () => context.push('/notificaciones'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(productosProvider);
          ref.invalidate(ofertasProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // KPIs row
            SizedBox(
              height: 100,
              child: Row(
                children: [
                  Expanded(
                    child: _KpiCard(
                      title: 'Ventas Mes',
                      value: '\$450K',
                      subtitle: '+12%',
                      color: AppTheme.success,
                      icon: Icons.trending_up,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _KpiCard(
                      title: 'Cobrado',
                      value: '\$230K',
                      subtitle: '-5%',
                      color: AppTheme.warning,
                      icon: Icons.account_balance_wallet,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _KpiCard(
                      title: 'Pendiente',
                      value: '\$89K',
                      subtitle: '+3%',
                      color: AppTheme.info,
                      icon: Icons.pending_actions,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Quick actions
            Text('Acciones rápidas', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            Row(
              children: [
                _ActionChip(
                  icon: Icons.add_circle_outline,
                  label: 'Nueva Oferta',
                  onTap: () => context.push('/ofertas'),
                ),
                const SizedBox(width: 12),
                _ActionChip(
                  icon: Icons.search,
                  label: 'Buscar',
                  onTap: () {},
                ),
                const SizedBox(width: 12),
                _ActionChip(
                  icon: Icons.qr_code_scanner,
                  label: 'Escanear',
                  onTap: () {},
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Modules grid
            Text('Módulos', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            Row(
              children: [
                _ModuleCard(
                  icon: Icons.people_outline,
                  label: 'Comerciales',
                  color: AppTheme.primary,
                  onTap: () => context.push('/comerciales'),
                ),
                const SizedBox(width: 12),
                _ModuleCard(
                  icon: Icons.payments_outlined,
                  label: 'Pagos',
                  color: AppTheme.success,
                  onTap: () => context.push('/pagos'),
                ),
                const SizedBox(width: 12),
                _ModuleCard(
                  icon: Icons.account_balance_wallet_outlined,
                  label: 'Cobros',
                  color: AppTheme.info,
                  onTap: () => context.push('/cobros'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _ModuleCard(
                  icon: Icons.folder_outlined,
                  label: 'Documentos',
                  color: AppTheme.warning,
                  onTap: () => context.push('/documentos'),
                ),
                const SizedBox(width: 12),
                _ModuleCard(
                  icon: Icons.receipt_long_outlined,
                  label: 'Facturas',
                  color: AppTheme.error,
                  onTap: () {}, // Placeholder for future
                ),
                const SizedBox(width: 12),
                _ModuleCard(
                  icon: Icons.inventory_outlined,
                  label: 'Proveedores',
                  color: Colors.blueGrey,
                  onTap: () {}, // Placeholder for future
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Recent offers
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Últimas ofertas', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                TextButton(
                  onPressed: () => context.push('/ofertas'),
                  child: const Text('Ver todas'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            _OfertaTile(
              folio: 'OF-2026-00123',
              cliente: 'Importadora del Norte',
              total: '\$45,000',
              estado: 'Aceptada',
              estadoColor: AppTheme.success,
            ),
            _OfertaTile(
              folio: 'OF-2026-00122',
              cliente: 'Comercializadora Sur',
              total: '\$23,500',
              estado: 'Borrador',
              estadoColor: AppTheme.warning,
            ),
            _OfertaTile(
              folio: 'OF-2026-00121',
              cliente: 'Distribuidora Central',
              total: '\$67,200',
              estado: 'Rechazada',
              estadoColor: AppTheme.error,
            ),

            const SizedBox(height: 24),

            // Alerts
            Text('Alertas', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            _AlertTile(
              icon: Icons.directions_boat,
              title: 'Contenedor MSCU-4567890',
              subtitle: 'Llega en 3 días',
              color: AppTheme.warning,
            ),
            _AlertTile(
              icon: Icons.payment,
              title: 'Factura F-001 vence mañana',
              subtitle: '\$12,500 pendientes',
              color: AppTheme.error,
            ),
          ],
        ),
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String title, value, subtitle;
  final Color color;
  final IconData icon;

  const _KpiCard({required this.title, required this.value, required this.subtitle, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontSize: 11, color: Colors.grey)),
                Icon(icon, size: 16, color: color),
              ],
            ),
            Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text(subtitle, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}

class _ActionChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionChip({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: AppTheme.primaryLight,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Icon(icon, color: AppTheme.primary),
              const SizedBox(height: 4),
              Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ),
    );
  }
}

class _OfertaTile extends StatelessWidget {
  final String folio, cliente, total, estado;
  final Color estadoColor;

  const _OfertaTile({required this.folio, required this.cliente, required this.total, required this.estado, required this.estadoColor});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        title: Text(folio, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
        subtitle: Text(cliente, style: const TextStyle(fontSize: 12)),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(total, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 2),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: estadoColor.withAlpha(25),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(estado, style: TextStyle(fontSize: 10, color: estadoColor, fontWeight: FontWeight.w500)),
            ),
          ],
        ),
        onTap: () => context.push('/ofertas/$folio'),
      ),
    );
  }
}

class _AlertTile extends StatelessWidget {
  final IconData icon;
  final String title, subtitle;
  final Color color;

  const _AlertTile({required this.icon, required this.title, required this.subtitle, required this.color});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: color),
        title: Text(title, style: const TextStyle(fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      ),
    );
  }
}

class _ModuleCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ModuleCard({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          decoration: BoxDecoration(
            color: color.withAlpha(15),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withAlpha(30)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 24),
              const SizedBox(height: 6),
              Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color)),
            ],
          ),
        ),
      ),
    );
  }
}
