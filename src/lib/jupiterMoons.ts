export type JupiterMoonId = 'io' | 'europa' | 'ganymede' | 'callisto'

export interface JupiterMoon {
  id: JupiterMoonId
  nameZh: string
  nameEn: string
  diameter: string
  distance: string
  description: string
  texture: string
  orbitRadius: number
  orbitSpeed: number
  radius: number
  startAngle: number
}

export const JUPITER_MOONS: JupiterMoon[] = [
  {
    id: 'io', nameZh: '木卫一', nameEn: 'IO', diameter: '3,643 km', distance: '距木星 421,700 km',
    description: '太阳系火山活动最剧烈的天体，硫质地表持续被重塑。', texture: 'io.jpg',
    orbitRadius: 1.65, orbitSpeed: 1.55, radius: 0.115, startAngle: 0.2,
  },
  {
    id: 'europa', nameZh: '木卫二', nameEn: 'EUROPA', diameter: '3,122 km', distance: '距木星 671,100 km',
    description: '冰壳下方可能存在全球性液态海洋，是重要的生命候选世界。', texture: 'europa.png',
    orbitRadius: 2.15, orbitSpeed: 1.08, radius: 0.105, startAngle: 2.1,
  },
  {
    id: 'ganymede', nameZh: '木卫三', nameEn: 'GANYMEDE', diameter: '5,268 km', distance: '距木星 1,070,400 km',
    description: '太阳系最大的卫星，也是已知唯一拥有自身磁场的卫星。', texture: 'ganymede.png',
    orbitRadius: 2.75, orbitSpeed: 0.72, radius: 0.14, startAngle: 4.25,
  },
  {
    id: 'callisto', nameZh: '木卫四', nameEn: 'CALLISTO', diameter: '4,821 km', distance: '距木星 1,882,700 km',
    description: '古老表面密布撞击坑，保存了早期太阳系的演化记录。', texture: 'callisto.png',
    orbitRadius: 3.45, orbitSpeed: 0.52, radius: 0.13, startAngle: 5.45,
  },
]

export function getJupiterMoon(id: JupiterMoonId | null) {
  return JUPITER_MOONS.find((moon) => moon.id === id) ?? null
}
