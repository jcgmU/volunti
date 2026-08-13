'use client'

import { changeOfferStatusAction } from '../actions'
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'

interface StatusSelectProps {
  offerId: string
  currentStatus: 'activa' | 'pausada' | 'completada'
}

export function StatusSelect({ offerId, currentStatus }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition()

  const statusColors = {
    activa: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pausada: 'bg-amber-100 text-amber-800 border-amber-200',
    completada: 'bg-blue-100 text-blue-800 border-blue-200'
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as 'activa' | 'pausada' | 'completada'
    if (newStatus !== currentStatus) {
      startTransition(async () => {
        await changeOfferStatusAction(offerId, newStatus)
      })
    }
  }

  return (
    <div className="relative">
      <select
        disabled={isPending}
        value={currentStatus}
        onChange={handleChange}
        className={`appearance-none text-xs font-semibold px-3 py-1 pr-8 rounded-full border cursor-pointer outline-none transition-colors ${statusColors[currentStatus]}`}
      >
        <option value="activa">Activa</option>
        <option value="pausada">Pausada</option>
        <option value="completada">Completada</option>
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
        ) : (
          <svg className="w-3 h-3 text-current opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  )
}
