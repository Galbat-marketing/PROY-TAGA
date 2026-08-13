import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../pages/dashboard/dashboard_page.dart';
import '../pages/ofertas/ofertas_list_page.dart';
import '../pages/ofertas/oferta_detail_page.dart';
import '../pages/clientes/clientes_list_page.dart';
import '../pages/clientes/cliente_detail_page.dart';
import '../pages/productos/productos_list_page.dart';
import '../pages/productos/producto_detail_page.dart';
import '../pages/embarques/embarques_list_page.dart';
import '../pages/embarques/embarque_detail_page.dart';
import '../pages/cobros/cobros_list_page.dart';
import '../pages/notificaciones/notificaciones_page.dart';
import '../pages/perfil/perfil_page.dart';
import '../pages/documentos/documentos_list_page.dart';
import '../pages/documentos/documento_detail_page.dart';
import '../pages/documentos/nueva_version_page.dart';
import '../pages/documentos/historial_page.dart';
import '../pages/comerciales/comerciales_list_page.dart';
import '../pages/comerciales/comercial_detail_page.dart';
import '../pages/pagos/pagos_list_page.dart';
import '../pages/pagos/pago_detail_page.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    routes: [
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return ScaffoldWithNavBar(navigationShell: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            navigatorKey: _shellNavigatorKey,
            routes: [
              GoRoute(
                path: '/',
                builder: (context, state) => const DashboardPage(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/ofertas',
                builder: (context, state) => const OfertasListPage(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (context, state) => OfertaDetailPage(
                      ofertaId: state.pathParameters['id']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/clientes',
                builder: (context, state) => const ClientesListPage(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (context, state) => ClienteDetailPage(
                      clienteId: state.pathParameters['id']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/productos',
                builder: (context, state) => const ProductosListPage(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (context, state) => ProductoDetailPage(
                      productoId: state.pathParameters['id']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/embarques',
                builder: (context, state) => const EmbarquesListPage(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (context, state) => EmbarqueDetailPage(
                      contenedorId: state.pathParameters['id']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/documentos',
                builder: (context, state) => const DocumentosListPage(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (context, state) => DocumentoDetailPage(
                      documentoId: state.pathParameters['id']!,
                    ),
                  ),
                  GoRoute(
                    path: ':id/nueva-version',
                    builder: (context, state) => NuevaVersionPage(
                      documentoId: state.pathParameters['id']!,
                    ),
                  ),
                  GoRoute(
                    path: ':id/historial',
                    builder: (context, state) => HistorialPage(
                      documentoId: state.pathParameters['id']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
      // ── Comerciales ──
      GoRoute(
        path: '/comerciales',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ComercialesListPage(),
        routes: [
          GoRoute(
            path: ':id',
            builder: (context, state) => ComercialDetailPage(
              comercialId: state.pathParameters['id']!,
            ),
          ),
        ],
      ),
      GoRoute(
        path: '/cobros',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CobrosListPage(),
      ),
      // ── Pagos ──
      GoRoute(
        path: '/pagos',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const PagosListPage(),
        routes: [
          GoRoute(
            path: ':id',
            builder: (context, state) => PagoDetailPage(
              pagoId: state.pathParameters['id']!,
            ),
          ),
        ],
      ),
      GoRoute(
        path: '/notificaciones',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const NotificacionesPage(),
      ),
      GoRoute(
        path: '/perfil',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const PerfilPage(),
      ),
    ],
  );
});

class ScaffoldWithNavBar extends StatelessWidget {
  final StatefulNavigationShell navigationShell;
  const ScaffoldWithNavBar({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
              DrawerHeader(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.primary, AppTheme.primaryDark],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    const CircleAvatar(
                      radius: 24,
                      backgroundColor: Colors.white24,
                      child: Icon(Icons.business, color: Colors.white, size: 28),
                    ),
                    const SizedBox(height: 12),
                    Text('TAGA ERP',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: Colors.white, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Consumer(
                      builder: (context, ref, _) {
                        final user = ref.watch(currentUserProvider);
                        return Text(
                          user?['nombre'] as String? ?? 'Usuario',
                          style: const TextStyle(color: Colors.white70, fontSize: 13),
                        );
                      },
                    ),
                  ],
                ),
              ),
              _DrawerItem(
                icon: Icons.dashboard,
                label: 'Dashboard',
                selected: navigationShell.currentIndex == 0,
                onTap: () => _goToBranch(context, 0),
              ),
              _DrawerItem(
                icon: Icons.description,
                label: 'Ofertas',
                selected: navigationShell.currentIndex == 1,
                onTap: () => _goToBranch(context, 1),
              ),
              _DrawerItem(
                icon: Icons.people,
                label: 'Clientes',
                selected: navigationShell.currentIndex == 2,
                onTap: () => _goToBranch(context, 2),
              ),
              _DrawerItem(
                icon: Icons.inventory_2,
                label: 'Productos',
                selected: navigationShell.currentIndex == 3,
                onTap: () => _goToBranch(context, 3),
              ),
              _DrawerItem(
                icon: Icons.directions_boat,
                label: 'Embarques',
                selected: navigationShell.currentIndex == 4,
                onTap: () => _goToBranch(context, 4),
              ),
              const Divider(),
              _DrawerItem(
                icon: Icons.people_outline,
                label: 'Comerciales',
                onTap: () {
                  Navigator.pop(context);
                  context.push('/comerciales');
                },
              ),
              _DrawerItem(
                icon: Icons.payments_outlined,
                label: 'Pagos',
                onTap: () {
                  Navigator.pop(context);
                  context.push('/pagos');
                },
              ),
              _DrawerItem(
                icon: Icons.receipt_long_outlined,
                label: 'Cobros',
                onTap: () {
                  Navigator.pop(context);
                  context.push('/cobros');
                },
              ),
              _DrawerItem(
                icon: Icons.folder_outlined,
                label: 'Documentos',
                onTap: () {
                  Navigator.pop(context);
                  context.push('/documentos');
                },
              ),
              const Divider(),
              _DrawerItem(
                icon: Icons.notifications_outlined,
                label: 'Notificaciones',
                onTap: () {
                  Navigator.pop(context);
                  context.push('/notificaciones');
                },
              ),
              _DrawerItem(
                icon: Icons.person_outline,
                label: 'Perfil',
                onTap: () {
                  Navigator.pop(context);
                  context.push('/perfil');
                },
              ),
            ],
          ),
        ),
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) {
          navigationShell.goBranch(index, initialLocation: index == navigationShell.currentIndex);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.description_outlined),
            selectedIcon: Icon(Icons.description),
            label: 'Ofertas',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outlined),
            selectedIcon: Icon(Icons.people),
            label: 'Clientes',
          ),
          NavigationDestination(
            icon: Icon(Icons.inventory_2_outlined),
            selectedIcon: Icon(Icons.inventory_2),
            label: 'Productos',
          ),
          NavigationDestination(
            icon: Icon(Icons.directions_boat_outlined),
            selectedIcon: Icon(Icons.directions_boat),
            label: 'Embarques',
          ),
        ],
      ),
    );
  }

  void _goToBranch(BuildContext ctx, int index) {
    Navigator.pop(ctx);
    navigationShell.goBranch(index, initialLocation: index == navigationShell.currentIndex);
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool? selected;
  final VoidCallback onTap;

  const _DrawerItem({
    required this.icon,
    required this.label,
    this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: selected == true ? AppTheme.primary : null),
      title: Text(label,
          style: TextStyle(
            fontWeight: selected == true ? FontWeight.w600 : FontWeight.normal,
            color: selected == true ? AppTheme.primary : null,
          )),
      selected: selected == true,
      onTap: onTap,
    );
  }
}
