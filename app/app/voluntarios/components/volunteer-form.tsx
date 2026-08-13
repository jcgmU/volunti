import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createVolunteerAction, updateVolunteerAction } from '../actions'
import { volunteers } from '@/db/schema'

interface VolunteerFormProps {
  item?: typeof volunteers.$inferSelect | null
}

export function VolunteerForm({ item }: VolunteerFormProps) {
  const isEdit = !!item
  const skillsValue = item?.skills ? item.skills.join(', ') : ''

  return (
    <Card className="w-full max-w-lg mx-auto border-none shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 text-center sm:text-left">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {isEdit ? 'Editar voluntario' : 'Registrar nuevo voluntario'}
        </CardTitle>
        <CardDescription>
          {isEdit
            ? 'Modificá los detalles del voluntario existente.'
            : 'Agregá un nuevo voluntario disponible para coordinar en tus tareas.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={isEdit ? updateVolunteerAction : createVolunteerAction} className="space-y-4">
          {isEdit && <input type="hidden" name="volunteerId" value={item.id} />}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ej. Ana María Gómez"
              defaultValue={item?.name || ''}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Teléfono de contacto *</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              placeholder="Ej. +57 315 123 4567"
              defaultValue={item?.contactPhone || ''}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Habilidades (Separadas por comas) *</Label>
            <Input
              id="skills"
              name="skills"
              type="text"
              placeholder="Ej. primeros auxilios, rescate, logística, psicología"
              defaultValue={skillsValue}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Ciudad / Municipio *</Label>
            <Input
              id="city"
              name="city"
              type="text"
              placeholder="Ej. Cali"
              defaultValue={item?.city || ''}
              required
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="availabilityFrom">Disponible desde *</Label>
              <Input
                id="availabilityFrom"
                name="availabilityFrom"
                type="date"
                defaultValue={item?.availabilityFrom || ''}
                required
                className="h-12 cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availabilityTo">Disponible hasta *</Label>
              <Input
                id="availabilityTo"
                name="availabilityTo"
                type="date"
                defaultValue={item?.availabilityTo || ''}
                required
                className="h-12 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado *</Label>
            <select
              id="status"
              name="status"
              defaultValue={item?.status || 'disponible'}
              required
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="disponible">Disponible</option>
              <option value="asignado">Asignado</option>
              <option value="no_disponible">No Disponible</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button type="submit" className="w-full h-12 text-base font-semibold">
              {isEdit ? 'Guardar cambios' : 'Registrar voluntario'}
            </Button>
            <Link href="/app/voluntarios" passHref className="w-full">
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
