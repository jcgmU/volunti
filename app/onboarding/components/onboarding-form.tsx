'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { createOrganizationAction, skipOnboardingAction } from '../actions'

interface OnboardingFormProps {
  error?: string
}

export function OnboardingForm({ error }: OnboardingFormProps) {
  const errorMessages: Record<string, string> = {
    invalid: 'Datos inválidos. Por favor, verificá los campos obligatorios.',
    unknown: 'Algo salió mal. Por favor, intenta de nuevo.'
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.unknown : null

  const categoriesList = [
    { id: 'alimentos', label: 'Alimentos' },
    { id: 'agua', label: 'Agua' },
    { id: 'salud', label: 'Salud y Medicina' },
    { id: 'vivienda', label: 'Vivienda y Refugio' },
    { id: 'ropa', label: 'Ropa y Abrigo' },
    { id: 'higiene', label: 'Artículos de Higiene' },
    { id: 'rescate', label: 'Búsqueda y Rescate' },
    { id: 'psicosocial', label: 'Apoyo Psicosocial' },
    { id: 'educación', label: 'Educación y Recreación' },
    { id: 'transporte', label: 'Transporte y Logística' },
    { id: 'mano_de_obra', label: 'Mano de Obra' }
  ]

  return (
    <Card className="w-full border-none shadow-none sm:border sm:shadow-sm">
      <CardHeader className="space-y-1 text-center sm:text-left">
        <CardTitle className="text-2xl font-bold tracking-tight">Completá el perfil de tu fundación</CardTitle>
        <CardDescription>
          Contanos sobre tu organización para que otras fundaciones puedan encontrarte y coordinar ayuda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <div className="mb-6 rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium">
            {errorMessage}
          </div>
        )}

        <form action={createOrganizationAction} className="space-y-6">
          {/* Información General */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información General</h3>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la fundación *</Label>
              <Input id="name" name="name" type="text" placeholder="Ej. Fundación Manos Amigas" required className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Contanos brevemente qué hacen, su misión y cómo ayudan en emergencias..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Enfoque y Categorías */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-semibold">Áreas de Ayuda</h3>
            <Separator />
            
            {/* Focus Areas (Radios usando inputs nativos con estilo tailwind para evitar complejidad) */}
            <div className="space-y-2">
              <Label>Población en la que se enfoca la ayuda *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition">
                  <input type="radio" name="focusAreas" value="personas" defaultChecked className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Personas</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition">
                  <input type="radio" name="focusAreas" value="animales" className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Animales</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition">
                  <input type="radio" name="focusAreas" value="ambos" className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Ambos</span>
                </label>
              </div>
            </div>

            {/* Categories (Checkboxes) */}
            <div className="space-y-2">
              <Label>Categorías de ayuda que proveen (Elegí al menos una) *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {categoriesList.map((cat) => (
                  <div key={cat.id} className="flex items-start space-x-3 space-y-0 rounded-md border p-3">
                    <Checkbox id={`cat-${cat.id}`} name="categories" value={cat.id} />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={`cat-${cat.id}`} className="text-sm font-medium cursor-pointer">
                        {cat.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contacto y Ubicación */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-semibold">Contacto y Ubicación</h3>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Teléfono de contacto *</Label>
                <Input id="contactPhone" name="contactPhone" type="tel" placeholder="Ej. +57 300 123 4567" required className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactWhatsapp">WhatsApp (Opcional)</Label>
                <Input id="contactWhatsapp" name="contactWhatsapp" type="tel" placeholder="Ej. +57 300 123 4567" className="h-12" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad / Municipio *</Label>
                <Input id="city" name="city" type="text" placeholder="Ej. Cali" required className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <Input id="department" name="department" type="text" placeholder="Ej. Valle del Cauca" required className="h-12" />
              </div>
            </div>
          </div>

          {/* Capacidad y Notas */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-semibold">Capacidad Logística</h3>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="capacityNotes">Notas de capacidad (Opcional)</Label>
              <Textarea
                id="capacityNotes"
                name="capacityNotes"
                placeholder="Ej. Contamos con espacio para almacenar hasta 2 toneladas de alimentos no perecederos."
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button type="submit" className="w-full h-12 text-base font-semibold" size="lg">
              Guardar perfil
            </Button>
          </div>
        </form>

        <form action={skipOnboardingAction} className="mt-3">
          <Button type="submit" variant="ghost" className="w-full h-12 text-base" size="lg">
            Completar después
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
