import type { CelestialBody, CelestialBodyId } from './solarSystem'

export type ParentBodyId = Extract<CelestialBodyId, 'earth' | 'mars' | 'jupiter' | 'saturn' | 'neptune'>
export type SatelliteId =
  | 'moon'
  | 'phobos'
  | 'deimos'
  | 'io'
  | 'europa'
  | 'ganymede'
  | 'callisto'
  | 'titan'
  | 'enceladus'
  | 'triton'
export type SatellitePhenomenon = 'earthshine' | 'irregular' | 'volcanic' | 'ice' | 'haze' | 'plume' | 'frost'
export type ScaleMode = 'display' | 'real'

export interface SatelliteCameraPreset {
  distance: number
  azimuth: number
  elevation: number
  duration: number
}

export interface Satellite {
  id: SatelliteId
  parentId: ParentBodyId
  nameZh: string
  nameEn: string
  diameter: string
  diameterKm: number
  orbitalDistance: string
  orbitalDistanceKm: number
  description: string
  phenomenonLabel: string
  phenomenonDescription: string
  phenomenon: SatellitePhenomenon
  texture?: string
  color: number
  displayOrbitRadius: number
  displayRadius: number
  orbitSpeed: number
  startAngle: number
  inclination: number
  retrograde?: boolean
  camera: SatelliteCameraPreset
}

export interface SatelliteSceneScale {
  orbitRadius: number
  radius: number
}

export const SATELLITES: Satellite[] = [
  {
    id: 'moon', parentId: 'earth', nameZh: '月球', nameEn: 'MOON', diameter: '3,475 km', diameterKm: 3474.8,
    orbitalDistance: '距地球 384,400 km', orbitalDistanceKm: 384400,
    description: '地球唯一的天然卫星，潮汐锁定让它始终以近乎同一面朝向地球。',
    phenomenonLabel: '地球反照光',
    phenomenonDescription: '近景暗面保留一层冷蓝反照光，并以增强的昼夜分界线突出月面起伏。',
    phenomenon: 'earthshine', texture: 'satellites/moon.jpg', color: 0xc8c5bd,
    displayOrbitRadius: 1.62, displayRadius: 0.14, orbitSpeed: 1.08, startAngle: 0.7, inclination: 0.09,
    camera: { distance: 0.82, azimuth: 0.42, elevation: 0.2, duration: 1.35 },
  },
  {
    id: 'phobos', parentId: 'mars', nameZh: '火卫一', nameEn: 'PHOBOS', diameter: '22.5 km', diameterKm: 22.5,
    orbitalDistance: '距火星 9,376 km', orbitalDistanceKm: 9376,
    description: '一颗低轨道、不规则的小卫星，正在缓慢向火星靠近。',
    phenomenonLabel: '碎岩轮廓',
    phenomenonDescription: '非球形低多边形表面与缓慢翻滚强调它被撞击塑造的破碎轮廓。',
    phenomenon: 'irregular', texture: 'satellites/phobos.jpg', color: 0xb3aaa0,
    displayOrbitRadius: 1.05, displayRadius: 0.105, orbitSpeed: 1.8, startAngle: 1.4, inclination: 0.04,
    camera: { distance: 0.62, azimuth: -0.35, elevation: 0.24, duration: 1.15 },
  },
  {
    id: 'deimos', parentId: 'mars', nameZh: '火卫二', nameEn: 'DEIMOS', diameter: '12.4 km', diameterKm: 12.4,
    orbitalDistance: '距火星 23,463 km', orbitalDistanceKm: 23463,
    description: '火星外侧的小卫星，表面松散的风化层让轮廓比火卫一更平缓。',
    phenomenonLabel: '低重力漂移',
    phenomenonDescription: '较慢的轨道运动、柔和边缘光和轻微轴向摆动表现低重力小天体。',
    phenomenon: 'irregular', texture: 'satellites/deimos.jpg', color: 0xaaa49b,
    displayOrbitRadius: 1.52, displayRadius: 0.085, orbitSpeed: 1.12, startAngle: 4.1, inclination: 0.06,
    camera: { distance: 0.58, azimuth: 0.55, elevation: 0.18, duration: 1.15 },
  },
  {
    id: 'io', parentId: 'jupiter', nameZh: '木卫一', nameEn: 'IO', diameter: '3,643 km', diameterKm: 3643.2,
    orbitalDistance: '距木星 421,700 km', orbitalDistanceKm: 421700,
    description: '太阳系火山活动最剧烈的天体，硫质地表持续被重塑。',
    phenomenonLabel: '火山辉光',
    phenomenonDescription: '一层克制的橙色脉冲从向光侧溢出，提示持续活跃的火山世界。',
    phenomenon: 'volcanic', texture: 'moons/io.jpg', color: 0xe2b759,
    displayOrbitRadius: 1.65, displayRadius: 0.115, orbitSpeed: 1.55, startAngle: 0.2, inclination: 0.03,
    camera: { distance: 0.78, azimuth: 0.48, elevation: 0.2, duration: 1.3 },
  },
  {
    id: 'europa', parentId: 'jupiter', nameZh: '欧罗巴', nameEn: 'EUROPA', diameter: '3,122 km', diameterKm: 3121.6,
    orbitalDistance: '距木星 671,100 km', orbitalDistanceKm: 671100,
    description: '冰壳下方可能存在全球性液态海洋，是重要的生命候选世界。',
    phenomenonLabel: '冰壳高光',
    phenomenonDescription: '清澈般的窄幅高光掠过冰面，强化裂纹覆盖的光滑冰壳。',
    phenomenon: 'ice', texture: 'moons/europa.png', color: 0xd9cdb6,
    displayOrbitRadius: 2.15, displayRadius: 0.105, orbitSpeed: 1.08, startAngle: 2.1, inclination: 0.05,
    camera: { distance: 0.76, azimuth: -0.38, elevation: 0.24, duration: 1.3 },
  },
  {
    id: 'ganymede', parentId: 'jupiter', nameZh: '木卫三', nameEn: 'GANYMEDE', diameter: '5,268 km', diameterKm: 5268.2,
    orbitalDistance: '距木星 1,070,400 km', orbitalDistanceKm: 1070400,
    description: '太阳系最大的卫星，也是已知少数拥有自身磁场的卫星之一。',
    phenomenonLabel: '磁层边缘',
    phenomenonDescription: '非常微弱的青色边缘层提示这颗卫星拥有独立磁场，而不遮盖真实表面。',
    phenomenon: 'ice', texture: 'moons/ganymede.png', color: 0xaaa08e,
    displayOrbitRadius: 2.75, displayRadius: 0.14, orbitSpeed: 0.72, startAngle: 4.25, inclination: 0.02,
    camera: { distance: 0.88, azimuth: 0.32, elevation: 0.18, duration: 1.4 },
  },
  {
    id: 'callisto', parentId: 'jupiter', nameZh: '木卫四', nameEn: 'CALLISTO', diameter: '4,821 km', diameterKm: 4820.6,
    orbitalDistance: '距木星 1,882,700 km', orbitalDistanceKm: 1882700,
    description: '古老表面密布撞击坑，保存了早期太阳系的演化记录。',
    phenomenonLabel: '古老撞击面',
    phenomenonDescription: '高粗糙度材质保留暗部层次，让密集撞击结构在掠射光下更易辨认。',
    phenomenon: 'frost', texture: 'moons/callisto.png', color: 0x766d62,
    displayOrbitRadius: 3.45, displayRadius: 0.13, orbitSpeed: 0.52, startAngle: 5.45, inclination: 0.04,
    camera: { distance: 0.84, azimuth: -0.46, elevation: 0.16, duration: 1.4 },
  },
  {
    id: 'titan', parentId: 'saturn', nameZh: '泰坦', nameEn: 'TITAN', diameter: '5,150 km', diameterKm: 5149.5,
    orbitalDistance: '距土星 1,221,870 km', orbitalDistanceKm: 1221870,
    description: '拥有浓厚氮气大气与液态甲烷湖泊，是一颗被橙色雾霾包裹的世界。',
    phenomenonLabel: '甲烷雾霾',
    phenomenonDescription: '双层橙金色大气壳随视角形成柔和轮廓，表面只在近景中若隐若现。',
    phenomenon: 'haze', texture: 'satellites/titan.png', color: 0xc98742,
    displayOrbitRadius: 2.25, displayRadius: 0.145, orbitSpeed: 0.74, startAngle: 2.7, inclination: 0.06,
    camera: { distance: 0.9, azimuth: 0.4, elevation: 0.22, duration: 1.45 },
  },
  {
    id: 'enceladus', parentId: 'saturn', nameZh: '土卫二', nameEn: 'ENCELADUS', diameter: '504 km', diameterKm: 504.2,
    orbitalDistance: '距土星 237,948 km', orbitalDistanceKm: 237948,
    description: '冰壳南极喷出水汽与冰粒，持续为土星 E 环补充物质。',
    phenomenonLabel: '南极喷流',
    phenomenonDescription: '从南极区域释放的低密度冰晶粒子形成短促扇形喷流，并在减少动态效果时静止。',
    phenomenon: 'plume', texture: 'satellites/enceladus.jpg', color: 0xd9ecf2,
    displayOrbitRadius: 1.55, displayRadius: 0.085, orbitSpeed: 1.42, startAngle: 5.2, inclination: 0.02,
    camera: { distance: 0.64, azimuth: -0.42, elevation: 0.26, duration: 1.25 },
  },
  {
    id: 'triton', parentId: 'neptune', nameZh: '海卫一', nameEn: 'TRITON', diameter: '2,707 km', diameterKm: 2706.8,
    orbitalDistance: '距海王星 354,759 km', orbitalDistanceKm: 354759,
    description: '一颗逆行的大型冰卫星，可能是被海王星捕获的柯伊伯带天体。',
    phenomenonLabel: '逆行冰霜',
    phenomenonDescription: '淡粉与冷蓝冰面沿反方向运行，轨道刻度明确标出 RETROGRADE 逆行状态。',
    phenomenon: 'frost', texture: 'satellites/triton.jpg', color: 0xf0d4de,
    displayOrbitRadius: 1.82, displayRadius: 0.12, orbitSpeed: 0.92, startAngle: 3.5, inclination: 0.18, retrograde: true,
    camera: { distance: 0.74, azimuth: 0.5, elevation: 0.2, duration: 1.35 },
  },
]

const SATELLITE_BY_ID = new Map(SATELLITES.map((satellite) => [satellite.id, satellite]))

export function getSatellite(id: SatelliteId | null) {
  return id ? SATELLITE_BY_ID.get(id) ?? null : null
}

export function getSatellitesForParent(parentId: CelestialBodyId) {
  return SATELLITES.filter((satellite) => satellite.parentId === parentId)
}

export function hasSatelliteSystem(parentId: CelestialBodyId): parentId is ParentBodyId {
  return SATELLITES.some((satellite) => satellite.parentId === parentId)
}

export function getSatelliteSceneScale(satellite: Satellite, parent: CelestialBody, mode: ScaleMode): SatelliteSceneScale {
  if (mode === 'display') {
    return { orbitRadius: satellite.displayOrbitRadius, radius: satellite.displayRadius }
  }

  const parentPhysicalRadius = parent.diameterKm / 2
  return {
    orbitRadius: parent.radius * (satellite.orbitalDistanceKm / parentPhysicalRadius),
    radius: parent.radius * (satellite.diameterKm / parent.diameterKm),
  }
}
