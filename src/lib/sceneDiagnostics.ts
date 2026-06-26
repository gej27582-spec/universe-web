import type { QualityMode } from './satelliteMaterials'
import type { SatelliteId, ScaleMode } from './satellites'
import type { CelestialBodyId } from './solarSystem'

export interface SceneDiagnostics {
  selectedBody: CelestialBodyId | null
  selectedSatellite: SatelliteId | null
  scaleMode: ScaleMode
  quality: QualityMode
  calls: number
  triangles: number
  points: number
  lines: number
  geometries: number
  textures: number
  satellites: number
  satelliteTexturesLoaded: number
  dpr: number
}

export interface ObservatoryDiagnosticsApi {
  renderer: unknown
  snapshot: () => SceneDiagnostics
}
