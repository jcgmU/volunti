'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { acceptRequestAction, rejectRequestAction, markAttendedAction } from '../actions'

interface RequestActionsProps {
  requestId: string
  status: 'pendiente' | 'aceptada' | 'rechazada' | 'atendida'
}

export function RequestActions({ requestId, status }: RequestActionsProps) {
  const [isPending, startTransition] = useTransition()

  if (status === 'pendiente') {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          className="bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-900"
          onClick={() => startTransition(async () => await acceptRequestAction(requestId))}
        >
          Aceptar
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          className="text-destructive hover:bg-destructive/10"
          onClick={() => startTransition(async () => await rejectRequestAction(requestId))}
        >
          Rechazar
        </Button>
      </div>
    )
  }

  if (status === 'aceptada') {
    return (
      <Button
        size="sm"
        disabled={isPending}
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => startTransition(async () => await markAttendedAction(requestId))}
      >
        Marcar como atendida
      </Button>
    )
  }

  return null
}
