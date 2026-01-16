"use client"

import { useEffect, useRef, useMemo } from "react"
import createGlobe from "cobe"

// NetworkGPT branding colors
const NETWORKGPT_COLORS = {
  electricBlue: "#0066ff",
  cyanAccent: "#00d4ff",
  momentumTeal: "#00c9a7",
}

// POP (Point of Presence) location
export interface POPLocation {
  lat: number
  lng: number
  city?: string
  country?: string
}

// Generate POP locations representing global network presence
export function generatePOPLocations(): POPLocation[] {
  const majorHubs: POPLocation[] = [
    // North America
    { lat: 40.7128, lng: -74.006, city: "New York", country: "USA" },
    { lat: 34.0522, lng: -118.2437, city: "Los Angeles", country: "USA" },
    { lat: 41.8781, lng: -87.6298, city: "Chicago", country: "USA" },
    { lat: 29.7604, lng: -95.3698, city: "Houston", country: "USA" },
    { lat: 33.749, lng: -84.388, city: "Atlanta", country: "USA" },
    { lat: 47.6062, lng: -122.3321, city: "Seattle", country: "USA" },
    { lat: 37.7749, lng: -122.4194, city: "San Francisco", country: "USA" },
    { lat: 25.7617, lng: -80.1918, city: "Miami", country: "USA" },
    { lat: 39.7392, lng: -104.9903, city: "Denver", country: "USA" },
    { lat: 42.3601, lng: -71.0589, city: "Boston", country: "USA" },
    { lat: 38.9072, lng: -77.0369, city: "Washington DC", country: "USA" },
    { lat: 32.7767, lng: -96.797, city: "Dallas", country: "USA" },
    { lat: 33.4484, lng: -112.074, city: "Phoenix", country: "USA" },
    { lat: 43.6532, lng: -79.3832, city: "Toronto", country: "Canada" },
    { lat: 49.2827, lng: -123.1207, city: "Vancouver", country: "Canada" },
    { lat: 45.5017, lng: -73.5673, city: "Montreal", country: "Canada" },
    // Europe
    { lat: 51.5074, lng: -0.1278, city: "London", country: "UK" },
    { lat: 52.52, lng: 13.405, city: "Berlin", country: "Germany" },
    { lat: 48.8566, lng: 2.3522, city: "Paris", country: "France" },
    { lat: 52.3676, lng: 4.9041, city: "Amsterdam", country: "Netherlands" },
    { lat: 50.1109, lng: 8.6821, city: "Frankfurt", country: "Germany" },
    { lat: 55.6761, lng: 12.5683, city: "Copenhagen", country: "Denmark" },
    { lat: 59.3293, lng: 18.0686, city: "Stockholm", country: "Sweden" },
    { lat: 48.2082, lng: 16.3738, city: "Vienna", country: "Austria" },
    { lat: 47.3769, lng: 8.5417, city: "Zurich", country: "Switzerland" },
    { lat: 41.3851, lng: 2.1734, city: "Barcelona", country: "Spain" },
    { lat: 40.4168, lng: -3.7038, city: "Madrid", country: "Spain" },
    { lat: 45.4642, lng: 9.19, city: "Milan", country: "Italy" },
    { lat: 53.3498, lng: -6.2603, city: "Dublin", country: "Ireland" },
    // Asia Pacific
    { lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "Japan" },
    { lat: 1.3521, lng: 103.8198, city: "Singapore", country: "Singapore" },
    { lat: 22.3193, lng: 114.1694, city: "Hong Kong", country: "Hong Kong" },
    { lat: 37.5665, lng: 126.978, city: "Seoul", country: "South Korea" },
    { lat: 31.2304, lng: 121.4737, city: "Shanghai", country: "China" },
    { lat: 39.9042, lng: 116.4074, city: "Beijing", country: "China" },
    { lat: -33.8688, lng: 151.2093, city: "Sydney", country: "Australia" },
    { lat: -37.8136, lng: 144.9631, city: "Melbourne", country: "Australia" },
    { lat: 19.076, lng: 72.8777, city: "Mumbai", country: "India" },
    { lat: 12.9716, lng: 77.5946, city: "Bangalore", country: "India" },
    { lat: 3.139, lng: 101.6869, city: "Kuala Lumpur", country: "Malaysia" },
    { lat: 13.7563, lng: 100.5018, city: "Bangkok", country: "Thailand" },
    // Middle East
    { lat: 25.2048, lng: 55.2708, city: "Dubai", country: "UAE" },
    { lat: 32.0853, lng: 34.7818, city: "Tel Aviv", country: "Israel" },
    { lat: 41.0082, lng: 28.9784, city: "Istanbul", country: "Turkey" },
    // Africa
    { lat: -33.9249, lng: 18.4241, city: "Cape Town", country: "South Africa" },
    { lat: -26.2041, lng: 28.0473, city: "Johannesburg", country: "South Africa" },
    { lat: 30.0444, lng: 31.2357, city: "Cairo", country: "Egypt" },
    // Latin America
    { lat: -23.5505, lng: -46.6333, city: "São Paulo", country: "Brazil" },
    { lat: -22.9068, lng: -43.1729, city: "Rio de Janeiro", country: "Brazil" },
    { lat: -34.6037, lng: -58.3816, city: "Buenos Aires", country: "Argentina" },
    { lat: 19.4326, lng: -99.1332, city: "Mexico City", country: "Mexico" },
    { lat: -33.4489, lng: -70.6693, city: "Santiago", country: "Chile" },
    { lat: 4.711, lng: -74.0721, city: "Bogotá", country: "Colombia" },
  ]
  return majorHubs
}

// Globe configuration interface
export interface GlobeConfig {
  width?: number
  height?: number
  devicePixelRatio?: number
  phi?: number
  theta?: number
  dark?: number
  diffuse?: number
  mapSamples?: number
  mapBrightness?: number
  baseColor?: [number, number, number]
  markerColor?: [number, number, number]
  glowColor?: [number, number, number]
  markers?: POPLocation[]
  onRender?: (state: { phi: number }) => void
}

// Default configuration matching Aceternity style
export const defaultGlobeConfig: GlobeConfig = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [0.3, 0.3, 0.3],
  markerColor: [0.1, 0.8, 1],  // Cyan for POPs
  glowColor: [0, 0.4, 1],      // Electric blue glow
}

interface GlobeProps {
  config?: Partial<GlobeConfig>
  className?: string
}

export function Globe({ config = {}, className = "" }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const phiRef = useRef(0)

  const markers = useMemo(() => {
    const pops = config.markers || generatePOPLocations()
    return pops.map(p => ({
      location: [p.lat, p.lng] as [number, number],
      size: 0.03,
    }))
  }, [config.markers])

  const mergedConfig = useMemo(() => ({
    ...defaultGlobeConfig,
    ...config,
  }), [config])

  useEffect(() => {
    let width = 0
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth
      }
    }
    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: mergedConfig.devicePixelRatio || 2,
      width: (mergedConfig.width || 800) * 2,
      height: (mergedConfig.height || 800) * 2,
      phi: mergedConfig.phi || 0,
      theta: mergedConfig.theta || 0.3,
      dark: mergedConfig.dark ?? 1,
      diffuse: mergedConfig.diffuse ?? 0.4,
      mapSamples: mergedConfig.mapSamples || 16000,
      mapBrightness: mergedConfig.mapBrightness || 1.2,
      baseColor: mergedConfig.baseColor || [0.3, 0.3, 0.3],
      markerColor: mergedConfig.markerColor || [0.1, 0.8, 1],
      glowColor: mergedConfig.glowColor || [0, 0.4, 1],
      markers,
      onRender: (state) => {
        // Smooth auto-rotation
        if (!pointerInteracting.current) {
          phiRef.current += 0.002
        }
        state.phi = phiRef.current + pointerInteractionMovement.current
        state.width = (mergedConfig.width || 800) * 2
        state.height = (mergedConfig.height || 800) * 2
      },
    })

    // Timeout to fade in
    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1"
      }
    }, 0)

    return () => {
      globe.destroy()
      window.removeEventListener("resize", onResize)
    }
  }, [markers, mergedConfig])

  return (
    <div
      className={className}
      style={{
        width: mergedConfig.width || 800,
        height: mergedConfig.height || 800,
        maxWidth: "100%",
        aspectRatio: "1",
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "grabbing"
          }
        }}
        onPointerUp={() => {
          pointerInteracting.current = null
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "grab"
          }
        }}
        onPointerOut={() => {
          pointerInteracting.current = null
          if (canvasRef.current) {
            canvasRef.current.style.cursor = "grab"
          }
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current
            pointerInteractionMovement.current = delta / 200
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current
            pointerInteractionMovement.current = delta / 100
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          contain: "layout paint size",
          opacity: 0,
          transition: "opacity 1s ease",
        }}
      />
    </div>
  )
}

export { NETWORKGPT_COLORS }
export default Globe
