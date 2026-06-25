import type { SatelliteId, SatellitePhenomenon } from './satellites'

export type SatelliteMaterialPresetId =
  | 'rockyCratered'
  | 'icyCracked'
  | 'volcanicSulfur'
  | 'hazyAtmosphere'
  | 'irregularRock'
  | 'geyserIce'

export type QualityMode = 'high' | 'balanced' | 'low'

export interface SatelliteMaterialPreset {
  id: SatelliteMaterialPresetId
  labelZh: string
  materialType: 'MeshStandardMaterial' | 'MeshPhysicalMaterial'
  roughness: number
  metalness: number
  clearcoat?: number
  clearcoatRoughness?: number
  emissiveIntensity: number
  fallbackColor: number
  fallbackAccent: number
  usesTexture: boolean
  hasNormal: boolean
  hasRoughness: boolean
  hasEmissive: boolean
  hasAtmosphere: boolean
  hasParticleEffect: boolean
  visualIntent: string
}

export interface QualitySettings {
  dprCap: number
  planetSegments: number
  satelliteSegments: number
  hazeSegments: number
  plumeParticles: number
  starMultiplier: number
  loadSatelliteTextures: boolean
  effectIntensity: number
  textureAnisotropyCap: number
}

export const QUALITY_SETTINGS: Record<QualityMode, QualitySettings> = {
  high: {
    dprCap: 1.5,
    planetSegments: 48,
    satelliteSegments: 36,
    hazeSegments: 32,
    plumeParticles: 58,
    starMultiplier: 1,
    loadSatelliteTextures: true,
    effectIntensity: 1,
    textureAnisotropyCap: 8,
  },
  balanced: {
    dprCap: 1.25,
    planetSegments: 40,
    satelliteSegments: 30,
    hazeSegments: 26,
    plumeParticles: 34,
    starMultiplier: 0.72,
    loadSatelliteTextures: true,
    effectIntensity: 0.78,
    textureAnisotropyCap: 4,
  },
  low: {
    dprCap: 1.05,
    planetSegments: 30,
    satelliteSegments: 22,
    hazeSegments: 18,
    plumeParticles: 14,
    starMultiplier: 0.42,
    loadSatelliteTextures: false,
    effectIntensity: 0.42,
    textureAnisotropyCap: 2,
  },
}

export const SATELLITE_MATERIAL_PRESETS: Record<SatelliteMaterialPresetId, SatelliteMaterialPreset> = {
  rockyCratered: {
    id: 'rockyCratered',
    labelZh: '岩石坑洼型',
    materialType: 'MeshStandardMaterial',
    roughness: 0.9,
    metalness: 0,
    emissiveIntensity: 0.02,
    fallbackColor: 0x8d877c,
    fallbackAccent: 0xc8c2b4,
    usesTexture: true,
    hasNormal: false,
    hasRoughness: false,
    hasEmissive: false,
    hasAtmosphere: false,
    hasParticleEffect: false,
    visualIntent: '高粗糙度、低反光，靠撞击纹理和掠射光读出坑洼层次。',
  },
  icyCracked: {
    id: 'icyCracked',
    labelZh: '冰面裂纹型',
    materialType: 'MeshPhysicalMaterial',
    roughness: 0.52,
    metalness: 0,
    clearcoat: 0.52,
    clearcoatRoughness: 0.24,
    emissiveIntensity: 0.018,
    fallbackColor: 0xdceaf0,
    fallbackAccent: 0x89cce8,
    usesTexture: true,
    hasNormal: false,
    hasRoughness: false,
    hasEmissive: false,
    hasAtmosphere: false,
    hasParticleEffect: false,
    visualIntent: '冷白蓝基调、窄幅清漆高光和裂纹线条，避免塑料感。',
  },
  volcanicSulfur: {
    id: 'volcanicSulfur',
    labelZh: '火山硫磺型',
    materialType: 'MeshStandardMaterial',
    roughness: 0.76,
    metalness: 0,
    emissiveIntensity: 0.08,
    fallbackColor: 0xe4b24b,
    fallbackAccent: 0x7a3f22,
    usesTexture: true,
    hasNormal: false,
    hasRoughness: false,
    hasEmissive: true,
    hasAtmosphere: false,
    hasParticleEffect: false,
    visualIntent: '黄色、橙色和暗褐色硫质斑块，只有局部火山点轻微发光。',
  },
  hazyAtmosphere: {
    id: 'hazyAtmosphere',
    labelZh: '雾霾大气型',
    materialType: 'MeshStandardMaterial',
    roughness: 0.88,
    metalness: 0,
    emissiveIntensity: 0.018,
    fallbackColor: 0xb57438,
    fallbackAccent: 0xf1b662,
    usesTexture: true,
    hasNormal: false,
    hasRoughness: false,
    hasEmissive: false,
    hasAtmosphere: true,
    hasParticleEffect: false,
    visualIntent: '黄褐色低对比本体叠加半透明雾霾壳，表面若隐若现。',
  },
  irregularRock: {
    id: 'irregularRock',
    labelZh: '不规则小天体型',
    materialType: 'MeshStandardMaterial',
    roughness: 0.96,
    metalness: 0,
    emissiveIntensity: 0.008,
    fallbackColor: 0x726b61,
    fallbackAccent: 0xa39a8d,
    usesTexture: true,
    hasNormal: false,
    hasRoughness: false,
    hasEmissive: false,
    hasAtmosphere: false,
    hasParticleEffect: false,
    visualIntent: '非完全球体、暗淡碎石感和低反光；高/均衡模式按需加载火卫真实表面贴图，低配保留程序 fallback。',
  },
  geyserIce: {
    id: 'geyserIce',
    labelZh: '喷流冰面型',
    materialType: 'MeshPhysicalMaterial',
    roughness: 0.46,
    metalness: 0,
    clearcoat: 0.38,
    clearcoatRoughness: 0.34,
    emissiveIntensity: 0.016,
    fallbackColor: 0xd9eef4,
    fallbackAccent: 0x91c9dd,
    usesTexture: true,
    hasNormal: false,
    hasRoughness: false,
    hasEmissive: false,
    hasAtmosphere: false,
    hasParticleEffect: true,
    visualIntent: '冷色冰面和克制南极喷流，粒子稀疏、低亮度。',
  },
}

export const SATELLITE_MATERIAL_PRESET_BY_ID: Record<SatelliteId, SatelliteMaterialPresetId> = {
  moon: 'rockyCratered',
  phobos: 'irregularRock',
  deimos: 'irregularRock',
  io: 'volcanicSulfur',
  europa: 'icyCracked',
  ganymede: 'icyCracked',
  callisto: 'rockyCratered',
  titan: 'hazyAtmosphere',
  enceladus: 'geyserIce',
  triton: 'icyCracked',
}

export function getSatelliteMaterialPreset(satelliteId: SatelliteId) {
  return SATELLITE_MATERIAL_PRESETS[SATELLITE_MATERIAL_PRESET_BY_ID[satelliteId]]
}

export function getPresetForPhenomenon(phenomenon: SatellitePhenomenon): SatelliteMaterialPresetId {
  if (phenomenon === 'irregular') return 'irregularRock'
  if (phenomenon === 'volcanic') return 'volcanicSulfur'
  if (phenomenon === 'haze') return 'hazyAtmosphere'
  if (phenomenon === 'plume') return 'geyserIce'
  if (phenomenon === 'ice') return 'icyCracked'
  return 'rockyCratered'
}
