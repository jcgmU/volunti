'use client'

import { useState, useTransition } from 'react'
import { createP2PProfile } from '../actions'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { ImageUpload } from '@/app/components/image-upload'

export function P2PForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [avatarUrl, setAvatarUrl] = useState('')

  async function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createP2PProfile(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <form action={onSubmit} className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm font-medium text-destructive bg-destructive/10 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="alias" className="text-sm font-semibold">
            Alias o Nombre público
          </label>
          <input
            id="alias"
            name="alias"
            type="text"
            required
            className="w-full h-12 px-4 rounded-lg border bg-background"
            placeholder="Ej: Juan G. o Fundación XYZ"
          />
          <p className="text-xs text-muted-foreground">Así te verán los demás usuarios.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-semibold">
            Número de WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="w-full h-12 px-4 rounded-lg border bg-background"
            placeholder="Ej: 573001234567"
          />
          <p className="text-xs text-muted-foreground">Incluí el código de país. Solo se compartirá si aceptás una solicitud.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">
            Foto de perfil <span className="text-muted-foreground font-normal">(Opcional)</span>
          </label>
          <ImageUpload onUploadComplete={setAvatarUrl} />
          <input type="hidden" name="avatarUrl" value={avatarUrl} />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Completar perfil'}
      </Button>
    </form>
  )
}
