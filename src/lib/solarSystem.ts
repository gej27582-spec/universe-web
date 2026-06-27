import { BODY_COPY, REGION_COPY } from './solarSystemContent.zh'

export type ObservationRegionId = 'solar-system' | 'outer-solar-system'

export type CelestialBodyId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'charon'
  | 'ceres'
  | 'asteroid-belt'
  | 'comet'

export type BodyClassification =
  | 'star'
  | 'planet'
  | 'dwarf-planet'
  | 'moon'
  | 'small-body'
  | 'comet'

export interface CameraPreset {
  distance: number
  azimuth: number
  elevation: number
  horizontalOffset: number
  targetHeight: number
  duration: number
}

export interface PlanetMaterialProfile {
  roughness: number
  emissiveIntensity: number
  colorTint: string
  atmosphereOpacity?: number
  visualIntent: string
}

export interface BodyFactProfile {
  identity: string
  age: string
  formation: string
  discovery: string
  composition: string
  surface: string
  missions: string[]
  sourceLinks: string[]
  visualizationNote?: string
}

export interface AssetProvenance {
  texture?: string
  sourceName: string
  sourceUrl: string
  license: string
  purpose: string
  realObservation: boolean
  colorCalibrated: boolean
}

export interface CelestialBody {
  id: CelestialBodyId
  regionId: ObservationRegionId
  classification: BodyClassification
  nameZh: string
  nameEn: string
  typeZh: string
  typeEn: string
  baseColor: string
  accentColor: string
  radius: number
  orbitRadius: number
  orbitSpeed: number
  rotationSpeed: number
  inclination: number
  axialTilt: number
  startAngle: number
  diameter: string
  diameterKm: number
  distance: string
  dayLength: string
  dayHours: number
  yearLength: string
  yearDays: number
  temperature: string
  gravityEarth: number
  description: string
  observationCode: string
  tags: string[]
  camera: CameraPreset
  hasRings?: boolean
  texture?: string
  materialProfile: PlanetMaterialProfile
  facts: BodyFactProfile
  asset: AssetProvenance
}

export interface ObservationRegion {
  id: ObservationRegionId
  nameZh: string
  nameEn: string
  description: string
}

interface BodyModelConfig {
  id: CelestialBodyId
  regionId: ObservationRegionId
  classification: BodyClassification
  baseColor: string
  accentColor: string
  radius: number
  orbitRadius: number
  orbitSpeed: number
  rotationSpeed: number
  inclination: number
  axialTilt: number
  startAngle: number
  diameterKm: number
  dayHours: number
  yearDays: number
  gravityEarth: number
  camera: CameraPreset
  material: Omit<PlanetMaterialProfile, 'visualIntent'>
  hasRings?: boolean
  texture?: string
}

const BODY_MODEL_CONFIGS: BodyModelConfig[] = [
  {
    id: 'sun', regionId: 'solar-system', classification: 'star',
    baseColor: '#ffad38', accentColor: '#fff0b0', radius: 1.55, orbitRadius: 0, orbitSpeed: 0,
    rotationSpeed: 0.08, inclination: 0, axialTilt: 7.25, startAngle: 0,
    diameterKm: 1392700, dayHours: 648, yearDays: 0, gravityEarth: 27.94,
    camera: { distance: 7.4, azimuth: 0.52, elevation: 0.2, horizontalOffset: -0.18, targetHeight: 0.15, duration: 2.1 },
    texture: 'textures/solar-system-scope/2k_sun.jpg',
    material: { roughness: 0.72, emissiveIntensity: 0.2, colorTint: '#fff0d0' },
  },
  {
    id: 'mercury', regionId: 'solar-system', classification: 'planet',
    baseColor: '#8f8a82', accentColor: '#d5cec2', radius: 0.24, orbitRadius: 2.5, orbitSpeed: 1.6,
    rotationSpeed: 0.05, inclination: 0.12, axialTilt: 0.034, startAngle: 0.4,
    diameterKm: 4879, dayHours: 1407.6, yearDays: 88, gravityEarth: 0.38,
    camera: { distance: 1.45, azimuth: 0.55, elevation: 0.18, horizontalOffset: -0.75, targetHeight: 0.03, duration: 1.65 },
    texture: 'textures/solar-system-scope/2k_mercury.jpg',
    material: { roughness: 0.99, emissiveIntensity: 0.001, colorTint: '#928778' },
  },
  {
    id: 'venus', regionId: 'solar-system', classification: 'planet',
    baseColor: '#c88f4e', accentColor: '#f0d2a4', radius: 0.39, orbitRadius: 3.45, orbitSpeed: 1.18,
    rotationSpeed: -0.018, inclination: 0.06, axialTilt: 177.4, startAngle: 2.1,
    diameterKm: 12104, dayHours: 5832, yearDays: 225, gravityEarth: 0.9,
    camera: { distance: 1.75, azimuth: -0.45, elevation: 0.32, horizontalOffset: -0.58, targetHeight: 0.06, duration: 1.75 },
    texture: 'textures/solar-system-scope/2k_venus_atmosphere.jpg',
    material: { roughness: 0.99, emissiveIntensity: 0.002, colorTint: '#d19652', atmosphereOpacity: 0.105 },
  },
  {
    id: 'earth', regionId: 'solar-system', classification: 'planet',
    baseColor: '#2c6a9d', accentColor: '#77ad7a', radius: 0.42, orbitRadius: 4.55, orbitSpeed: 1,
    rotationSpeed: 0.42, inclination: 0.02, axialTilt: 23.44, startAngle: 3.25,
    diameterKm: 12742, dayHours: 23.934, yearDays: 365.25, gravityEarth: 1,
    camera: { distance: 2.25, azimuth: 0.6, elevation: 0.22, horizontalOffset: -0.68, targetHeight: 0.1, duration: 1.85 },
    texture: 'textures/solar-system-scope/2k_earth_daymap.jpg',
    material: { roughness: 0.78, emissiveIntensity: 0.0045, colorTint: '#f0f7ff', atmosphereOpacity: 0.115 },
  },
  {
    id: 'mars', regionId: 'solar-system', classification: 'planet',
    baseColor: '#9c4028', accentColor: '#d8845e', radius: 0.31, orbitRadius: 5.75, orbitSpeed: 0.81,
    rotationSpeed: 0.4, inclination: 0.04, axialTilt: 25.19, startAngle: 5.1,
    diameterKm: 6779, dayHours: 24.62, yearDays: 687, gravityEarth: 0.38,
    camera: { distance: 1.58, azimuth: -0.55, elevation: 0.26, horizontalOffset: -0.72, targetHeight: 0.04, duration: 1.72 },
    texture: 'textures/solar-system-scope/2k_mars.jpg',
    material: { roughness: 0.96, emissiveIntensity: 0.002, colorTint: '#c89a84' },
  },
  {
    id: 'jupiter', regionId: 'solar-system', classification: 'planet',
    baseColor: '#b88967', accentColor: '#ead1ac', radius: 0.9, orbitRadius: 7.65, orbitSpeed: 0.44,
    rotationSpeed: 0.75, inclination: 0.025, axialTilt: 3.13, startAngle: 1.15,
    diameterKm: 139820, dayHours: 9.93, yearDays: 4332.59, gravityEarth: 2.53,
    camera: { distance: 4.35, azimuth: 0.38, elevation: 0.2, horizontalOffset: -0.42, targetHeight: 0.12, duration: 2.05 },
    texture: 'textures/solar-system-scope/2k_jupiter.jpg',
    material: { roughness: 0.995, emissiveIntensity: 0.0025, colorTint: '#f4dfbd', atmosphereOpacity: 0.045 },
  },
  {
    id: 'saturn', regionId: 'solar-system', classification: 'planet',
    baseColor: '#c5a66d', accentColor: '#f1dfb2', radius: 0.78, orbitRadius: 9.65, orbitSpeed: 0.32,
    rotationSpeed: 0.68, inclination: 0.045, axialTilt: 26.73, startAngle: 4.35,
    diameterKm: 116460, dayHours: 10.7, yearDays: 10759, gravityEarth: 1.07,
    camera: { distance: 5.4, azimuth: -0.5, elevation: 0.42, horizontalOffset: -0.34, targetHeight: 0.08, duration: 2.2 },
    hasRings: true,
    texture: 'textures/solar-system-scope/2k_saturn.jpg',
    material: { roughness: 0.995, emissiveIntensity: 0.003, colorTint: '#ead39e', atmosphereOpacity: 0.035 },
  },
  {
    id: 'uranus', regionId: 'solar-system', classification: 'planet',
    baseColor: '#77b6bd', accentColor: '#bce8e4', radius: 0.57, orbitRadius: 11.4, orbitSpeed: 0.23,
    rotationSpeed: -0.5, inclination: 0.03, axialTilt: 97.77, startAngle: 2.75,
    diameterKm: 50724, dayHours: 17.24, yearDays: 30687, gravityEarth: 0.89,
    camera: { distance: 2.75, azimuth: 0.48, elevation: 0.14, horizontalOffset: -0.52, targetHeight: 0.05, duration: 1.95 },
    hasRings: true,
    texture: 'textures/solar-system-scope/2k_uranus.jpg',
    material: { roughness: 0.99, emissiveIntensity: 0.0015, colorTint: '#82bdb6', atmosphereOpacity: 0.08 },
  },
  {
    id: 'neptune', regionId: 'solar-system', classification: 'planet',
    baseColor: '#315da8', accentColor: '#79a5f0', radius: 0.55, orbitRadius: 13.05, orbitSpeed: 0.18,
    rotationSpeed: 0.48, inclination: 0.05, axialTilt: 28.32, startAngle: 0.05,
    diameterKm: 49244, dayHours: 16.11, yearDays: 60190, gravityEarth: 1.14,
    camera: { distance: 2.72, azimuth: -0.35, elevation: 0.3, horizontalOffset: -0.62, targetHeight: 0.07, duration: 2.05 },
    texture: 'textures/solar-system-scope/2k_neptune.jpg',
    material: { roughness: 0.99, emissiveIntensity: 0.002, colorTint: '#9ebcf0', atmosphereOpacity: 0.096 },
  },
  {
    id: 'pluto', regionId: 'outer-solar-system', classification: 'dwarf-planet',
    baseColor: '#bda391', accentColor: '#f1e7dc', radius: 0.22, orbitRadius: 15.2, orbitSpeed: 0.075,
    rotationSpeed: -0.08, inclination: 0.3, axialTilt: 122.5, startAngle: 1.9,
    diameterKm: 2377, dayHours: 153.3, yearDays: 90560, gravityEarth: 0.063,
    camera: { distance: 1.24, azimuth: 0.45, elevation: 0.22, horizontalOffset: -0.72, targetHeight: 0.03, duration: 1.7 },
    texture: 'textures/outer-system/pluto-usgs-new-horizons-1024.jpg',
    material: { roughness: 0.98, emissiveIntensity: 0.002, colorTint: '#f1e3d6' },
  },
  {
    id: 'charon', regionId: 'outer-solar-system', classification: 'moon',
    baseColor: '#9c938b', accentColor: '#d7d1c8', radius: 0.135, orbitRadius: 15.7, orbitSpeed: 0.09,
    rotationSpeed: 0.06, inclination: 0.31, axialTilt: 0, startAngle: 2.5,
    diameterKm: 1212, dayHours: 153.6, yearDays: 90560, gravityEarth: 0.029,
    camera: { distance: 0.86, azimuth: -0.38, elevation: 0.18, horizontalOffset: -0.74, targetHeight: 0.02, duration: 1.5 },
    texture: 'textures/outer-system/charon-usgs-new-horizons-1024.jpg',
    material: { roughness: 0.99, emissiveIntensity: 0.0015, colorTint: '#d6d0c8' },
  },
  {
    id: 'ceres', regionId: 'outer-solar-system', classification: 'dwarf-planet',
    baseColor: '#74706a', accentColor: '#d8d0bc', radius: 0.16, orbitRadius: 17.2, orbitSpeed: 0.13,
    rotationSpeed: 0.32, inclination: 0.18, axialTilt: 4, startAngle: 4.2,
    diameterKm: 940, dayHours: 9.1, yearDays: 1680, gravityEarth: 0.028,
    camera: { distance: 0.92, azimuth: 0.35, elevation: 0.22, horizontalOffset: -0.74, targetHeight: 0.02, duration: 1.45 },
    material: { roughness: 0.99, emissiveIntensity: 0.001, colorTint: '#b8b1a4' },
  },
  {
    id: 'asteroid-belt', regionId: 'outer-solar-system', classification: 'small-body',
    baseColor: '#6b6158', accentColor: '#b7a894', radius: 0.13, orbitRadius: 18.8, orbitSpeed: 0.11,
    rotationSpeed: 0.52, inclination: 0.12, axialTilt: 34, startAngle: 5.1,
    diameterKm: 520, dayHours: 12, yearDays: 1800, gravityEarth: 0.02,
    camera: { distance: 0.9, azimuth: -0.3, elevation: 0.28, horizontalOffset: -0.72, targetHeight: 0.02, duration: 1.4 },
    material: { roughness: 1, emissiveIntensity: 0, colorTint: '#9a8e82' },
  },
  {
    id: 'comet', regionId: 'outer-solar-system', classification: 'comet',
    baseColor: '#4f4942', accentColor: '#c6d8e0', radius: 0.12, orbitRadius: 20.5, orbitSpeed: 0.16,
    rotationSpeed: 0.44, inclination: 0.42, axialTilt: 68, startAngle: 0.8,
    diameterKm: 12, dayHours: 12.4, yearDays: 2700, gravityEarth: 0.001,
    camera: { distance: 1.0, azimuth: 0.42, elevation: 0.18, horizontalOffset: -0.72, targetHeight: 0.02, duration: 1.45 },
    material: { roughness: 1, emissiveIntensity: 0, colorTint: '#80766d', atmosphereOpacity: 0.035 },
  },
]

export const OBSERVATION_REGIONS: ObservationRegion[] = Object.entries(REGION_COPY).map(([id, copy]) => ({
  id: id as ObservationRegionId,
  ...copy,
}))

export const SOLAR_BODIES: CelestialBody[] = BODY_MODEL_CONFIGS.map((config) => {
  const content = BODY_COPY[config.id]

  return {
    ...config,
    ...content,
    texture: config.texture,
    materialProfile: {
      ...config.material,
      visualIntent: content.visualIntent,
    },
    asset: {
      texture: config.texture,
      ...content.asset,
    },
  }
})

export const MAIN_SOLAR_BODIES = SOLAR_BODIES.filter((body) => body.regionId === 'solar-system')
export const OUTER_SOLAR_SYSTEM_BODIES = SOLAR_BODIES.filter((body) => body.regionId === 'outer-solar-system')
export const PLANETS = SOLAR_BODIES.filter((body) => body.classification === 'planet')
export const MINOR_BODIES = SOLAR_BODIES.filter((body) => body.regionId === 'outer-solar-system')

export function getCelestialBody(id: string | null) {
  return SOLAR_BODIES.find((body) => body.id === id) ?? null
}

export function getBodiesForRegion(regionId: ObservationRegionId) {
  return SOLAR_BODIES.filter((body) => body.regionId === regionId)
}
