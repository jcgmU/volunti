'use client'

import { useTransition } from 'react'
import { changeStatusAction } from '../actions'

interface StatusSelectProps {
  itemId: string
  currentStatus: 'disponible' | 'reservado' | 'entregado'
}

export function StatusSelect({ itemId, currentStatus }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition()

  const statusColors = {
    disponible: 'border-emerald-200 text-emerald-800 focus:ring-emerald-500 bg-emerald-50/50',
    reservado: 'border-amber-200 text-amber-800 focus:ring-amber-500 bg-amber-50/50',
    entregado: 'border-blue-200 text-blue-800 focus:ring-blue-500 bg-blue-50/50'
  }

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(e) => {
        const val = e.target.value as 'disponible' | 'reservado' | 'entregado'
        startTransition(async () => {
          await changeStatusAction(itemId, val)
        })
      }}
      className={`text-xs border rounded-lg px-2 py-1.5 font-semibold focus:outline-none focus:ring-1 cursor-pointer disabled:opacity-50 transition ${statusColors[currentStatus]}`}
    >
      <option value="disponible">Disponible</option>
      <option value="reservado">Reservado</option>
      <option value="entregado">Entregado</option>
    </select>
  )
}
