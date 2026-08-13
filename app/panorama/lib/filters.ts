export interface PanoramaFilters {
  tab: string
  ciudad?: string
  categoria?: string
  urgencia?: string
  skill?: string
  disponibilidad?: string
}

export function parseFilters(searchParams: Record<string, string | undefined>): PanoramaFilters {
  return {
    tab: searchParams.tab || 'necesidades',
    ciudad: searchParams.ciudad || undefined,
    categoria: searchParams.categoria || undefined,
    urgencia: searchParams.urgencia || undefined,
    skill: searchParams.skill || undefined,
    disponibilidad: searchParams.disponibilidad || undefined,
  }
}

export function buildTabHref(targetTab: string, currentParams: PanoramaFilters): string {
  const params = new URLSearchParams()
  params.set('tab', targetTab)
  if (currentParams.ciudad) params.set('ciudad', currentParams.ciudad)
  return `/panorama?${params.toString()}`
}

export const CATEGORY_LABELS: Record<string, string> = {
  alimentos: 'Alimentos',
  agua: 'Agua',
  salud: 'Salud y Medicina',
  vivienda: 'Vivienda y Refugio',
  ropa: 'Ropa y Abrigo',
  higiene: 'Kits de Higiene',
  rescate: 'Búsqueda y Rescate',
  psicosocial: 'Apoyo Psicosocial',
  educación: 'Educación y Recreación',
  transporte: 'Transporte y Logística',
  mano_de_obra: 'Mano de Obra y Técnicos'
}

export const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS)
export const URGENCY_OPTIONS = ['alta', 'media', 'baja']
export const STATUS_OPTIONS = ['abierta', 'parcial', 'cubierta'] // Needs
export const VOL_STATUS_OPTIONS = ['disponible', 'asignado', 'no_disponible']

export function urgencyClass(u: string) {
  switch (u) {
    case 'alta': return 'bg-red-100 text-red-800'
    case 'media': return 'bg-amber-100 text-amber-800'
    default: return 'bg-emerald-100 text-emerald-800'
  }
}

export function needStatusClass(s: string) {
  switch (s) {
    case 'abierta': return 'bg-amber-100 text-amber-800 border border-amber-200'
    case 'parcial': return 'bg-blue-100 text-blue-800 border border-blue-200'
    case 'cubierta': return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

export function invStatusClass(s: string) {
  switch (s) {
    case 'disponible': return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    case 'reservado': return 'bg-amber-100 text-amber-800 border border-amber-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

export function volStatusClass(s: string) {
  switch (s) {
    case 'disponible': return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    case 'asignado': return 'bg-blue-100 text-blue-800 border border-blue-200'
    case 'no_disponible': return 'bg-gray-100 text-gray-800 border border-gray-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

export const formatDate = (dateStr: string | Date | null) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  } catch {
    return String(dateStr)
  }
}
