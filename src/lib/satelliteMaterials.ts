import type { SatelliteId, SatellitePhenomenon } from './satellites'

export type SatelliteMaterialPresetId =
  | 'rockyCratered'
  | 'icyCracked'
  | 'volcanicSulfur'
  | 'hazyAtmosphere'
  | 'irregularRock'
  | 'geyserIce'
  | 'tritonFrost'

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
  textureTint: number
  usesTexture: boolean
  hasNormal: boolean
  hasRoughness: boolean
  hasEmissive: boolean
  hasAtmosphere: boolean
  hasParticleEffect: boolean
  visualIntent: string
}

export interface MaterialRealismProfile {
  target: SatelliteId
  preset: SatelliteMaterialPresetId
  colorRead: 'warm-rock' | 'cold-ice' | 'sulfur-volcanic' | 'amber-haze' | 'dark-rubble'
  surfaceDetail: string
  emissionPolicy: string
  fallbackPolicy: string
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
    roughness: 0.92,
    metalness: 0,
    emissiveIntensity: 0.012,
    fallbackColor: 0x8d877c,
    fallbackAccent: 0xc8c2b4,
    textureTint: 0xffffff,
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
    roughness: 0.58,
    metalness: 0,
    clearcoat: 0.38,
    clearcoatRoughness: 0.32,
    emissiveIntensity: 0.01,
    fallbackColor: 0xdde9ed,
    fallbackAccent: 0x86bfd5,
    textureTint: 0xf4fbff,
    usesTexture: true,
    hasNormal: false,
    hasRoughness: false,
    hasEmissive: false,
    hasAtmosphere: false,
    hasParticleEffect: false,
    visualIntent: '冷白蓝基调、窄幅高光和裂纹线条，避免塑料感。',
  },
  volcanicSulfur: {
    id: 'volcanicSulfur',
    labelZh: '火山硫磺型',
    materialType: 'MeshStandardMaterial',
    roughness: 0.8,
    metalness: 0,
    emissiveIntensity: 0.045,
    fallbackColor: 0xd9aa47,
    fallbackAccent: 0x6c3b24,
    textureTint: 0xfff0c8,
    usesTexture: true,
    hasNormal: false,
    hasRoughness: false,
    hasEmissive: true,
    hasAtmosphere: false,
    hasParticleEffect: false,
    visualIntent: '黄色、橙色和暗褐色硫质斑块，只让局部火山点轻微发光。',
  },
  hazyAtmosphere: {
    id: 'hazyAtmosphere',
    labelZh: '雾霾大气型',
    materialType: 'MeshStandardMaterial',
    roughness: 0.9,
    metalness: 0,
    emissiveIntensity: 0.008,
    fallbackColor: 0x9f6538,
    fallbackAccent: 0xd6a05f,
    textureTint: 0xf2d0a1,
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
    roughness: 0.97,
    metalness: 0,
    emissiveIntensity: 0.004,
    fallbackColor: 0x6e675e,
    fallbackAccent: 0xa49a8b,
    textureTint: 0xf1eee7,
    usesTexture: true,
    hasNormal: false,
    hasRoughness: false,
    hasEmissive: false,
    hasAtmosphere: false,
    hasParticleEffect: false,
    visualIntent: '非完全球体、暗淡碎石感和低反光；高/均衡模式按需加载火卫真实表面贴图。',
  },
  geyserIce: {
    id: 'geyserIce',
    labelZh: '喷流冰面型',
    materialType: 'MeshPhysicalMaterial',
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.28,
    clearcoatRoughness: 0.38,
    emissiveIntensity: 0.008,
    fallbackColor: 0xd9eef4,
    fallbackAccent: 0x91c9dd,
    textureTint: 0xf6fcff,
    usesTexture: true,
    hasNormal: false,
    hasRoughness: false,
    hasEmissive: false,
    hasAtmosphere: false,
    hasParticleEffect: true,
    visualIntent: '冷色冰面和克制南极喷流，粒子稀疏、低亮度。',
  },
  tritonFrost: {
    id: 'tritonFrost',
    labelZh: '氮冰霜冻型',
    materialType: 'MeshPhysicalMaterial',
    roughness: 0.64,
    metalness: 0,
    clearcoat: 0.22,
    clearcoatRoughness: 0.46,
    emissiveIntensity: 0.004,
    fallbackColor: 0xd8e2e7,
    fallbackAccent: 0xb98aa0,
    textureTint: 0xf7fbff,
    usesTexture: true,
    hasNormal: false,
    hasRoughness: false,
    hasEmissive: false,
    hasAtmosphere: false,
    hasParticleEffect: false,
    visualIntent: '海卫一专属：冷灰、淡粉氮冰和暗色条带共存，避免整体棕化或巧克力球感。',
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
  triton: 'tritonFrost',
}

export const SATELLITE_REALISM_PROFILES: Record<SatelliteId, MaterialRealismProfile> = {
  moon: {
    target: 'moon',
    preset: 'rockyCratered',
    colorRead: 'warm-rock',
    surfaceDetail: '灰色月海、撞击坑和昼夜分界优先。',
    emissionPolicy: '不整体发光，只保留地球反照光壳层。',
    fallbackPolicy: '程序坑洼纹理必须保持低饱和月面读法。',
  },
  phobos: {
    target: 'phobos',
    preset: 'irregularRock',
    colorRead: 'dark-rubble',
    surfaceDetail: '不规则轮廓、低反光和真实表面坑洼优先。',
    emissionPolicy: '不发光。',
    fallbackPolicy: '低配也保留暗淡碎石纹理和非球体轮廓。',
  },
  deimos: {
    target: 'deimos',
    preset: 'irregularRock',
    colorRead: 'dark-rubble',
    surfaceDetail: '更平缓的碎石表面，区别于火卫一。',
    emissionPolicy: '不发光。',
    fallbackPolicy: '低配也保留暗淡碎石纹理和非球体轮廓。',
  },
  io: {
    target: 'io',
    preset: 'volcanicSulfur',
    colorRead: 'sulfur-volcanic',
    surfaceDetail: '黄、橙、暗褐硫磺斑块和小型热点。',
    emissionPolicy: '只允许局部火山热点，禁止整球发光。',
    fallbackPolicy: 'fallback 必须有硫磺斑块和暗色火山地形。',
  },
  europa: {
    target: 'europa',
    preset: 'icyCracked',
    colorRead: 'cold-ice',
    surfaceDetail: '白蓝冰面、窄高光和裂纹网络。',
    emissionPolicy: '不发光。',
    fallbackPolicy: '低配保留冷色裂纹线条。',
  },
  ganymede: {
    target: 'ganymede',
    preset: 'icyCracked',
    colorRead: 'cold-ice',
    surfaceDetail: '冰岩混合暗区和浅色沟槽。',
    emissionPolicy: '只允许极弱边缘提示。',
    fallbackPolicy: '低配保留冷灰冰岩纹理。',
  },
  callisto: {
    target: 'callisto',
    preset: 'rockyCratered',
    colorRead: 'warm-rock',
    surfaceDetail: '深色古老撞击面和高粗糙度。',
    emissionPolicy: '不发光。',
    fallbackPolicy: 'fallback 保持暗色坑洼。',
  },
  titan: {
    target: 'titan',
    preset: 'hazyAtmosphere',
    colorRead: 'amber-haze',
    surfaceDetail: '低对比表面被黄褐雾霾遮罩。',
    emissionPolicy: '不发光，只保留大气散射。',
    fallbackPolicy: 'fallback 不做纯黄球，保留低对比云雾层次。',
  },
  enceladus: {
    target: 'enceladus',
    preset: 'geyserIce',
    colorRead: 'cold-ice',
    surfaceDetail: '冷白冰面和克制南极喷流。',
    emissionPolicy: '喷流低亮度，禁止魔法技能感。',
    fallbackPolicy: 'fallback 保留冰面裂纹与低密度喷流。',
  },
  triton: {
    target: 'triton',
    preset: 'tritonFrost',
    colorRead: 'cold-ice',
    surfaceDetail: '冷灰氮冰、淡粉霜冻和暗色条带，配合逆行轨道提示。',
    emissionPolicy: '不整体发光，只允许极弱冷色边缘读法。',
    fallbackPolicy: 'fallback 必须呈现冷灰/淡粉冰霜，不允许棕色石球读法。',
  },
}

export function getSatelliteMaterialPreset(satelliteId: SatelliteId) {
  return SATELLITE_MATERIAL_PRESETS[SATELLITE_MATERIAL_PRESET_BY_ID[satelliteId]]
}

export function getSatelliteRealismProfile(satelliteId: SatelliteId) {
  return SATELLITE_REALISM_PROFILES[satelliteId]
}

export function getPresetForPhenomenon(phenomenon: SatellitePhenomenon): SatelliteMaterialPresetId {
  if (phenomenon === 'irregular') return 'irregularRock'
  if (phenomenon === 'volcanic') return 'volcanicSulfur'
  if (phenomenon === 'haze') return 'hazyAtmosphere'
  if (phenomenon === 'plume') return 'geyserIce'
  if (phenomenon === 'ice') return 'icyCracked'
  if (phenomenon === 'nitrogenFrost') return 'tritonFrost'
  return 'rockyCratered'
}
