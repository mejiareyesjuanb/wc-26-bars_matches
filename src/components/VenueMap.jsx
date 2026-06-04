import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Numbered pin (rank) — uses a divIcon so we don't need Leaflet's image assets.
function pin(rank, top3) {
  const bg = top3 ? '#0ea5e9' : '#64748b'
  return L.divIcon({
    className: '',
    html: `<div style="background:${bg};color:#fff;border-radius:9999px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${rank}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

export default function VenueMap({ venues, onSelect }) {
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const map = L.map(elRef.current).setView([47.6062, -122.3321], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()
    const pts = []
    venues.forEach((v) => {
      if (v.lat == null || v.lng == null) return
      const m = L.marker([v.lat, v.lng], { icon: pin(v.rank, v.rank <= 3) })
      m.bindPopup(`<strong>#${v.rank} ${v.name}</strong><br>${v.neighborhood} · ${v.score}/100`)
      if (onSelect) m.on('click', () => onSelect(v))
      layer.addLayer(m)
      pts.push([v.lat, v.lng])
    })
    if (pts.length) map.fitBounds(pts, { padding: [34, 34], maxZoom: 14 })
  }, [venues, onSelect])

  return <div ref={elRef} className="h-[460px] w-full rounded-xl overflow-hidden border border-neutral-200 z-0" />
}
