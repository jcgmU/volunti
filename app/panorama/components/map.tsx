'use client'

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface MapProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  populations: any[]
}

export default function PopulationsMap({ populations }: MapProps) {
  const getColor = (priority: string) => {
    switch (priority) {
      case 'rojo': return { fill: '#dc2626', border: '#991b1b' }
      case 'amarillo': return { fill: '#eab308', border: '#a16207' }
      case 'verde': return { fill: '#16a34a', border: '#166534' }
      default: return { fill: '#64748b', border: '#334155' }
    }
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-xl overflow-hidden bg-card relative z-0">
        <MapContainer 
          center={[4.5, -74.5]} 
          zoom={6} 
          scrollWheelZoom={true} 
          className="w-full h-[400px] md:h-[500px]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {populations.map((pop) => {
            const colors = getColor(pop.priorityLevel)
            return (
              <CircleMarker
                key={pop.id}
                center={[pop.lat, pop.lng]}
                radius={12}
                fillColor={colors.fill}
                fillOpacity={0.8}
                color={colors.border}
                weight={2}
              >
                <Popup>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-bold text-base">{pop.name}</h4>
                      <p className="text-xs text-gray-500">{pop.city}, {pop.department}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white" style={{ backgroundColor: colors.fill }}>
                        Prioridad {pop.priorityLevel}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">Afectados:</span> {pop.estimatedAffected === 0 ? 'Sin evaluar' : pop.estimatedAffected}
                    </div>
                    {pop.notes && (
                      <p className="text-xs text-gray-600 mt-1 italic leading-tight">
                        {pop.notes}
                      </p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm bg-muted/30 p-4 rounded-xl border">
        <span className="font-semibold text-foreground">Nivel de prioridad:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#dc2626] border-2 border-[#991b1b]"></div>
          <span>Alta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#eab308] border-2 border-[#a16207]"></div>
          <span>Media</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#16a34a] border-2 border-[#166534]"></div>
          <span>Baja</span>
        </div>
      </div>
    </div>
  )
}
