'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Flag, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { reportAction } from '../report-actions'

interface ReportButtonProps {
  targetType: 'offer' | 'profile'
  targetId: string
  label?: string
  iconOnly?: boolean
}

export function ReportButton({ targetType, targetId, label, iconOnly = false }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleReport = () => {
    if (!reason.trim()) {
      setError('Por favor, ingresa un motivo.')
      return
    }

    startTransition(async () => {
      setError(null)
      const res = await reportAction(targetType, targetId, reason.trim())
      if (res.error) {
        setError(res.error)
      } else if (res.success) {
        setSuccess(true)
        setTimeout(() => setIsOpen(false), 2000)
      }
    })
  }

  const resetState = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setTimeout(() => {
        setReason('')
        setError(null)
        setSuccess(false)
      }, 300)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetState}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size={iconOnly ? 'icon' : 'sm'}
            className={iconOnly ? 'h-8 w-8 text-muted-foreground hover:text-destructive' : 'text-muted-foreground hover:text-destructive h-8 px-2'}
            title="Reportar"
          />
        }
      >
        <Flag className={iconOnly ? 'w-4 h-4' : 'w-3.5 h-3.5 mr-1.5'} />
        {!iconOnly && (label || 'Reportar')}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reportar {targetType === 'offer' ? 'Oferta' : 'Perfil'}</DialogTitle>
          <DialogDescription>
            Si esta {targetType === 'offer' ? 'oferta' : 'cuenta'} incumple nuestras políticas, por favor decinos el motivo.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center text-emerald-600 space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <Flag className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="font-semibold text-lg">Reporte enviado</p>
            <p className="text-sm">Gracias por ayudarnos a mantener Volunti seguro.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <Textarea
                placeholder="Explicá por qué estás reportando esto..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isPending}
                className="min-h-[100px]"
              />
              {error && (
                <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReport}
                disabled={isPending || !reason.trim()}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar reporte
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
