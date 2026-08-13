'use client'

import { useTransition } from 'react'
import { changeVolunteerStatusAction } from '../actions'

interface StatusSelectProps {
  volunteerId: string
  currentStatus: 'disponible' | 'asignado' | 'no_disponible'
}

export function StatusSelect({ volunteerId, currentStatus }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition()

  const statusColors = {
    disponible: 'border-emerald-200 text-emerald-800 focus:ring-emerald-500 bg-emerald-50/50',
    asignado: 'border-blue-200 text-blue-800 focus:ring-blue-500 bg-blue-50/50',
    no_disponible: 'border-zinc-200 text-zinc-800 focus:ring-zinc-500 bg-zinc-50/50'
  }

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(e) => {
        const val = e.target.value as 'disponible' | 'asignado' | 'no_disponible'
        startTransition(async () => {
          await changeVolunteerStatusAction(volunteerId, val)
        })
      }}
      className={`text-xs border rounded-lg px-2 py-1.5 font-semibold focus:outline-none focus:ring-1 cursor-pointer disabled:opacity-50 transition ${statusColors[currentStatus]}`}
    >
      <option value="disponible">Disponible</option>
      <option value="asignado">Asignado</option>
      <option value="no_disponible">No Disponible</option>
    </select>
  )
}
