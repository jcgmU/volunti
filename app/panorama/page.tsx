import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import {
  parseFilters,
  CATEGORY_LABELS,
  urgencyClass,
  needStatusClass,
  invStatusClass,
  volStatusClass,
  formatDate
} from './lib/filters'
import {
  getNeeds,
  getInventory,
  getVolunteers,
  getCitiesForNeeds,
  getCitiesForInventory,
  getCitiesForVolunteers,
  getSkills,
  getPopulations
} from './lib/queries'
import { PanoramaTabs } from './components/panorama-tabs'
import { FilterForm } from './components/filter-form'
import { MapWrapper } from './components/map-wrapper'

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function PanoramaPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters = parseFilters(params)
  const tab = filters.tab

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: any[] = []
  let cities: string[] = []
  let skills: string[] = []

  if (tab === 'necesidades') {
    items = await getNeeds(filters)
    cities = await getCitiesForNeeds()
  } else if (tab === 'inventario') {
    items = await getInventory(filters)
    cities = await getCitiesForInventory()
  } else if (tab === 'voluntarios') {
    items = await getVolunteers(filters)
    cities = await getCitiesForVolunteers()
    skills = await getSkills()
  } else if (tab === 'mapa') {
    items = await getPopulations()
  }

  const hasActiveFilters = Object.keys(params).some(k => k !== 'tab' && params[k])

  return (
    <>
      <SiteHeader active="panorama" />
      <div className="container py-8 px-4 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panorama general</h1>
          <p className="text-muted-foreground mt-1 text-base">
            Consulta pública de necesidades, inventario y voluntarios de todas las fundaciones registradas.
          </p>
          <span className="inline-block mt-3 px-2 py-0.5 bg-muted text-muted-foreground text-xs font-semibold rounded uppercase tracking-wider">
            Público · sin login
          </span>
        </div>

        <PanoramaTabs active={tab} params={filters} />
        {tab !== 'mapa' && (
          <FilterForm activeTab={tab} currentFilters={filters} cities={cities} skills={skills} />
        )}

        {tab === 'mapa' ? (
          <MapWrapper populations={items} />
        ) : items.length === 0 ? (
          <div className="border border-dashed rounded-xl p-12 text-center max-w-md mx-auto mt-8">
            <p className="text-lg font-semibold text-muted-foreground">No hay resultados para estos filtros.</p>
            {hasActiveFilters && (
              <Link href={`/panorama?tab=${tab}`} className="mt-4 inline-block text-primary font-medium hover:underline">
                Limpiar filtros
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="block md:hidden space-y-4">
              {tab === 'necesidades' && items.map(({ need, population, org }) => (
                <div key={need.id} className="border rounded-xl p-4 bg-card space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-foreground capitalize">{CATEGORY_LABELS[need.category] || need.category}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{population?.name} ({population?.city})</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-md font-semibold capitalize ${needStatusClass(need.status)}`}>
                      {need.status}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm pt-1">
                    <div>
                      <p className="text-muted-foreground text-xs">Descripción</p>
                      <p className="font-medium text-foreground line-clamp-2">{need.description}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-muted-foreground text-xs">Cantidad</p>
                        <p className="font-semibold text-foreground">{need.quantityNeeded} {need.unit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Urgencia</p>
                        <span className={`inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${urgencyClass(need.urgency)}`}>
                          {need.urgency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Reportado por: <span className="font-medium text-foreground">{org?.name ?? 'Fundación no informada'}</span>
                  </div>
                </div>
              ))}

              {tab === 'inventario' && items.map(({ inv, org }) => (
                <div key={inv.id} className="border rounded-xl p-4 bg-card space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {CATEGORY_LABELS[inv.category] || inv.category}
                      </span>
                      <h3 className="text-lg font-bold mt-1 text-foreground">{inv.itemName}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-md font-semibold capitalize ${invStatusClass(inv.status)}`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                    <div>
                      <p className="text-muted-foreground text-xs">Cantidad</p>
                      <p className="font-semibold text-foreground">{inv.quantity} {inv.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Ubicación</p>
                      <p className="font-semibold text-foreground">{inv.location}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Fundación: <span className="font-medium text-foreground">{org?.name ?? 'Fundación'}</span>
                  </div>
                </div>
              ))}

              {tab === 'voluntarios' && items.map(({ v, org }) => (
                <div key={v.id} className="border rounded-xl p-4 bg-card space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{v.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{v.city}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-md font-semibold capitalize ${volStatusClass(v.status)}`}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {v.skills.map((s: string) => (
                      <span key={s} className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground pt-1">
                    <span className="font-medium">Disp:</span> {formatDate(v.availabilityFrom)} al {formatDate(v.availabilityTo)}
                  </div>
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Fundación: <span className="font-medium text-foreground">{org?.name ?? 'Independiente'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block border rounded-xl overflow-hidden bg-card">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b text-sm font-semibold text-muted-foreground">
                    {tab === 'necesidades' && (
                      <>
                        <th className="p-4">Categoría / Descripción</th>
                        <th className="p-4">Población</th>
                        <th className="p-4">Cantidad</th>
                        <th className="p-4">Urgencia</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Reportado por</th>
                      </>
                    )}
                    {tab === 'inventario' && (
                      <>
                        <th className="p-4">Categoría / Artículo</th>
                        <th className="p-4">Cantidad</th>
                        <th className="p-4">Ubicación</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Fundación</th>
                      </>
                    )}
                    {tab === 'voluntarios' && (
                      <>
                        <th className="p-4">Nombre / Habilidades</th>
                        <th className="p-4">Ciudad</th>
                        <th className="p-4">Disponibilidad</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Fundación</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="text-sm divide-y">
                  {tab === 'necesidades' && items.map(({ need, population, org }) => (
                    <tr key={need.id} className="hover:bg-muted/10 transition">
                      <td className="p-4 font-semibold text-foreground capitalize">
                        {CATEGORY_LABELS[need.category] || need.category}
                        <p className="text-xs text-muted-foreground font-normal line-clamp-1 mt-1">{need.description}</p>
                      </td>
                      <td className="p-4 text-muted-foreground font-medium">
                        {population?.name} <br/>
                        <span className="text-xs font-normal">{population?.city}</span>
                      </td>
                      <td className="p-4 font-medium">{need.quantityNeeded} {need.unit}</td>
                      <td className="p-4">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${urgencyClass(need.urgency)}`}>
                          {need.urgency}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-md font-semibold capitalize ${needStatusClass(need.status)}`}>
                          {need.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{org?.name ?? 'Fundación no informada'}</td>
                    </tr>
                  ))}

                  {tab === 'inventario' && items.map(({ inv, org }) => (
                    <tr key={inv.id} className="hover:bg-muted/10 transition">
                      <td className="p-4 font-semibold text-foreground">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground uppercase block w-fit mb-1">
                          {CATEGORY_LABELS[inv.category] || inv.category}
                        </span>
                        {inv.itemName}
                      </td>
                      <td className="p-4 font-medium">{inv.quantity} {inv.unit}</td>
                      <td className="p-4 text-muted-foreground">{inv.location}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-md font-semibold capitalize ${invStatusClass(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{org?.name ?? 'Fundación'}</td>
                    </tr>
                  ))}

                  {tab === 'voluntarios' && items.map(({ v, org }) => (
                    <tr key={v.id} className="hover:bg-muted/10 transition">
                      <td className="p-4 font-semibold text-foreground">
                        {v.name}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {v.skills.map((s: string) => (
                            <span key={s} className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground font-medium">{v.city}</td>
                      <td className="p-4 text-muted-foreground">
                        {formatDate(v.availabilityFrom)}<br/>
                        al {formatDate(v.availabilityTo)}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-md font-semibold capitalize ${volStatusClass(v.status)}`}>
                          {v.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{org?.name ?? 'Independiente'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  )
}
