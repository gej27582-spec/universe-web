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

export interface CelestialBody {
  id: CelestialBodyId
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
  materialProfile: PlanetMaterialProfile
}

export const SOLAR_BODIES: CelestialBody[] = [
  {
    id: 'sun', nameZh: '太阳', nameEn: 'SUN', typeZh: '黄矮星', typeEn: 'G-TYPE STAR',
    baseColor: '#ffad38', accentColor: '#fff0b0', radius: 1.55, orbitRadius: 0, orbitSpeed: 0,
    materialProfile: { roughness: 0.68, emissiveIntensity: 0.24, colorTint: '#ffffff', visualIntent: '恒星光球贴图保持高亮，但外层辉光只作视觉提示。' },
    rotationSpeed: 0.08, inclination: 0, axialTilt: 7.25, startAngle: 0,
    diameter: '1,392,700 km', diameterKm: 1392700, distance: '系统中心',
    dayLength: '约 27 个地球日', dayHours: 648, yearLength: '—', yearDays: 0,
    temperature: '表面约 5,500°C', gravityEarth: 27.94,
    description: '太阳系唯一的恒星，为八大行星提供光与热，也是整个系统的质量中心。',
    observationCode: 'SOL-00 / G2V',
    tags: ['恒星', '光球层', '系统质心'],
    camera: { distance: 7.4, azimuth: 0.52, elevation: 0.2, horizontalOffset: -0.18, targetHeight: 0.15, duration: 2.1 },
  },
  {
    id: 'mercury', nameZh: '水星', nameEn: 'MERCURY', typeZh: '岩石行星', typeEn: 'TERRESTRIAL',
    baseColor: '#8f8a82', accentColor: '#d5cec2', radius: 0.24, orbitRadius: 2.5, orbitSpeed: 1.6,
    materialProfile: { roughness: 0.94, emissiveIntensity: 0.006, colorTint: '#f0eee9', visualIntent: '灰褐岩质、低反光、撞击坑优先，避免金属或塑料感。' },
    rotationSpeed: 0.05, inclination: 0.12, axialTilt: 0.034, startAngle: 0.4,
    diameter: '4,879 km', diameterKm: 4879, distance: '距太阳约 5,790 万 km',
    dayLength: '约 59 个地球日', dayHours: 1407.6, yearLength: '88 个地球日', yearDays: 88,
    temperature: '−180°C 至 430°C', gravityEarth: 0.38,
    description: '最靠近太阳的行星，表面遍布撞击坑，昼夜温差极大。',
    observationCode: 'SOL-01 / HERMES',
    tags: ['岩石世界', '无卫星', '极端温差'],
    camera: { distance: 1.45, azimuth: 0.55, elevation: 0.18, horizontalOffset: -0.75, targetHeight: 0.03, duration: 1.65 },
  },
  {
    id: 'venus', nameZh: '金星', nameEn: 'VENUS', typeZh: '岩石行星', typeEn: 'TERRESTRIAL',
    baseColor: '#c88f4e', accentColor: '#f0d2a4', radius: 0.39, orbitRadius: 3.45, orbitSpeed: 1.18,
    materialProfile: { roughness: 0.96, emissiveIntensity: 0.006, colorTint: '#f0d3a6', atmosphereOpacity: 0.068, visualIntent: '厚重大气柔化表面，降低黄橙饱和度，避免普通黄球。' },
    rotationSpeed: -0.018, inclination: 0.06, axialTilt: 177.4, startAngle: 2.1,
    diameter: '12,104 km', diameterKm: 12104, distance: '距太阳约 1.082 亿 km',
    dayLength: '约 243 个地球日', dayHours: 5832, yearLength: '225 个地球日', yearDays: 225,
    temperature: '平均约 465°C', gravityEarth: 0.9,
    description: '被浓厚二氧化碳大气包裹，是太阳系表面最热的行星。',
    observationCode: 'SOL-02 / APHRODITE',
    tags: ['浓密大气', '逆向自转', '温室效应'],
    camera: { distance: 1.75, azimuth: -0.45, elevation: 0.32, horizontalOffset: -0.58, targetHeight: 0.06, duration: 1.75 },
  },
  {
    id: 'earth', nameZh: '地球', nameEn: 'EARTH', typeZh: '海洋行星', typeEn: 'OCEAN WORLD',
    baseColor: '#2c6a9d', accentColor: '#77ad7a', radius: 0.42, orbitRadius: 4.55, orbitSpeed: 1,
    materialProfile: { roughness: 0.72, emissiveIntensity: 0.006, colorTint: '#ffffff', atmosphereOpacity: 0.12, visualIntent: '海陆纹理和云层分离，保留蓝色大气边缘。' },
    rotationSpeed: 0.42, inclination: 0.02, axialTilt: 23.44, startAngle: 3.25,
    diameter: '12,742 km', diameterKm: 12742, distance: '距太阳约 1.496 亿 km',
    dayLength: '23 小时 56 分', dayHours: 23.934, yearLength: '365.25 天', yearDays: 365.25,
    temperature: '平均约 15°C', gravityEarth: 1,
    description: '已知唯一拥有生命的世界，液态海洋覆盖了大部分表面。',
    observationCode: 'SOL-03 / HOME',
    tags: ['液态海洋', '含氧大气', '生命信号'],
    camera: { distance: 2.25, azimuth: 0.6, elevation: 0.22, horizontalOffset: -0.68, targetHeight: 0.1, duration: 1.85 },
  },
  {
    id: 'mars', nameZh: '火星', nameEn: 'MARS', typeZh: '岩石行星', typeEn: 'TERRESTRIAL',
    baseColor: '#9c4028', accentColor: '#d8845e', radius: 0.31, orbitRadius: 5.75, orbitSpeed: 0.81,
    materialProfile: { roughness: 0.91, emissiveIntensity: 0.006, colorTint: '#f2ddd2', visualIntent: '铁锈色地表保留暗区和极冠对比，降低整体红色涂抹感。' },
    rotationSpeed: 0.4, inclination: 0.04, axialTilt: 25.19, startAngle: 5.1,
    diameter: '6,779 km', diameterKm: 6779, distance: '距太阳约 2.279 亿 km',
    dayLength: '24 小时 37 分', dayHours: 24.62, yearLength: '687 个地球日', yearDays: 687,
    temperature: '平均约 −63°C', gravityEarth: 0.38,
    description: '寒冷而干燥的红色世界，保存着远古河流与湖泊的痕迹。',
    observationCode: 'SOL-04 / ARES',
    tags: ['氧化铁地表', '极冠', '远古水系'],
    camera: { distance: 1.58, azimuth: -0.55, elevation: 0.26, horizontalOffset: -0.72, targetHeight: 0.04, duration: 1.72 },
  },
  {
    id: 'jupiter', nameZh: '木星', nameEn: 'JUPITER', typeZh: '气态巨行星', typeEn: 'GAS GIANT',
    baseColor: '#b88967', accentColor: '#ead1ac', radius: 0.9, orbitRadius: 7.65, orbitSpeed: 0.44,
    materialProfile: { roughness: 0.98, emissiveIntensity: 0.004, colorTint: '#fff3df', atmosphereOpacity: 0.048, visualIntent: '云带以低光泽漫反射为主，靠贴图条带读出气态层次。' },
    rotationSpeed: 0.75, inclination: 0.025, axialTilt: 3.13, startAngle: 1.15,
    diameter: '139,820 km', diameterKm: 139820, distance: '距太阳约 7.785 亿 km',
    dayLength: '9 小时 56 分', dayHours: 9.93, yearLength: '11.86 个地球年', yearDays: 4332.59,
    temperature: '云顶约 −110°C', gravityEarth: 2.53,
    description: '太阳系最大的行星，快速旋转形成明暗云带与巨型风暴。',
    observationCode: 'SOL-05 / ZEUS',
    tags: ['气态巨行星', '大红斑', '强磁层'],
    camera: { distance: 4.35, azimuth: 0.38, elevation: 0.2, horizontalOffset: -0.42, targetHeight: 0.12, duration: 2.05 },
  },
  {
    id: 'saturn', nameZh: '土星', nameEn: 'SATURN', typeZh: '气态巨行星', typeEn: 'RINGED GIANT',
    baseColor: '#c5a66d', accentColor: '#f1dfb2', radius: 0.78, orbitRadius: 9.65, orbitSpeed: 0.32,
    materialProfile: { roughness: 0.98, emissiveIntensity: 0.004, colorTint: '#fff1d1', visualIntent: '淡金色云带和环系统分层，避免球体与光环贴纸化。' },
    rotationSpeed: 0.68, inclination: 0.045, axialTilt: 26.73, startAngle: 4.35,
    diameter: '116,460 km', diameterKm: 116460, distance: '距太阳约 14.34 亿 km',
    dayLength: '约 10.7 小时', dayHours: 10.7, yearLength: '29.45 个地球年', yearDays: 10759,
    temperature: '云顶约 −140°C', gravityEarth: 1.07,
    description: '由冰与岩石碎片构成的明亮行星环，是太阳系最醒目的结构之一。',
    observationCode: 'SOL-06 / CRONUS',
    tags: ['环系', '气态巨行星', '低密度'],
    camera: { distance: 5.4, azimuth: -0.5, elevation: 0.42, horizontalOffset: -0.34, targetHeight: 0.08, duration: 2.2 },
    hasRings: true,
  },
  {
    id: 'uranus', nameZh: '天王星', nameEn: 'URANUS', typeZh: '冰巨行星', typeEn: 'ICE GIANT',
    baseColor: '#77b6bd', accentColor: '#bce8e4', radius: 0.57, orbitRadius: 11.4, orbitSpeed: 0.23,
    materialProfile: { roughness: 0.97, emissiveIntensity: 0.003, colorTint: '#d9fbff', atmosphereOpacity: 0.075, visualIntent: '冰巨星柔和青色大气，靠薄大气壳和低对比渐变增加体积感。' },
    rotationSpeed: -0.5, inclination: 0.03, axialTilt: 97.77, startAngle: 2.75,
    diameter: '50,724 km', diameterKm: 50724, distance: '距太阳约 28.71 亿 km',
    dayLength: '约 17 小时', dayHours: 17.24, yearLength: '84 个地球年', yearDays: 30687,
    temperature: '云顶约 −195°C', gravityEarth: 0.89,
    description: '自转轴几乎躺在轨道平面上，像侧卧一样围绕太阳运行。',
    observationCode: 'SOL-07 / CAELUS',
    tags: ['冰巨行星', '侧向自转', '甲烷大气'],
    camera: { distance: 2.75, azimuth: 0.48, elevation: 0.14, horizontalOffset: -0.52, targetHeight: 0.05, duration: 1.95 },
  },
  {
    id: 'neptune', nameZh: '海王星', nameEn: 'NEPTUNE', typeZh: '冰巨行星', typeEn: 'ICE GIANT',
    baseColor: '#315da8', accentColor: '#79a5f0', radius: 0.55, orbitRadius: 13.05, orbitSpeed: 0.18,
    materialProfile: { roughness: 0.97, emissiveIntensity: 0.003, colorTint: '#d7e6ff', atmosphereOpacity: 0.095, visualIntent: '深蓝冰巨星保持低反光，薄大气边缘增强球体深度。' },
    rotationSpeed: 0.48, inclination: 0.05, axialTilt: 28.32, startAngle: 0.05,
    diameter: '49,244 km', diameterKm: 49244, distance: '距太阳约 44.95 亿 km',
    dayLength: '约 16 小时', dayHours: 16.11, yearLength: '164.8 个地球年', yearDays: 60190,
    temperature: '云顶约 −200°C', gravityEarth: 1.14,
    description: '太阳系最外侧的行星，深蓝大气中存在极高速风暴。',
    observationCode: 'SOL-08 / POSEIDON',
    tags: ['冰巨行星', '超音速风暴', '外太阳系'],
    camera: { distance: 2.72, azimuth: -0.35, elevation: 0.3, horizontalOffset: -0.62, targetHeight: 0.07, duration: 2.05 },
  },
]

const MATERIAL_CALIBRATION: Partial<Record<CelestialBodyId, Partial<PlanetMaterialProfile>>> = {
  sun: { roughness: 0.72, emissiveIntensity: 0.2, colorTint: '#fff0d0' },
  mercury: { roughness: 0.99, emissiveIntensity: 0.001, colorTint: '#928778' },
  venus: { roughness: 0.99, emissiveIntensity: 0.002, colorTint: '#d19652', atmosphereOpacity: 0.105 },
  earth: { roughness: 0.78, emissiveIntensity: 0.0045, colorTint: '#f0f7ff', atmosphereOpacity: 0.115 },
  mars: { roughness: 0.96, emissiveIntensity: 0.002, colorTint: '#c89a84' },
  jupiter: { roughness: 0.995, emissiveIntensity: 0.0025, colorTint: '#f4dfbd', atmosphereOpacity: 0.045 },
  saturn: { roughness: 0.995, emissiveIntensity: 0.003, colorTint: '#ead39e', atmosphereOpacity: 0.035 },
  uranus: { roughness: 0.99, emissiveIntensity: 0.0015, colorTint: '#82bdb6', atmosphereOpacity: 0.08 },
  neptune: { roughness: 0.99, emissiveIntensity: 0.002, colorTint: '#9ebcf0', atmosphereOpacity: 0.096 },
}

SOLAR_BODIES.forEach((body) => {
  Object.assign(body.materialProfile, MATERIAL_CALIBRATION[body.id])
})

export const PLANETS = SOLAR_BODIES.filter((body) => body.id !== 'sun')

export function getCelestialBody(id: string | null) {
  return SOLAR_BODIES.find((body) => body.id === id) ?? null
}
