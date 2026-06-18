export interface CelestialBody {
  id: string
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
  startAngle: number
  diameter: string
  distance: string
  dayLength: string
  yearLength: string
  temperature: string
  description: string
  hasRings?: boolean
}

export const SOLAR_BODIES: CelestialBody[] = [
  {
    id: 'sun', nameZh: '太阳', nameEn: 'SUN', typeZh: '黄矮星', typeEn: 'G-TYPE STAR',
    baseColor: '#ffad38', accentColor: '#fff0b0', radius: 1.55, orbitRadius: 0, orbitSpeed: 0,
    rotationSpeed: 0.08, inclination: 0, startAngle: 0, diameter: '1,392,700 km', distance: '系统中心',
    dayLength: '约 27 个地球日', yearLength: '—', temperature: '表面约 5,500°C',
    description: '太阳系唯一的恒星，为八大行星提供光与热。',
  },
  {
    id: 'mercury', nameZh: '水星', nameEn: 'MERCURY', typeZh: '岩石行星', typeEn: 'TERRESTRIAL',
    baseColor: '#8f8a82', accentColor: '#d5cec2', radius: 0.24, orbitRadius: 2.5, orbitSpeed: 1.6,
    rotationSpeed: 0.05, inclination: 0.12, startAngle: 0.4, diameter: '4,879 km', distance: '距太阳约 5,790 万 km',
    dayLength: '约 59 个地球日', yearLength: '88 个地球日', temperature: '−180°C 至 430°C',
    description: '最靠近太阳的行星，表面遍布撞击坑，昼夜温差极大。',
  },
  {
    id: 'venus', nameZh: '金星', nameEn: 'VENUS', typeZh: '岩石行星', typeEn: 'TERRESTRIAL',
    baseColor: '#c88f4e', accentColor: '#f0d2a4', radius: 0.39, orbitRadius: 3.45, orbitSpeed: 1.18,
    rotationSpeed: -0.018, inclination: 0.06, startAngle: 2.1, diameter: '12,104 km', distance: '距太阳约 1.082 亿 km',
    dayLength: '约 243 个地球日', yearLength: '225 个地球日', temperature: '平均约 465°C',
    description: '被浓厚二氧化碳大气包裹，是太阳系表面最热的行星。',
  },
  {
    id: 'earth', nameZh: '地球', nameEn: 'EARTH', typeZh: '海洋行星', typeEn: 'OCEAN WORLD',
    baseColor: '#2c6a9d', accentColor: '#77ad7a', radius: 0.42, orbitRadius: 4.55, orbitSpeed: 1,
    rotationSpeed: 0.42, inclination: 0.02, startAngle: 3.25, diameter: '12,742 km', distance: '距太阳约 1.496 亿 km',
    dayLength: '23 小时 56 分', yearLength: '365.25 天', temperature: '平均约 15°C',
    description: '已知唯一拥有生命的世界，液态海洋覆盖了大部分表面。',
  },
  {
    id: 'mars', nameZh: '火星', nameEn: 'MARS', typeZh: '岩石行星', typeEn: 'TERRESTRIAL',
    baseColor: '#9c4028', accentColor: '#d8845e', radius: 0.31, orbitRadius: 5.75, orbitSpeed: 0.81,
    rotationSpeed: 0.4, inclination: 0.04, startAngle: 5.1, diameter: '6,779 km', distance: '距太阳约 2.279 亿 km',
    dayLength: '24 小时 37 分', yearLength: '687 个地球日', temperature: '平均约 −63°C',
    description: '寒冷而干燥的红色世界，保存着远古河流与湖泊的痕迹。',
  },
  {
    id: 'jupiter', nameZh: '木星', nameEn: 'JUPITER', typeZh: '气态巨行星', typeEn: 'GAS GIANT',
    baseColor: '#b88967', accentColor: '#ead1ac', radius: 0.9, orbitRadius: 7.65, orbitSpeed: 0.44,
    rotationSpeed: 0.75, inclination: 0.025, startAngle: 1.15, diameter: '139,820 km', distance: '距太阳约 7.785 亿 km',
    dayLength: '9 小时 56 分', yearLength: '11.86 个地球年', temperature: '云顶约 −110°C',
    description: '太阳系最大的行星，快速旋转形成明暗云带与巨型风暴。',
  },
  {
    id: 'saturn', nameZh: '土星', nameEn: 'SATURN', typeZh: '气态巨行星', typeEn: 'RINGED GIANT',
    baseColor: '#c5a66d', accentColor: '#f1dfb2', radius: 0.78, orbitRadius: 9.65, orbitSpeed: 0.32,
    rotationSpeed: 0.68, inclination: 0.045, startAngle: 4.35, diameter: '116,460 km', distance: '距太阳约 14.34 亿 km',
    dayLength: '约 10.7 小时', yearLength: '29.45 个地球年', temperature: '云顶约 −140°C',
    description: '由冰与岩石碎片构成的明亮行星环，是太阳系最醒目的结构之一。', hasRings: true,
  },
  {
    id: 'uranus', nameZh: '天王星', nameEn: 'URANUS', typeZh: '冰巨行星', typeEn: 'ICE GIANT',
    baseColor: '#77b6bd', accentColor: '#bce8e4', radius: 0.57, orbitRadius: 11.4, orbitSpeed: 0.23,
    rotationSpeed: -0.5, inclination: 0.03, startAngle: 2.75, diameter: '50,724 km', distance: '距太阳约 28.71 亿 km',
    dayLength: '约 17 小时', yearLength: '84 个地球年', temperature: '云顶约 −195°C',
    description: '自转轴几乎躺在轨道平面上，像侧卧一样围绕太阳运行。',
  },
  {
    id: 'neptune', nameZh: '海王星', nameEn: 'NEPTUNE', typeZh: '冰巨行星', typeEn: 'ICE GIANT',
    baseColor: '#315da8', accentColor: '#79a5f0', radius: 0.55, orbitRadius: 13.05, orbitSpeed: 0.18,
    rotationSpeed: 0.48, inclination: 0.05, startAngle: 0.05, diameter: '49,244 km', distance: '距太阳约 44.95 亿 km',
    dayLength: '约 16 小时', yearLength: '164.8 个地球年', temperature: '云顶约 −200°C',
    description: '太阳系最外侧的行星，深蓝大气中存在极高速风暴。',
  },
]

export const PLANETS = SOLAR_BODIES.filter((body) => body.id !== 'sun')

export function getCelestialBody(id: string | null) {
  return SOLAR_BODIES.find((body) => body.id === id) ?? null
}
