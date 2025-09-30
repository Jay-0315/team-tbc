import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Leaflet 기본 아이콘 수정 (빌드 시 아이콘 경로 문제 해결)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

type MapProps = {
  lat: number
  lng: number
  locationName?: string
  zoom?: number
  height?: string
}

// 지도 중심 이동을 위한 헬퍼 컴포넌트
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  
  return null
}

export default function Map({ lat, lng, locationName, zoom = 15, height = "300px" }: MapProps) {
  const position: [number, number] = [lat, lng]

  return (
    <div className="overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg" style={{ height }}>
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <ChangeView center={position} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          {locationName && (
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-gray-800">{locationName}</p>
              </div>
            </Popup>
          )}
        </Marker>
      </MapContainer>
    </div>
  )
}