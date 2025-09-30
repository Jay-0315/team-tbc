import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Search, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Map from './Map'

type LocationData = {
  lat: number
  lng: number
  displayName: string
}

type LocationSearchProps = {
  initialLocation?: string
  initialLat?: number
  initialLng?: number
  onLocationChange: (location: string, lat: number, lng: number) => void
  error?: string
}

export default function LocationSearch({
  initialLocation = '',
  initialLat,
  initialLng,
  onLocationChange,
  error
}: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialLocation)
  const [locationData, setLocationData] = useState<LocationData | null>(
    initialLat && initialLng
      ? { lat: initialLat, lng: initialLng, displayName: initialLocation }
      : null
  )
  const [searchResults, setSearchResults] = useState<LocationData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      setSearchError('장소를 입력해주세요')
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setSearchResults([])

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'ko,en',
          }
        }
      )

      if (!response.ok) {
        throw new Error('검색 서비스에 연결할 수 없습니다')
      }

      const data = await response.json()

      if (data.length === 0) {
        setSearchError('검색 결과를 찾을 수 없습니다. 다른 키워드로 시도해주세요.')
        setLocationData(null)
        setSearchResults([])
        return
      }

      // 여러 검색 결과를 배열로 저장
      const results: LocationData[] = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name
      }))

      setSearchResults(results)
      setSearchError(null)
    } catch (error) {
      console.error('Location search error:', error)
      setSearchError('장소 검색 중 오류가 발생했습니다')
      setLocationData(null)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectLocation = (location: LocationData) => {
    setLocationData(location)
    onLocationChange(location.displayName, location.lat, location.lng)
    setSearchResults([]) // 선택 후 결과 목록 닫기
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      searchLocation()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="location-search" className="flex gap-2 items-center text-base font-semibold text-gray-900 dark:text-white">
          <MapPin className="w-5 h-5" />
          장소 검색 *
        </Label>
        <div className="flex gap-2">
          <Input
            id="location-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="예: 강남역 2번 출구, 서울시청"
            className={cn(
              "flex-1 h-12 text-base border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-red-500/20",
              (error || searchError) 
                ? "border-red-500 focus:border-red-500" 
                : "border-gray-200 dark:border-gray-600 focus:border-red-500"
            )}
            aria-label="장소 검색"
            disabled={isSearching}
          />
          <Button
            type="button"
            onClick={searchLocation}
            disabled={isSearching || !searchQuery.trim()}
            className="h-12 px-6 font-semibold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-xl transition-all duration-200 hover:from-red-600 hover:to-pink-600 disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                검색중...
              </>
            ) : (
              <>
                <Search className="mr-2 w-5 h-5" />
                검색
              </>
            )}
          </Button>
        </div>

        {/* 에러 메시지 */}
        {(error || searchError) && (
          <div className="flex gap-2 items-center p-3 bg-red-50 rounded-lg dark:bg-red-900/20">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">{error || searchError}</p>
          </div>
        )}

        {/* 검색 결과 목록 */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              검색 결과 ({searchResults.length}개)
            </p>
            <div className="overflow-hidden max-h-80 space-y-2 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectLocation(result)}
                  className="flex gap-3 items-start px-4 py-3 w-full text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800"
                >
                  <MapPin className="flex-shrink-0 mt-1 w-4 h-4 text-red-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {result.displayName}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      위도: {result.lat.toFixed(6)}, 경도: {result.lng.toFixed(6)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-full dark:bg-red-900/20 dark:text-red-400">
                    선택
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 선택된 장소 표시 */}
        {locationData && searchResults.length === 0 && (
          <div className="p-3 text-sm text-gray-700 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
            <p className="flex gap-2 items-center font-medium">
              <MapPin className="w-4 h-4 text-green-600" />
              선택된 장소
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{locationData.displayName}</p>
          </div>
        )}
      </div>

      {/* 지도 표시 */}
      {locationData && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            지도 미리보기
          </Label>
          <Map
            lat={locationData.lat}
            lng={locationData.lng}
            locationName={locationData.displayName}
            zoom={15}
            height="300px"
          />
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        정확한 주소나 장소명을 입력하면 더 정확한 위치를 찾을 수 있습니다.
      </p>
    </div>
  )
}