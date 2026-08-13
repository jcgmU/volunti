'use client'

import { useTransition } from 'react'
import { changeNeedStatusAction } from '../actions'

interface StatusSelectProps {
  needId: string
  currentStatus: 'abierta' | 'parcial' | 'cubierta'
}

export function StatusSelect({ needId, currentStatus }: StatusSelectProps) {
  const [isPending, startTransition] = useTransition()

  const statusColors = {
    abierta: 'border-red-200 text-red-800 focus:ring-red-500 bg-red-50/50',
    parcial: 'border-amber-200 text-amber-800 focus:ring-amber-500 bg-amber-50/50',
    cubierta: 'border-emerald-200 text-emerald-800 focus:ring-emerald-500 bg-emerald-50/50'
  }

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(e) => {
        const val = e.target.value as 'abierta' | 'parcial' | 'cubierta'
        startTransition(async () => {
          await changeNeedStatusAction(needId, val)
        })
      }}
      className={`text-xs border rounded-lg px-2 py-1.5 font-semibold focus:outline-none focus:ring-1 cursor-pointer disabled:opacity-50 transition ${statusColors[currentStatus]}`}
    >
      <option value="abierta">Abierta</option>
      <option value="parcial">Parcial</option>
      <option value="cubierta">Cubierta</option>
    </select>
  )
}
