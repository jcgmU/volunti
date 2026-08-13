'use client'

import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('./map'), { ssr: false })

interface MapWrapperProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  populations: any[]
}

export function MapWrapper({ populations }: MapWrapperProps) {
  return <MapComponent populations={populations} />
}
