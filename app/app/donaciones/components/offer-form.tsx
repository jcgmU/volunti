'use client'

import { useState, useTransition } from 'react'
import { createOfferAction, updateOfferAction } from '../actions'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/app/components/image-upload'

const CATEGORY_LABELS: Record<string, string> = {
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

interface OfferFormProps {
  offer?: {
    id: string
    category: string
    description: string
    availability: string
    city: string
    zone: string | null
    photoUrl: string | null
    status: string
  } | null
}

export function OfferForm({ offer }: OfferFormProps) {
  const isEditing = !!offer
  const [isPending, startTransition] = useTransition()
  const [photoUrl, setPhotoUrl] = useState(offer?.photoUrl || '')

  async function onSubmit(formData: FormData) {
    if (isEditing && offer) {
      formData.append('offerId', offer.id)
    }

    startTransition(async () => {
      if (isEditing) {
        await updateOfferAction(formData)
      } else {
        await createOfferAction(formData)
      }
    })
  }

  return (
    <form action={onSubmit} className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{isEditing ? 'Editar Donación' : 'Publicar Donación'}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {isEditing ? 'Modificá los detalles de tu donación.' : 'Completá los datos de la ayuda que querés ofrecer.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-semibold">Categoría</label>
          <select
            id="category"
            name="category"
            required
            defaultValue={offer?.category || ''}
            className="w-full h-12 px-4 rounded-lg border bg-background"
          >
            <option value="" disabled>Seleccioná una categoría</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-semibold">Estado</label>
          <select
            id="status"
            name="status"
            required
            defaultValue={offer?.status || 'activa'}
            className="w-full h-12 px-4 rounded-lg border bg-background"
          >
            <option value="activa">Activa</option>
            <option value="pausada">Pausada</option>
            <option value="completada">Completada</option>
          </select>
          <p className="text-xs text-muted-foreground">Podés pausarla si no podés atender en este momento.</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="description" className="text-sm font-semibold">Descripción</label>
          <textarea
            id="description"
            name="description"
            required
            defaultValue={offer?.description || ''}
            className="w-full p-4 rounded-lg border bg-background min-h-[100px] resize-y"
            placeholder="Ej: 50 botellas de agua mineral de 2 litros, selladas."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="availability" className="text-sm font-semibold">Disponibilidad</label>
          <input
            id="availability"
            name="availability"
            type="text"
            required
            defaultValue={offer?.availability || ''}
            className="w-full h-12 px-4 rounded-lg border bg-background"
            placeholder="Ej: Fines de semana, o Lunes a Viernes 9-18"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-semibold">Ciudad</label>
          <input
            id="city"
            name="city"
            type="text"
            required
            defaultValue={offer?.city || ''}
            className="w-full h-12 px-4 rounded-lg border bg-background"
            placeholder="Ej: Cali"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="zone" className="text-sm font-semibold">
            Zona / Barrio <span className="text-muted-foreground font-normal">(Opcional)</span>
          </label>
          <input
            id="zone"
            name="zone"
            type="text"
            defaultValue={offer?.zone || ''}
            className="w-full h-12 px-4 rounded-lg border bg-background"
            placeholder="Ej: Sur, B/ San Fernando"
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t">
        <label className="text-sm font-semibold">
          Foto <span className="text-muted-foreground font-normal">(Opcional pero recomendada)</span>
        </label>
        <ImageUpload onUploadComplete={setPhotoUrl} defaultImage={offer?.photoUrl || undefined} />
        <input type="hidden" name="photoUrl" value={photoUrl} />
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 text-base font-semibold"
          onClick={() => window.history.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" size="lg" className="h-12 text-base font-semibold" disabled={isPending}>
          {isPending ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Publicar Donación')}
        </Button>
      </div>
    </form>
  )
}
