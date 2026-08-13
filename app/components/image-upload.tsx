'use client'

import { useState, useRef } from 'react'
import { upload } from '@vercel/blob/client'
import { Button } from '@/components/ui/button'
import { Loader2, UploadCloud, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  onUploadComplete: (url: string) => void
  defaultImage?: string
}

export function ImageUpload({ onUploadComplete, defaultImage }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(defaultImage || null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no puede exceder los 5MB')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Solo se permiten imágenes JPEG, PNG o WEBP')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Local preview
      const localUrl = URL.createObjectURL(file)
      setPreview(localUrl)

      // Upload
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })

      setPreview(blob.url)
      onUploadComplete(blob.url)
    } catch (err) {
      console.error(err)
      setError('Hubo un error al subir la imagen. Intenta de nuevo.')
      setPreview(defaultImage || null)
    } finally {
      setIsUploading(false)
    }
  }

  function handleClear() {
    setPreview(null)
    setError(null)
    onUploadComplete('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4 w-full">
      {error && <p className="text-sm text-destructive">{error}</p>}
      
      {preview ? (
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border bg-muted mx-auto">
          <Image src={preview} alt="Preview" fill className="object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 rounded-full h-7 w-7 opacity-80 hover:opacity-100"
            onClick={handleClear}
            disabled={isUploading}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
          {isUploading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-video md:aspect-[2/1] border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors bg-background">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground text-center px-4">
            <UploadCloud className="w-10 h-10 mb-3" />
            <p className="mb-2 text-sm font-semibold">Hacé clic para subir tu foto</p>
            <p className="text-xs">JPG, PNG o WEBP (Max. 5MB)</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  )
}
