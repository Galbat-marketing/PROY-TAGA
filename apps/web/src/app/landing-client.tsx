/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ChevronDown,
  Globe,
  Shield,
  Ship,
  BarChart3,
  Star,
  Package,
  MapPin,
  TrendingUp,
  Users,
  Building2,
  Anchor,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  Send,
  PieChart,
  DollarSign,
  Sun,
  Moon,
} from "lucide-react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts"

import { useThemeStore } from "@/lib/stores/theme-store"

/* ═══════════════════════════════════════════════════════
   TIPOS
   ═══════════════════════════════════════════════════════ */

interface ProductoPublic {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  categoria: string
  unidad_medida: string | null
  precio_base: number
  moneda: string
  pais_origen: string | null
  peso_kg: number | null
  volumen_m3: number | null
  imagen_url: string | null
  created_at: string
}

interface CategoriaPublic {
  id: string
  nombre: string
  descripcion: string | null
}

interface LandingMetrics {
  productosActivos: number
  categoriasActivas: number
  paisesOrigen: number
  clientesActivos: number
  totalProductos: number
}

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */

const ICONOS_CATEGORIA = [Sparkles, Star, Package, Building2, Ship, Globe, Shield, TrendingUp] as const
const COLORES_CATEGORIA = [
  "from-fuchsia-500/30 to-[#bb7dae]/30",
  "from-violet-500/30 to-purple-500/30",
  "from-[#29bdbf]/30 to-[#29bdbf]/30",
  "from-amber-500/30 to-orange-500/30",
  "from-[#bb7dae]/30 to-[#bb7dae]/30",
  "from-[#29bdbf]/30 to-indigo-500/30",
  "from-lime-500/30 to-green-500/30",
  "from-fuchsia-500/30 to-violet-500/30",
]

/* ═══════════════════════════════════════════════════════
   FLOATING ORBS (background decoration)
   ═══════════════════════════════════════════════════════ */

function FloatingOrbs() {
  const { scrollYProgress } = useScroll()
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150])
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <motion.div style={{ y: y1 }} className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#bb7dae]/5 blur-[120px]" />
      <motion.div style={{ y: y2 }} className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
      <motion.div style={{ y: y3 }} className="absolute -bottom-40 left-1/4 h-[350px] w-[350px] rounded-full bg-[#bb7dae]/5 blur-[90px]" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════ */

const NAV_LINKS = [
  { label: "Inicio", href: "#hero" },
  { label: "Categorías", href: "#categorias" },
  { label: "Productos", href: "#productos" },
  { label: "Tendencias", href: "#tendencias" },
  { label: "Servicios", href: "#servicios" },
  { label: "Contacto", href: "#contacto" },
]

function LinkTo({ href, children, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: "smooth" })
    }
  }
  return <a href={href} onClick={handleClick} className={className} {...props}>{children}</a>
}

function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.85])
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)

  const isDark = mode === "dark" || (mode === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const toggleTheme = () => setMode(isDark ? "light" : "dark")

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 z-40 flex h-16 w-full items-center border-b border-[var(--lp-border)] backdrop-blur-xl transition-colors"
    >
      {/* Background layer with scroll opacity */}
      <motion.div
        style={{ opacity: useTransform(scrollY, [0, 100], [0, 1]) }}
        className="pointer-events-none absolute inset-0 bg-[var(--lp-bg)]"
      />
      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <LinkTo href="#hero" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#bb7dae] to-[#29bdbf]">
            <span className="text-xs font-black text-white">T</span>
          </div>
          <span className="text-base font-bold tracking-tight text-[var(--lp-text)]">LUMAVI</span>
        </LinkTo>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <LinkTo
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-[var(--lp-text-nav)] transition-colors hover:bg-[var(--lp-card-bg-hover)] hover:text-[var(--lp-text)]"
            >
              {link.label}
            </LinkTo>
          ))}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--lp-text-nav)] transition-colors hover:bg-[var(--lp-card-bg-hover)] hover:text-[var(--lp-text)]"
            aria-label={isDark ? "Modo claro" : "Modo oscuro"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <LinkTo
            href="/login"
            className="ml-2 rounded-full bg-gradient-to-r from-[#bb7dae] to-[#29bdbf] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#bb7dae]/20 transition-all duration-300 hover:from-[#bb7dae] hover:to-[#29bdbf] hover:shadow-[#bb7dae]/30"
          >
            Iniciar Sesión
          </LinkTo>
        </div>

        {/* Mobile hamburger + theme */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--lp-text-nav)] transition-colors hover:bg-[var(--lp-card-bg-hover)] hover:text-[var(--lp-text)]"
            aria-label={isDark ? "Modo claro" : "Modo oscuro"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMobileMenu((p) => !p)}
            className="flex items-center justify-center rounded-lg p-2 text-[var(--lp-text-nav)] transition-colors hover:bg-[var(--lp-card-bg-hover)] hover:text-[var(--lp-text)]"
            aria-label="Menú"
          >
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-16 left-0 w-full overflow-hidden border-b border-[var(--lp-border)] bg-[var(--lp-overlay)] backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {NAV_LINKS.map((link) => (
                <LinkTo
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenu(false)}
                  className="rounded-lg px-4 py-3 text-sm text-[var(--lp-text-nav)] transition-colors hover:bg-[var(--lp-card-bg-hover)] hover:text-[var(--lp-text)]"
                >
                  {link.label}
                </LinkTo>
              ))}
              <LinkTo
                href="/login"
                className="mt-2 rounded-full bg-gradient-to-r from-[#bb7dae] to-[#29bdbf] px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Iniciar Sesión
              </LinkTo>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

/* ═══════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════ */

function HeroSection({ metrics }: { metrics: LandingMetrics }) {
 
  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#bb7dae]/10 via-[#29bdbf]/5 to-transparent blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#bb7dae]/20 bg-[#bb7dae]/5 px-4 py-1.5 text-xs font-medium text-[#bb7dae] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Plataforma Inteligente de Comercio Internacional
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-[var(--lp-text)] sm:text-5xl md:text-6xl lg:text-7xl">
            Gestiona tu{' '}
            <span className="bg-gradient-to-r from-[#bb7dae] via-[#bb7dae] to-[#29bdbf] bg-clip-text text-transparent">
              Comercio Global
            </span>{' '}
            con Inteligencia
          </h1>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <LinkTo
              href="#productos"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#bb7dae] to-[#29bdbf] px-8 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-[#bb7dae]/25 transition-all duration-300 hover:from-[#bb7dae] hover:to-[#29bdbf] hover:shadow-[#bb7dae]/40"
            >
              Explorar Productos
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </LinkTo>
            <LinkTo
              href="#servicios"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--lp-border)] bg-[var(--lp-card-bg-solid)] px-8 py-3.5 text-sm font-medium text-[var(--lp-text-secondary)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--lp-border)] hover:text-[var(--lp-text)]"
            >
              Conocer Más
            </LinkTo>
          </div>

          {/* Stats row */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-[var(--lp-border)] pt-10">
            {[
              { value: `${metrics.productosActivos}+`, label: "Productos" },
              { value: `${metrics.categoriasActivas}+`, label: "Categorías" },
              { value: `${metrics.paisesOrigen}+`, label: "Países" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-[var(--lp-text)] sm:text-2xl">{stat.value}</div>
                <div className="mt-0.5 text-xs text-[var(--lp-text-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="h-5 w-5 text-[var(--lp-text-muted)]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   SECTION HEADING
   ═══════════════════════════════════════════════════════ */

function SectionHeading({
  badge,
  title,
  subtitle,
}: {
  badge?: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-14 text-center">
      {badge && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 inline-block rounded-full border border-[#bb7dae]/15 bg-[#bb7dae]/5 px-4 py-1 text-xs font-medium text-[#bb7dae]/80 backdrop-blur-sm"
        >
          {badge}
        </motion.span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-bold tracking-tight text-[var(--lp-text)] sm:text-4xl lg:text-5xl"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-base leading-relaxed text-[var(--lp-text-secondary)] sm:text-lg"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   CATEGORÍAS
   ═══════════════════════════════════════════════════════ */

function CategoriasSection({ categorias }: { categorias: CategoriaPublic[] }) {
  const items = categorias.slice(0, 8).map((cat, i) => ({
    id: cat.id,
    nombre: cat.nombre,
    descripcion: cat.descripcion ?? "",
    icono: ICONOS_CATEGORIA[i % ICONOS_CATEGORIA.length],
    color: COLORES_CATEGORIA[i % COLORES_CATEGORIA.length],
  }))

  if (items.length === 0) return null

  return (
    <section id="categorias" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="Categorías"
          title="Explora por Categoría"
          subtitle="Navega nuestra amplia gama de productos organizados por sector industrial"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((cat, i) => (
            <motion.a
              key={cat.id}
              href="#productos"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-[var(--lp-border)] bg-gradient-to-b from-[var(--lp-card-bg-solid)] to-[var(--lp-card-bg-solid)] p-6 backdrop-blur-sm transition-all duration-500 hover:border-[var(--lp-border)] hover:shadow-2xl hover:shadow-[#bb7dae]/5"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--lp-card-bg-solid)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} shadow-lg`}
                >
                  <cat.icono className="h-6 w-6 text-[var(--lp-text)]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--lp-text)]">{cat.nombre}</h3>
                <p className="text-sm leading-relaxed text-[var(--lp-text-secondary)]">{cat.descripcion}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   PRODUCT CARD
   ═══════════════════════════════════════════════════════ */

function ProductCard({
  producto,
  index,
}: {
  producto: ProductoPublic
  index: number
}) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const hasImage = !!producto.imagen_url && !imgError

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-[var(--lp-border)] bg-gradient-to-b from-[var(--lp-card-bg-solid)] to-[var(--lp-card-bg-solid)] backdrop-blur-sm transition-all duration-500 hover:border-[var(--lp-border)] hover:shadow-2xl hover:shadow-[#bb7dae]/5"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {hasImage ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--lp-card-bg-solid)]">
                <div className="h-8 w-8 animate-pulse rounded-full border border-[var(--lp-border)] bg-[var(--lp-card-bg-solid)]" />
              </div>
            )}
            <img
              src={producto.imagen_url!}
              alt={producto.nombre}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--lp-card-bg-solid)] to-[var(--lp-card-bg-hover)]">
            <svg
              className="h-16 w-16 text-[var(--lp-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={0.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Origin badge */}
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--lp-overlay)] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--lp-text-secondary)] backdrop-blur-sm">
          <MapPin className="h-2.5 w-2.5" />
          {producto.pais_origen || "Global"}
        </div>

        {/* Quick view */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--lp-card-bg-hover)] backdrop-blur-xl">
            <ArrowUpRight className="h-5 w-5 text-[var(--lp-text)]" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#bb7dae]/70">
          <span>{producto.categoria}</span>
          <span className="text-[var(--lp-text-muted)]">·</span>
          <span className="text-[var(--lp-text-muted)]">{producto.codigo}</span>
        </div>
        <h3 className="mb-2 text-base font-semibold leading-snug text-[var(--lp-text)] transition-colors group-hover:text-[#bb7dae]">
          {producto.nombre}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--lp-text-secondary)]">
          {producto.descripcion || "Sin descripción"}
        </p>

        <div className="flex items-center justify-between border-t border-[var(--lp-border)] pt-4">
          <div>
            <span className="text-lg font-bold text-[var(--lp-text)]">
              ${Number(producto.precio_base).toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="ml-1 text-xs text-[var(--lp-text-muted)]">{producto.moneda}</span>
          </div>
          {producto.peso_kg && (
            <div className="flex items-center gap-1 text-xs text-[var(--lp-text-muted)]">
              <Package className="h-3 w-3" />
              {producto.peso_kg} kg
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════
   PRODUCTOS (grid)
   ═══════════════════════════════════════════════════════ */

function ProductosSection({
  productos,
  categorias,
}: {
  productos: ProductoPublic[]
  categorias: CategoriaPublic[]
}) {
  const [selectedCat, setSelectedCat] = useState<string>("todas")

  const filtered = selectedCat === "todas" ? productos : productos.filter((p) => p.categoria === selectedCat)

  // Get unique categories from actual productos data
  const catsDisponibles = Array.from(new Set(productos.map((p) => p.categoria))).sort()

  return (
    <section id="productos" className="relative py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#bb7dae]/[0.02] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="Catálogo"
          title="Nuestros Productos"
          subtitle="Explora nuestra selección de productos importados con precios competitivos"
        />

        {/* Filters */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedCat("todas")}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 ${
              selectedCat === "todas"
                ? "bg-[#bb7dae]/20 text-[#bb7dae] ring-1 ring-[#bb7dae]/30"
                : "bg-[var(--lp-card-bg-solid)] text-[var(--lp-text-secondary)] hover:bg-[var(--lp-card-bg-hover)] hover:text-[var(--lp-text-secondary)]"
            }`}
          >
            Todas
          </button>
          {catsDisponibles.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 ${
                selectedCat === cat
                  ? "bg-[#bb7dae]/20 text-[#bb7dae] ring-1 ring-[#bb7dae]/30"
                  : "bg-[var(--lp-card-bg-solid)] text-[var(--lp-text-secondary)] hover:bg-[var(--lp-card-bg-hover)] hover:text-[var(--lp-text-secondary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((prod, i) => (
            <ProductCard key={prod.id} producto={prod} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-sm text-[var(--lp-text-muted)]">
            No hay productos en esta categoría
          </div>
        )}
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   TENDENCIAS DE IMPORTACIÓN — CUBA
   ═══════════════════════════════════════════════════════ */

const CHART_COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6", "#14b8a6"]
const MONEDA_SYMBOLS: Record<string, string> = { USD: "$", EUR: "€", MLC: "MLC", CUP: "$", GBP: "£", CNY: "¥" }
const MONEDA_LABELS: Record<string, string> = { USD: "Dólar", EUR: "Euro", MLC: "MLC", CUP: "CUP", GBP: "Libra", CNY: "Yuan" }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[var(--lp-border)] bg-[var(--lp-overlay)] px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="text-xs font-medium text-[var(--lp-text-secondary)]">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-semibold text-[var(--lp-text)]" style={{ color: entry.color }}>
          {typeof entry.value === "number" && entry.name !== "cantidad"
            ? entry.name === "precio promedio"
              ? `${MONEDA_SYMBOLS[entry.payload?.moneda || "USD"] ?? "$"}${Number(entry.value).toLocaleString("es")}`
              : entry.value.toLocaleString("es")
            : entry.value}{" "}
          {entry.name === "cantidad" ? "productos" : ""}
        </p>
      ))}
      {payload[0]?.payload?.moneda && (
        <p className="mt-1 text-[10px] text-[var(--lp-text-muted)]">
          Moneda: {MONEDA_LABELS[payload[0].payload.moneda] ?? payload[0].payload.moneda}
        </p>
      )}
    </div>
  )
}

function TendenciasSection({ productos }: { productos: ProductoPublic[] }) {
  /* ─── Category distribution ─── */
  const catMap = new Map<string, number>()
  productos.forEach((p) => {
    catMap.set(p.categoria, (catMap.get(p.categoria) || 0) + 1)
  })
  const catData = Array.from(catMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  /* ─── Country distribution ─── */
  const countryMap = new Map<string, number>()
  productos.forEach((p) => {
    const origin = p.pais_origen || "Otros"
    countryMap.set(origin, (countryMap.get(origin) || 0) + 1)
  })
  let countryData = Array.from(countryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  if (countryData.length > 6) {
    const top = countryData.slice(0, 5)
    const otros = countryData.slice(5).reduce((acc, c) => acc + c.value, 0)
    countryData = [...top, { name: "Otros", value: otros }]
  }

  /* ─── Currency distribution ─── */
  const currencyMap = new Map<string, number>()
  productos.forEach((p) => {
    const m = p.moneda || "USD"
    currencyMap.set(m, (currencyMap.get(m) || 0) + 1)
  })
  const currencyData = Array.from(currencyMap.entries())
    .map(([name, value]) => ({
      name: MONEDA_LABELS[name] ?? name,
      value,
      code: name,
    }))
    .sort((a, b) => b.value - a.value)

  /* ─── Price stats ─── */
  const prices = productos.map((p) => p.precio_base).filter((p) => p > 0)
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
  const maxPrice = Math.max(...prices, 0)
  const minPrice = Math.min(...prices, 0)

  /* ─── Price by category ─── */
  const catPrices = new Map<string, { values: number[]; moneda: string }>()
  productos.forEach((p) => {
    if (p.precio_base > 0) {
      const entry = catPrices.get(p.categoria) || { values: [], moneda: p.moneda || "USD" }
      entry.values.push(p.precio_base)
      catPrices.set(p.categoria, entry)
    }
  })
  const priceData = Array.from(catPrices.entries())
    .map(([name, { values, moneda }]) => ({
      name,
      moneda,
      promedio: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    }))
    .sort((a, b) => b.promedio - a.promedio)
    .slice(0, 8)

  /* ─── Weight & volume stats ─── */
  const weights = productos.map((p) => p.peso_kg).filter((w): w is number => w !== null && w > 0)
  const volumes = productos.map((p) => p.volumen_m3).filter((v): v is number => v !== null && v > 0)
  const avgWeight = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  const totalVolume = volumes.reduce((a, b) => a + b, 0)

  /* ─── Weight by category ─── */
  const catWeights = new Map<string, number[]>()
  productos.forEach((p) => {
    if (p.peso_kg && p.peso_kg > 0) {
      const arr = catWeights.get(p.categoria) || []
      arr.push(p.peso_kg)
      catWeights.set(p.categoria, arr)
    }
  })
  const weightData = Array.from(catWeights.entries())
    .map(([name, vals]) => ({
      name,
      peso: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    }))
    .sort((a, b) => b.peso - a.peso)
    .slice(0, 8)

  if (productos.length === 0) return null

  return (
    <section id="tendencias" className="relative py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#29bdbf]/[0.02] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="Importaciones · Cuba"
          title="Tendencias de Importación"
          subtitle="Análisis del portafolio de productos comercializados desde La Habana, Cuba, hacia los mercados internacionales"
        />

        {/* Cuba Hub Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 flex items-center gap-4 rounded-xl border border-[#bb7dae]/10 bg-gradient-to-r from-[#bb7dae]/5 via-transparent to-transparent px-5 py-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#bb7dae]/10">
            <Anchor className="h-5 w-5 text-[#bb7dae]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--lp-text-secondary)]">
              Operaciones desde <span className="text-[#bb7dae]">La Habana, Cuba</span>
            </p>
            <p className="text-xs text-[var(--lp-text-muted)]">
              {countryData.length} países de origen · {currencyData.length} monedas de operación ·{" "}
              {productos.length} productos en catálogo
            </p>
          </div>
        </motion.div>

        {/* Chart grid — 3 columns */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bar chart: Products by Category */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[var(--lp-border)] bg-gradient-to-b from-[var(--lp-card-bg-solid)] to-transparent p-6 backdrop-blur-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#bb7dae]/20 to-[#29bdbf]/20">
                <BarChart3 className="h-5 w-5 text-[#bb7dae]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--lp-text)]">Categorías Importadas</h3>
                <p className="text-xs text-[var(--lp-text-muted)]">{productos.length} productos en catálogo</p>
              </div>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="value" name="cantidad" radius={[4, 4, 0, 0]} maxBarSize={42}>
                    {catData.map((_, i) => <rect key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Donut: Countries of Origin */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[var(--lp-border)] bg-gradient-to-b from-[var(--lp-card-bg-solid)] to-transparent p-6 backdrop-blur-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                <PieChart className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--lp-text)]">Origen de Importación</h3>
                <p className="text-xs text-[var(--lp-text-muted)]">{countryData.length} regiones</p>
              </div>
            </div>
            <div className="flex h-[260px] items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={countryData} cx="50%" cy="50%" innerRadius={58} outerRadius={95} paddingAngle={3} dataKey="value">
                    {countryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RePieChart>
              </ResponsiveContainer>
              <div className="ml-1 hidden space-y-1.5 sm:block">
                {countryData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="max-w-[80px] truncate text-xs text-[var(--lp-text-secondary)]">{entry.name}</span>
                    <span className="text-xs font-medium text-[var(--lp-text-secondary)]">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Donut: Currency Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[var(--lp-border)] bg-gradient-to-b from-[var(--lp-card-bg-solid)] to-transparent p-6 backdrop-blur-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#bb7dae]/20 to-[#29bdbf]/20">
                <DollarSign className="h-5 w-5 text-[#bb7dae]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--lp-text)]">Monedas de Operación</h3>
                <p className="text-xs text-[var(--lp-text-muted)]">Divisas utilizadas en comercio exterior</p>
              </div>
            </div>
            <div className="flex h-[260px] items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={currencyData} cx="50%" cy="50%" innerRadius={58} outerRadius={95} paddingAngle={3} dataKey="value">
                    {currencyData.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 3) % CHART_COLORS.length]} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RePieChart>
              </ResponsiveContainer>
              <div className="ml-1 hidden space-y-1.5 sm:block">
                {currencyData.map((entry, i) => (
                  <div key={entry.code} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CHART_COLORS[(i + 3) % CHART_COLORS.length] }} />
                    <span className="text-xs text-[var(--lp-text-secondary)]">{entry.name}</span>
                    <span className="text-xs font-medium text-[var(--lp-text-secondary)]">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Price Analysis + Logistics */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[var(--lp-border)] bg-gradient-to-b from-[var(--lp-card-bg-solid)] to-transparent p-6 backdrop-blur-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--lp-text)]">Análisis de Precios</h3>
                <p className="text-xs text-[var(--lp-text-muted)]">Valor promedio por categoría importada</p>
              </div>
            </div>
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[
                { label: "Precio Promedio", value: avgPrice },
                { label: "Más Costoso", value: maxPrice },
                { label: "Menos Costoso", value: minPrice },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-[var(--lp-border)] bg-[var(--lp-card-bg-solid)] px-3 py-3 text-center">
                  <div className="text-xs text-[var(--lp-text-muted)]">{stat.label}</div>
                  <div className="mt-1 truncate text-base font-bold text-[var(--lp-text)]">
                    ${stat.value.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} layout="vertical">
                  <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="promedio" name="precio promedio" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {priceData.map((_, i) => <rect key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-[var(--lp-border)] bg-gradient-to-b from-[var(--lp-card-bg-solid)] to-transparent p-6 backdrop-blur-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#bb7dae]/20 to-[#bb7dae]/20">
                <Ship className="h-5 w-5 text-[#bb7dae]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--lp-text)]">Logística Marítima</h3>
                <p className="text-xs text-[var(--lp-text-muted)]">Peso y volumen para fletes internacionales</p>
              </div>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--lp-border)] bg-[var(--lp-card-bg-solid)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#bb7dae]" />
                  <span className="text-xs text-[var(--lp-text-muted)]">Peso Total</span>
                </div>
                <div className="mt-1 text-lg font-bold text-[var(--lp-text)]">
                  {totalWeight.toLocaleString("es", { maximumFractionDigits: 1 })} kg
                </div>
                <div className="text-[11px] text-[var(--lp-text-muted)]">
                  ~{(totalWeight / 1000).toFixed(1)} toneladas métricas
                </div>
              </div>
              <div className="rounded-xl border border-[var(--lp-border)] bg-[var(--lp-card-bg-solid)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#bb7dae]" />
                  <span className="text-xs text-[var(--lp-text-muted)]">Volumen Total</span>
                </div>
                <div className="mt-1 text-lg font-bold text-[var(--lp-text)]">
                  {totalVolume.toLocaleString("es", { maximumFractionDigits: 2 })} m³
                </div>
                <div className="text-[11px] text-[var(--lp-text-muted)]">
                  ~{(totalVolume / 33).toFixed(0)} contenedores de 20ft
                </div>
              </div>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weightData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} layout="vertical">
                  <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} tickFormatter={(v) => `${v}kg`} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="peso" name="peso promedio" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {weightData.map((_, i) => <rect key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 grid gap-4 sm:grid-cols-4"
        >
          {[
            {
              icon: BarChart3,
              color: "from-[#bb7dae]/20 to-[#29bdbf]/20",
              textColor: "text-[#bb7dae]",
              title: "Categoría Principal",
              value: catData[0]?.name || "—",
              desc: `${catData[0]?.value || 0} productos importados`,
            },
            {
              icon: Globe,
              color: "from-violet-500/20 to-purple-500/20",
              textColor: "text-violet-400",
              title: "Principal Origen",
              value: countryData[0]?.name || "—",
              desc: `${countryData[0]?.value || 0} productos hacia Cuba`,
            },
            {
              icon: DollarSign,
              color: "from-[#bb7dae]/20 to-[#29bdbf]/20",
              textColor: "text-[#bb7dae]",
              title: "Moneda Principal",
              value: currencyData[0]?.name ?? "—",
              desc: `${currencyData[0]?.value || 0} productos en esta moneda`,
            },
            {
              icon: Ship,
              color: "from-[#bb7dae]/20 to-[#bb7dae]/20",
              textColor: "text-[#bb7dae]",
              title: "Peso Promedio x Prod.",
              value: `${avgWeight.toLocaleString("es", { maximumFractionDigits: 1 })} kg`,
              desc: `${totalWeight.toLocaleString("es", { maximumFractionDigits: 0 })} kg totales`,
            },
          ].map((insight) => (
            <div
              key={insight.title}
              className="flex items-start gap-4 rounded-xl border border-[var(--lp-border)] bg-[var(--lp-card-bg-solid)] p-4"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${insight.color}`}>
                <insight.icon className={`h-5 w-5 ${insight.textColor}`} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--lp-text-muted)]">
                  {insight.title}
                </div>
                <div className="mt-0.5 truncate text-base font-bold text-[var(--lp-text)]">{insight.value}</div>
                <div className="truncate text-xs text-[var(--lp-text-muted)]">{insight.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   SERVICIOS
   ═══════════════════════════════════════════════════════ */

const SERVICES = [
  {
    icon: Ship,
    title: "Logística Internacional",
    desc: "Gestión integral de contenedores, embarques y documentación aduanera con tracking en tiempo real.",
  },
  {
    icon: BarChart3,
    title: "Inteligencia Comercial",
    desc: "Dashboard ejecutivo con KPIs, proyecciones y análisis de tendencias de mercado global.",
  },
  {
    icon: Shield,
    title: "Cumplimiento & Regulatorio",
    desc: "Validación automática de fracciones arancelarias, regulaciones y certificaciones de origen.",
  },
  {
    icon: TrendingUp,
    title: "Optimización de Costos",
    desc: "Análisis comparativo de proveedores, consolidación de carga y negociación de fletes.",
  },
]

function ServiciosSection() {
  return (
    <section id="servicios" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="Servicios"
          title="Soluciones Integradas"
          subtitle="Una plataforma completa para gestionar todo tu ciclo de comercio internacional"
        />

        <div className="grid gap-5 md:grid-cols-2">
          {SERVICES.map((svc, i) => (
            <motion.div
              key={svc.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex gap-5 rounded-2xl border border-[var(--lp-border)] bg-gradient-to-b from-[var(--lp-card-bg-solid)] to-transparent p-6 backdrop-blur-sm transition-all duration-500 hover:border-[var(--lp-border)] hover:shadow-xl hover:shadow-[#bb7dae]/5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#bb7dae]/20 to-[#29bdbf]/20 shadow-inner">
                <svc.icon className="h-5 w-5 text-[#bb7dae]" />
              </div>
              <div>
                <h3 className="mb-1.5 text-base font-semibold text-[var(--lp-text)]">{svc.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--lp-text-secondary)]">{svc.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   ESTADÍSTICAS
   ═══════════════════════════════════════════════════════ */

function Counter({ from = 0, to, duration = 2000 }: { from?: number; to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(from)

  useEffect(() => {
    if (!isInView) return
    const steps = 30
    const increment = (to - from) / steps
    let current = from
    const timer = setInterval(() => {
      current += increment
      if (current >= to) {
        setCount(to)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [from, to, isInView])

  return <span ref={ref}>{count}</span>
}

function EstadisticasSection({ metrics }: { metrics: LandingMetrics }) {

  const STATS = [
    { value: metrics.totalProductos, suffix: "+", label: "Productos Gestionados", icon: Package },
    { value: metrics.clientesActivos, suffix: "+", label: "Clientes Activos", icon: Users },
    { value: metrics.paisesOrigen, suffix: "+", label: "Países de Operación", icon: Globe },
    { value: 99.9, suffix: "%", label: "Tiempo Operativo", icon: Shield, decimal: true },
  ]


console.debug(metrics);
  return (
    <section className="relative py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.02] to-transparent" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="Trayectoria"
          title="LUMAVI en Cifras"
          subtitle="Métricas que respaldan nuestra experiencia en comercio internacional"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl border border-[var(--lp-border)] bg-gradient-to-b from-[var(--lp-card-bg-solid)] to-[var(--lp-card-bg-solid)] p-8 text-center backdrop-blur-sm transition-all duration-500 hover:border-[var(--lp-border)] hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--lp-card-bg-solid)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#bb7dae]/20 to-[#29bdbf]/20 shadow-lg shadow-[#bb7dae]/5">
                    <stat.icon className="h-6 w-6 text-[#bb7dae]" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-[var(--lp-text)] sm:text-4xl">
                  {stat.decimal ? (
                    stat.value.toFixed(1)
                  ) : (
                    <Counter to={stat.value} duration={800} />
                  )}
                  {stat.suffix}
                </div>
                <div className="mt-2 text-sm text-[var(--lp-text-secondary)]">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   CTA
   ═══════════════════════════════════════════════════════ */

function CTASection() {
  return (
    <section id="contacto" className="relative py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#29bdbf]/[0.03] to-transparent" />

      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-[var(--lp-border)] bg-gradient-to-b from-[var(--lp-card-bg-solid)] to-[var(--lp-card-bg-solid)] p-12 shadow-2xl backdrop-blur-sm sm:p-16"
        >
          <div className="pointer-events-none absolute -inset-40 bg-gradient-to-br from-[#bb7dae]/10 via-transparent to-[#29bdbf]/10 blur-[120px]" />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#bb7dae]/20 to-[#29bdbf]/20 shadow-inner"
            >
              <Anchor className="h-7 w-7 text-[#bb7dae]" />
            </motion.div>

            <h2 className="text-3xl font-bold tracking-tight text-[var(--lp-text)] sm:text-4xl lg:text-5xl">
              ¿Listo para Expandir tu{' '}
              <span className="bg-gradient-to-r from-[#bb7dae] to-[#29bdbf] bg-clip-text text-transparent">
                Comercio Global
              </span>
              ?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[var(--lp-text-secondary)]">
              Únete a las empresas que confían en LUMAVI para gestionar sus operaciones de
              importación y exportación con inteligencia y eficiencia.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <LinkTo
                href="https://wa.me/5355956206"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#bb7dae] to-[#29bdbf] px-8 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-[#bb7dae]/25 transition-all duration-300 hover:from-[#bb7dae] hover:to-[#29bdbf] hover:shadow-[#bb7dae]/40"
              >
                Solicitar información
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </LinkTo>
              <LinkTo
                href="mailto:yamisbatista25@gmail.com"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--lp-border)] bg-[var(--lp-card-bg-solid)] px-8 py-3.5 text-sm font-medium text-[var(--lp-text-secondary)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--lp-border)] hover:text-[var(--lp-text)]"
              >
                yamisbatista25@gmail.com
              </LinkTo>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════ */

function Footer({ categorias = [] }: { categorias?: CategoriaPublic[] }) {
  return (
    <footer className="relative border-t border-[var(--lp-border)] bg-[var(--lp-footer-bg)]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <LinkTo
              href="#hero"
              className="mb-4 flex items-center gap-2 text-lg font-bold"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#bb7dae] to-[#29bdbf]">
                <span className="text-xs font-black text-white">T</span>
              </div>
              <span className="text-[var(--lp-text)]">LUMAVI</span>
            </LinkTo>
            <p className="text-sm leading-relaxed text-[var(--lp-text-muted)]">
              Plataforma inteligente de gestión de comercio internacional. Conectamos
              mercados, optimizamos operaciones, impulsamos resultados.
            </p>
          </div>

          {/* Productos */}
          {categorias.length > 0 && (
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--lp-text-secondary)]">
                Productos
              </h4>
              <ul className="space-y-2.5">
                {categorias.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <a
                      href="#productos"
                      className="text-sm text-[var(--lp-text-muted)] transition-colors hover:text-[var(--lp-text-secondary)]"
                    >
                      {cat.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Company */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--lp-text-secondary)]">
              Compañía
            </h4>
            <ul className="space-y-2.5">
              {["Sobre Nosotros", "Clientes", "Contacto", "Carreras"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-[var(--lp-text-muted)] transition-colors hover:text-[var(--lp-text-secondary)] cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--lp-text-secondary)]">
              Contacto
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--lp-text-muted)]">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#bb7dae]" />
                La Habana, Cuba
              </li>
              {/* <li>
                <a
                  href="mailto:contacto@LUMAVI.com"
                  className="transition-colors hover:text-[var(--lp-text-secondary)]"
                >
                  contacto@LUMAVI.com
                </a>
              </li> */}
              <li>
                <a href="tel:+5355956206" className="transition-colors hover:text-[var(--lp-text-secondary)]">
                  +53 55956206
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--lp-border)] pt-8 sm:flex-row">
          <p className="text-xs text-[var(--lp-text-muted)]">
            &copy; {new Date().getFullYear()} LUMAVI. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-[var(--lp-text-muted)]">
            <span className="cursor-pointer transition-colors hover:text-[var(--lp-text-secondary)]">Privacidad</span>
            <span className="cursor-pointer transition-colors hover:text-[var(--lp-text-secondary)]">Términos</span>
            <span className="cursor-pointer transition-colors hover:text-[var(--lp-text-secondary)]">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════════════════════
   BOTÓN FLOTANTE — Telegram
   ═══════════════════════════════════════════════════════ */

function TelegramFloatingButton() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.a
      href="https://t.me/LUMAVIinfinity_bot"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 300 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-br from-[#bb7dae] to-[#29bdbf] p-3.5 shadow-2xl shadow-[#bb7dae]/30 transition-all duration-300 hover:shadow-[#bb7dae]/50 hover:scale-105"
      title="Chatea con LUMAVI Infinity en Telegram"
    >
      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, x: 10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: 10, width: 0 }}
            className="overflow-hidden whitespace-nowrap text-sm font-medium text-white"
          >
            <span className="mr-2">LUMAVI Infinity</span>
          </motion.span>
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-center">
        <Send className="h-5 w-5 fill-white/90 text-white" />
        <span className="absolute inset-0 animate-ping rounded-full bg-[#bb7dae]/40" />
      </div>
    </motion.a>
  )
}

/* ═══════════════════════════════════════════════════════
   LANDING CLIENT — receives pre-fetched data as props
   ═══════════════════════════════════════════════════════ */

export default function LandingClient({
  productos,
  categorias,
  metrics,
  debug,
}: {
  productos: ProductoPublic[]
  categorias: CategoriaPublic[]
  metrics: LandingMetrics
  debug?: {
    errors: Record<string, string | null>
    counts: Record<string, number>
  }
}) {

  const mode = useThemeStore((s) => s.mode)
  const hydrated = useThemeStore((s) => s.hydrated)
  const resolvedDark = (() => {
    if (!hydrated) return true
    if (mode === "dark") return true
    if (mode === "light") return false
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  })()

  console.debug("[Landing Client] Props recibidas:", {
    productos: productos.length,
    categorias: categorias.length,
    metrics,
    debug,
  })

  return (

    <div data-landing-theme={resolvedDark ? "dark" : "light"} className="relative min-h-screen bg-[var(--lp-bg)] text-[var(--lp-text)] selection:bg-[#bb7dae]/30 selection:text-[var(--lp-text)]">

      <FloatingOrbs />
      
      <Navbar />
      <HeroSection metrics={metrics} />
      {categorias.length > 0 && <CategoriasSection categorias={categorias} />}
      {productos.length > 0 && <ProductosSection productos={productos} categorias={categorias} />}
      {productos.length > 0 && <TendenciasSection productos={productos} />}
      <ServiciosSection />
      <EstadisticasSection metrics={metrics} />
      <CTASection />
      <Footer categorias={categorias} />
      {/* <TelegramFloatingButton /> */}
    </div>
  )
}
