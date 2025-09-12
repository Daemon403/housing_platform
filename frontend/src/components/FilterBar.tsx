import { useEffect, useState } from 'react'

export type Filters = {
  q?: string
  propertyType?: string
  roomType?: string
  minPrice?: string
  maxPrice?: string
  lat?: string
  lng?: string
  radiusKm?: string
}

export function FilterBar({ value, onChange, onSearch }: { value: Filters; onChange: (v: Filters) => void; onSearch: () => void }) {
  const [state, setState] = useState<Filters>(value)

  useEffect(() => setState(value), [value])

  const set = (k: keyof Filters, v: string) => {
    const next = { ...state, [k]: v }
    setState(next)
    onChange(next)
  }

  return (
    <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 160px 160px 120px 120px 120px 120px 120px', alignItems: 'center' }}>
      <input placeholder="Search..." value={state.q || ''} onChange={(e) => set('q', e.target.value)} />
      <select value={state.propertyType || ''} onChange={(e) => set('propertyType', e.target.value)}>
        <option value="">Property Type</option>
        <option value="apartment">Apartment</option>
        <option value="house">House</option>
        <option value="condo">Condo</option>
        <option value="townhouse">Townhouse</option>
        <option value="room">Room</option>
        <option value="other">Other</option>
      </select>
      <select value={state.roomType || ''} onChange={(e) => set('roomType', e.target.value)}>
        <option value="">Room Type</option>
        <option value="entire-place">Entire place</option>
        <option value="private-room">Private room</option>
        <option value="shared-room">Shared room</option>
      </select>
      <input placeholder="Min Price" value={state.minPrice || ''} onChange={(e) => set('minPrice', e.target.value)} />
      <input placeholder="Max Price" value={state.maxPrice || ''} onChange={(e) => set('maxPrice', e.target.value)} />
      <input placeholder="Latitude" value={state.lat || ''} onChange={(e) => set('lat', e.target.value)} />
      <input placeholder="Longitude" value={state.lng || ''} onChange={(e) => set('lng', e.target.value)} />
      <input placeholder="Radius (km)" value={state.radiusKm || ''} onChange={(e) => set('radiusKm', e.target.value)} />
      <button onClick={onSearch} style={{ gridColumn: '1 / -1', justifySelf: 'start' }}>Search</button>
    </div>
  )
}
