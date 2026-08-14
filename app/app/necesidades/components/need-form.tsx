'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createNeedAction, updateNeedAction } from '../actions'
import { needs, populations } from '@/db/schema'

interface NeedFormProps {
  item?: typeof needs.$inferSelect | null
  populationsList: (typeof populations.$inferSelect)[]
}

export function NeedForm({ item, populationsList }: NeedFormProps) {
  const isEdit = !!item
  const [isNewPopulation, setIsNewPopulation] = useState(false)

  const categories = ['alimentos', 'agua', 'salud', 'vivienda', 'ropa', 'higiene', 'rescate', 'psicosocial', 'educación', 'transporte', 'mano_de_obra']

  return (
    <Card className="w-full max-w-lg mx-auto border-none shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 text-center sm:text-left">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {isEdit ? 'Editar necesidad' : 'Reportar nueva necesidad'}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? 'Modifica los detalles de esta necesidad.'
            : 'Agrega un requerimiento urgente para coordinar con otras organizaciones.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={isEdit ? updateNeedAction : createNeedAction} className="space-y-4">
          {isEdit && <input type="hidden" name="needId" value={item.id} />}

          <div className="space-y-2 border p-4 rounded-lg bg-muted/20">
            <Label className="text-base font-semibold block mb-2">Población afectada</Label>
            
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input
                  type="radio"
                  name="popToggle"
                  checked={!isNewPopulation}
                  onChange={() => setIsNewPopulation(false)}
                  className="w-4 h-4 text-primary"
                />
                Seleccionar existente
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input
                  type="radio"
                  name="popToggle"
                  checked={isNewPopulation}
                  onChange={() => setIsNewPopulation(true)}
                  className="w-4 h-4 text-primary"
                />
                Crear nueva
              </label>
            </div>
            
            <input type="hidden" name="newPopulation" value={isNewPopulation.toString()} />

            {!isNewPopulation ? (
              <div className="space-y-2">
                <Label htmlFor="populationId">Selecciona la población *</Label>
                <select
                  id="populationId"
                  name="populationId"
                  defaultValue={item?.populationId || ''}
                  required={!isNewPopulation}
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Seleccione una opción</option>
                  {populationsList.map((pop) => (
                    <option key={pop.id} value={pop.id}>
                      {pop.name} ({pop.city}, {pop.department})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPopulationName">Nombre de la zona/población *</Label>
                  <Input id="newPopulationName" name="newPopulationName" required={isNewPopulation} placeholder="Ej. Barrio El Carmen" className="h-10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPopulationCity">Ciudad *</Label>
                    <Input id="newPopulationCity" name="newPopulationCity" required={isNewPopulation} placeholder="Ej. Manizales" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPopulationDepartment">Departamento *</Label>
                    <Input id="newPopulationDepartment" name="newPopulationDepartment" required={isNewPopulation} placeholder="Ej. Caldas" className="h-10" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <select
              id="category"
              name="category"
              defaultValue={item?.category || ''}
              required
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 capitalize"
            >
              <option value="" disabled>Selecciona categoría</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Detalla exactamente qué se necesita y para qué."
              defaultValue={item?.description || ''}
              required
              className="min-h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantityNeeded">Cantidad necesaria *</Label>
              <Input
                id="quantityNeeded"
                name="quantityNeeded"
                type="number"
                min="0.1"
                step="any"
                placeholder="Ej. 100"
                defaultValue={item ? Number(item.quantityNeeded) : ''}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidad de medida *</Label>
              <Input
                id="unit"
                name="unit"
                type="text"
                placeholder="Ej. raciones, litros, kg"
                defaultValue={item?.unit || ''}
                required
                className="h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgencia *</Label>
              <select
                id="urgency"
                name="urgency"
                defaultValue={item?.urgency || 'media'}
                required
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <select
                id="status"
                name="status"
                defaultValue={item?.status || 'abierta'}
                required
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="abierta">Abierta</option>
                <option value="parcial">Parcial</option>
                <option value="cubierta">Cubierta</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button type="submit" className="w-full h-12 text-base font-semibold">
              {isEdit ? 'Guardar cambios' : 'Publicar necesidad'}
            </Button>
            <Link href="/app/necesidades" passHref className="w-full">
              <Button type="button" variant="outline" className="w-full h-12 text-base">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
