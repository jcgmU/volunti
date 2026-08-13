import Link from 'next/link'
import { buildTabHref, PanoramaFilters } from '../lib/filters'

export function PanoramaTabs({ active, params }: { active: string; params: PanoramaFilters }) {
  const tabs = [
    { id: 'necesidades', label: 'Necesidades' },
    { id: 'inventario', label: 'Inventario' },
    { id: 'voluntarios', label: 'Voluntarios' }
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <Link
            key={tab.id}
            href={buildTabHref(tab.id, params)}
            className={`flex items-center h-11 px-6 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
