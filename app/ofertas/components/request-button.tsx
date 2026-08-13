'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { createRequestAction } from '../actions'
import { AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface RequestButtonProps {
  offerId: string
  sessionState: 'no-session' | 'no-profile' | 'ready'
}

export function RequestButton({ offerId, sessionState }: RequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (sessionState === 'no-session') {
    return (
      <Link href={`/login?callbackUrl=/ofertas`} passHref>
        <Button className="w-full">Solicitar</Button>
      </Link>
    )
  }

  if (sessionState === 'no-profile') {
    return (
      <Link href="/onboarding/p2p" passHref>
        <Button className="w-full">Solicitar</Button>
      </Link>
    )
  }

  if (isSuccess) {
    return (
      <Button disabled variant="outline" className="w-full bg-emerald-50 text-emerald-900 border-emerald-200">
        Solicitud enviada
      </Button>
    )
  }

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await createRequestAction(offerId, message)
      if (result?.error) {
        setError(result.error)
      } else {
        setIsSuccess(true)
        setIsOpen(false)
      }
    })
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full">
        Solicitar
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border shadow-lg rounded-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Confirmar Solicitud</h3>
              
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-4 text-sm mb-6 leading-relaxed">
                <strong>Aviso Legal:</strong> Volunti facilita el contacto entre personas, pero NO verifica identidad, la necesidad real ni la entrega de la donación. Cada persona es responsable de confirmar por su cuenta antes de coordinar una entrega. Usá el sentido común: preferí lugares públicos, no compartas datos sensibles innecesarios.
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-semibold">
                  Mensaje para el donante <span className="text-muted-foreground font-normal">(Opcional)</span>
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-lg border bg-background min-h-[80px] resize-y text-sm"
                  placeholder="Escribe un breve mensaje explicando para qué lo necesitas..."
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="p-4 border-t bg-muted/30 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false)
                  setError(null)
                  setMessage('')
                }}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirmar solicitud
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
