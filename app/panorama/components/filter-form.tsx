import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PanoramaFilters, CATEGORY_OPTIONS, CATEGORY_LABELS, URGENCY_OPTIONS, VOL_STATUS_OPTIONS } from '../lib/filters'

interface FilterFormProps {
  activeTab: string
  currentFilters: PanoramaFilters
  cities: string[]
  skills?: string[]
}

export function FilterForm({ activeTab, currentFilters, cities, skills = [] }: FilterFormProps) {
  return (
    <form method="GET" className="mb-6 p-4 border rounded-xl bg-muted/20">
      <input type="hidden" name="tab" value={activeTab} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <select
          name="ciudad"
          defaultValue={currentFilters.ciudad || ''}
          className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
        >
          <option value="">Todas las ciudades</option>
          {cities.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {(activeTab === 'necesidades' || activeTab === 'inventario') && (
          <select
            name="categoria"
            defaultValue={currentFilters.categoria || ''}
            className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base capitalize"
          >
            <option value="">Todas las categorías</option>
            {CATEGORY_OPTIONS.map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        )}

        {activeTab === 'necesidades' && (
          <select
            name="urgencia"
            defaultValue={currentFilters.urgencia || ''}
            className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base capitalize"
          >
            <option value="">Cualquier urgencia</option>
            {URGENCY_OPTIONS.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        )}

        {activeTab === 'voluntarios' && (
          <>
            <select
              name="skill"
              defaultValue={currentFilters.skill || ''}
              className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
            >
              <option value="">Cualquier habilidad</option>
              {skills.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              name="disponibilidad"
              defaultValue={currentFilters.disponibilidad || 'disponible'}
              className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base capitalize"
            >
              <option value="">Cualquier estado</option>
              {VOL_STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" size="lg" className="h-12 px-6">
          Filtrar
        </Button>
        <Link href={`/panorama?tab=${activeTab}`} className="text-sm font-medium text-muted-foreground hover:text-foreground hover:underline">
          Limpiar filtros
        </Link>
      </div>
    </form>
  )
}
