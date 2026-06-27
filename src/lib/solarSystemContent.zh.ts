import type { CelestialBodyId, ObservationRegionId } from './solarSystem'

export const SOLAR_SYSTEM_SOURCE_URLS = {
  nasaSolarSystem: 'https://science.nasa.gov/solar-system/',
  nasaPluto: 'https://science.nasa.gov/dwarf-planets/pluto/',
  nasaCeres: 'https://science.nasa.gov/dwarf-planets/ceres/facts/',
  usgsPluto: 'https://astrogeology.usgs.gov/search/map/pluto_new_horizons_lorri_mvic_global_mosaic_300m',
  usgsCharon: 'https://astrogeology.usgs.gov/search/map/charon_new_horizons_lorri_mvic_global_mosaic_300m',
  nasaAsteroids: 'https://science.nasa.gov/solar-system/asteroids/',
  nasaComets: 'https://science.nasa.gov/solar-system/comets/',
  solarSystemScopeTextures: 'https://www.solarsystemscope.com/textures/',
} as const

export const REGION_COPY: Record<ObservationRegionId, { nameZh: string; nameEn: string; description: string }> = {
  'solar-system': {
    nameZh: '太阳系主区',
    nameEn: 'SOLAR SYSTEM',
    description: '太阳、八大行星与现有天然卫星观测区。',
  },
  'outer-solar-system': {
    nameZh: '太阳系边缘',
    nameEn: 'OUTER SOLAR SYSTEM',
    description: '矮行星、小行星带与彗星等边缘小天体观测区。',
  },
}

export interface BodyLocalizedContent {
  nameZh: string
  nameEn: string
  typeZh: string
  typeEn: string
  diameter: string
  distance: string
  dayLength: string
  yearLength: string
  temperature: string
  description: string
  observationCode: string
  tags: string[]
  visualIntent: string
  facts: {
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
  asset: {
    texture?: string
    sourceName: string
    sourceUrl: string
    license: string
    purpose: string
    realObservation: boolean
    colorCalibrated: boolean
  }
}

const solarScopeAsset = (textureName: string, purpose: string) => ({
  texture: `textures/solar-system-scope/${textureName}`,
  sourceName: 'Solar System Scope texture package based on NASA imagery',
  sourceUrl: SOLAR_SYSTEM_SOURCE_URLS.solarSystemScopeTextures,
  license: 'Solar System Scope texture license; project keeps local attribution notes',
  purpose,
  realObservation: true,
  colorCalibrated: false,
})

export const BODY_COPY: Record<CelestialBodyId, BodyLocalizedContent> = {
  sun: {
    nameZh: '太阳', nameEn: 'SUN', typeZh: 'G 型主序星', typeEn: 'G-TYPE STAR',
    diameter: '1,392,700 km', distance: '太阳系中心', dayLength: '约 27 个地球日', yearLength: '—', temperature: '光球约 5,500°C',
    description: '太阳是太阳系唯一的恒星，提供光和热，并占据太阳系绝大多数质量。',
    observationCode: 'SOL-00 / G2V', tags: ['恒星', '光球层', '太阳系质量中心'],
    visualIntent: '保留恒星发光感，但限制曝光，避免表面炸白。',
    facts: {
      identity: '太阳是一颗 G 型主序星，是太阳系引力和能量的中心。',
      age: '约 46 亿年。',
      formation: '由原始太阳星云塌缩形成，行星和小天体在同一盘状物质中逐步形成。',
      discovery: '人类史前即已观测；现代太阳物理通过地面望远镜和空间探测器持续研究。',
      composition: '主要由氢和氦组成，核心核聚变产生能量。',
      surface: '可见光球存在颗粒结构、黑子和活动区。',
      missions: ['SOHO', 'SDO', 'Parker Solar Probe'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.nasaSolarSystem],
    },
    asset: solarScopeAsset('2k_sun.jpg', '太阳表面贴图'),
  },
  mercury: {
    nameZh: '水星', nameEn: 'MERCURY', typeZh: '岩石行星', typeEn: 'TERRESTRIAL',
    diameter: '4,879 km', distance: '距太阳约 5,790 万 km', dayLength: '约 59 个地球日', yearLength: '88 个地球日', temperature: '约 -180°C 至 430°C',
    description: '水星是最靠近太阳的行星，表面遍布撞击坑，昼夜温差极大。',
    observationCode: 'SOL-01 / HERMES', tags: ['岩石世界', '无天然卫星', '极端温差'],
    visualIntent: '灰褐岩质、低反光、撞击坑优先，避免月球式纯白。',
    facts: {
      identity: '水星是太阳系最内侧的岩石行星。',
      age: '约 45–46 亿年，与太阳系形成时期相近。',
      formation: '由内太阳系高温区域的岩石和金属物质聚合形成。',
      discovery: '肉眼可见，古代文明已记录；MESSENGER 任务完成了全球测绘。',
      composition: '拥有相对巨大的金属核心和薄弱外逸层。',
      surface: '表面类似撞击密集的岩石世界，有盆地、峭壁和大量陨石坑。',
      missions: ['Mariner 10', 'MESSENGER', 'BepiColombo'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.nasaSolarSystem],
    },
    asset: solarScopeAsset('2k_mercury.jpg', '水星表面贴图'),
  },
  venus: {
    nameZh: '金星', nameEn: 'VENUS', typeZh: '岩石行星', typeEn: 'TERRESTRIAL',
    diameter: '12,104 km', distance: '距太阳约 1.082 亿 km', dayLength: '约 243 个地球日', yearLength: '225 个地球日', temperature: '平均约 465°C',
    description: '金星被浓厚二氧化碳大气和硫酸云层包裹，是太阳系表面最热的行星。',
    observationCode: 'SOL-02 / APHRODITE', tags: ['浓密大气', '逆向自转', '温室效应'],
    visualIntent: '厚重大气云层包裹，低对比硫酸云带，避免普通黄球。',
    facts: {
      identity: '金星是大小接近地球的岩石行星，但环境极端。',
      age: '约 45–46 亿年。',
      formation: '在内太阳系岩石物质盘中形成，后续经历强烈大气演化。',
      discovery: '肉眼可见，古代称为晨星或昏星；多国探测器曾进入轨道或着陆。',
      composition: '岩石主体，浓厚二氧化碳大气，云层含硫酸液滴。',
      surface: '真实地表被云层遮蔽，雷达观测显示火山平原和高地。',
      missions: ['Venera', 'Magellan', 'Akatsuki'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.nasaSolarSystem],
    },
    asset: solarScopeAsset('2k_venus_atmosphere.jpg', '金星大气云层贴图'),
  },
  earth: {
    nameZh: '地球', nameEn: 'EARTH', typeZh: '海洋行星', typeEn: 'OCEAN WORLD',
    diameter: '12,742 km', distance: '距太阳约 1.496 亿 km', dayLength: '23 小时 56 分', yearLength: '365.25 天', temperature: '平均约 15°C',
    description: '地球是已知唯一存在生命的世界，液态海洋覆盖了大部分表面。',
    observationCode: 'SOL-03 / HOME', tags: ['液态海洋', '含氧大气', '生命信号'],
    visualIntent: '海陆纹理和云层分离，保留蓝色大气边缘。',
    facts: {
      identity: '地球是太阳系第三颗行星，也是目前唯一确认存在生命的天体。',
      age: '约 45.4 亿年。',
      formation: '由太阳星云中的岩石物质聚合形成，后续分异出核心、地幔和地壳。',
      discovery: '人类居住的母星；现代航天让人类首次从外部整体观测地球。',
      composition: '岩石主体，铁镍核心，表面有海洋、大陆和大气圈。',
      surface: '海洋、大陆、云层、冰盖和生物圈共同塑造可见外观。',
      missions: ['Landsat', 'Terra', 'Aqua', 'DSCOVR'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.nasaSolarSystem],
    },
    asset: solarScopeAsset('2k_earth_daymap.jpg', '地球白昼表面贴图'),
  },
  mars: {
    nameZh: '火星', nameEn: 'MARS', typeZh: '岩石行星', typeEn: 'TERRESTRIAL',
    diameter: '6,779 km', distance: '距太阳约 2.279 亿 km', dayLength: '24 小时 37 分', yearLength: '687 个地球日', temperature: '平均约 -63°C',
    description: '火星是寒冷而干燥的红色世界，保存着远古河流与湖泊的痕迹。',
    observationCode: 'SOL-04 / ARES', tags: ['氧化铁地表', '极冠', '远古水系'],
    visualIntent: '铁锈色地表保留暗区和极冠对比，降低橙色涂抹感。',
    facts: {
      identity: '火星是太阳系第四颗行星，也是探测最密集的外侧岩石行星。',
      age: '约 45–46 亿年。',
      formation: '由内太阳系岩石物质形成，早期可能拥有更厚大气和液态水环境。',
      discovery: '肉眼可见；现代火星轨道器、着陆器和巡视器持续研究其气候与地质。',
      composition: '岩石行星，地表富含氧化铁尘埃。',
      surface: '火山、峡谷、撞击坑、沙丘、极冠和干涸河谷并存。',
      missions: ['Viking', 'Mars Reconnaissance Orbiter', 'Curiosity', 'Perseverance'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.nasaSolarSystem],
    },
    asset: solarScopeAsset('2k_mars.jpg', '火星表面贴图'),
  },
  jupiter: {
    nameZh: '木星', nameEn: 'JUPITER', typeZh: '气态巨行星', typeEn: 'GAS GIANT',
    diameter: '139,820 km', distance: '距太阳约 7.785 亿 km', dayLength: '9 小时 56 分', yearLength: '11.86 个地球年', temperature: '云顶约 -110°C',
    description: '木星是太阳系最大的行星，快速自转形成明暗云带与巨型风暴。',
    observationCode: 'SOL-05 / ZEUS', tags: ['气态巨行星', '大红斑', '强磁层'],
    visualIntent: '横向云带和大红斑为主，低高光，避免奶油色贴纸球。',
    facts: {
      identity: '木星是气态巨行星，质量超过其他行星总和的两倍。',
      age: '约 45–46 亿年。',
      formation: '可能在早期太阳星云中迅速聚集气体，成为太阳系最大的行星。',
      discovery: '肉眼可见；伽利略在 1610 年发现其四颗大型卫星。',
      composition: '主要由氢和氦组成，内部可能存在高压金属氢层。',
      surface: '没有固体表面，可见外观是多层云带、风暴和大红斑。',
      missions: ['Pioneer', 'Voyager', 'Galileo', 'Juno'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.nasaSolarSystem],
    },
    asset: solarScopeAsset('2k_jupiter.jpg', '木星云带贴图'),
  },
  saturn: {
    nameZh: '土星', nameEn: 'SATURN', typeZh: '环状气态巨行星', typeEn: 'RINGED GIANT',
    diameter: '116,460 km', distance: '距太阳约 14.34 亿 km', dayLength: '约 10.7 小时', yearLength: '29.45 个地球年', temperature: '云顶约 -140°C',
    description: '土星拥有由冰和岩石碎片构成的明亮行星环，是太阳系最醒目的结构之一。',
    observationCode: 'SOL-06 / CRONUS', tags: ['行星环', '气态巨行星', '低密度'],
    visualIntent: '淡金色云带与环系统分层，暗面保留细节。',
    facts: {
      identity: '土星是太阳系第二大行星，以大型环系统著称。',
      age: '约 45–46 亿年。',
      formation: '在外太阳系由冰、岩石核和大量气体聚集形成。',
      discovery: '肉眼可见；伽利略首次用望远镜观察到异常形态，惠更斯确认环结构。',
      composition: '主要由氢和氦组成，环由大量冰质和岩石颗粒构成。',
      surface: '可见表面是云顶，环呈多层细带和缝隙。',
      missions: ['Pioneer 11', 'Voyager', 'Cassini-Huygens'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.nasaSolarSystem],
    },
    asset: solarScopeAsset('2k_saturn.jpg', '土星云带贴图'),
  },
  uranus: {
    nameZh: '天王星', nameEn: 'URANUS', typeZh: '冰巨星', typeEn: 'ICE GIANT',
    diameter: '50,724 km', distance: '距太阳约 28.71 亿 km', dayLength: '约 17 小时', yearLength: '84 个地球年', temperature: '云顶约 -195°C',
    description: '天王星是一颗冰巨星，自转轴几乎躺在轨道平面上，并拥有暗淡细环。',
    observationCode: 'SOL-07 / CAELUS', tags: ['冰巨星', '侧向自转', '甲烷大气'],
    visualIntent: '淡青绿冰巨星，低对比云带、暗淡环和侧向自转提示。',
    facts: {
      identity: '天王星是冰巨星，含有大量水、氨、甲烷等挥发物组分。',
      age: '约 45–46 亿年。',
      formation: '在外太阳系形成，后续可能因巨大撞击导致极端轴倾角。',
      discovery: '1781 年由威廉·赫歇尔确认，是首颗用望远镜发现的行星。',
      composition: '氢、氦和甲烷大气，下方为富含冰质挥发物的内部结构。',
      surface: '没有固体表面，可见外观来自甲烷吸收红光后的蓝绿色大气。',
      missions: ['Voyager 2'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.nasaSolarSystem],
    },
    asset: solarScopeAsset('2k_uranus.jpg', '天王星大气贴图'),
  },
  neptune: {
    nameZh: '海王星', nameEn: 'NEPTUNE', typeZh: '冰巨星', typeEn: 'ICE GIANT',
    diameter: '49,244 km', distance: '距太阳约 44.95 亿 km', dayLength: '约 16 小时', yearLength: '164.8 个地球年', temperature: '云顶约 -200°C',
    description: '海王星是太阳系最外侧的行星，深蓝大气中存在极高速风暴。',
    observationCode: 'SOL-08 / POSEIDON', tags: ['冰巨星', '超音速风暴', '外太阳系'],
    visualIntent: '深蓝冰巨星，低对比风暴暗斑和白色高速云痕。',
    facts: {
      identity: '海王星是太阳系第八颗行星，也是最外侧的正式行星。',
      age: '约 45–46 亿年。',
      formation: '在外太阳系形成，可能经历过轨道迁移。',
      discovery: '1846 年通过数学预测后被观测确认。',
      composition: '氢、氦、甲烷大气和富含冰质挥发物的内部。',
      surface: '没有固体表面，可见外观为深蓝大气、风暴暗斑和高速云痕。',
      missions: ['Voyager 2'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.nasaSolarSystem],
    },
    asset: solarScopeAsset('2k_neptune.jpg', '海王星大气贴图'),
  },
  pluto: {
    nameZh: '冥王星', nameEn: 'PLUTO', typeZh: '矮行星', typeEn: 'DWARF PLANET',
    diameter: '2,377 km', distance: '平均距太阳约 59 亿 km', dayLength: '约 6.4 个地球日', yearLength: '248 个地球年', temperature: '约 -230°C',
    description: '冥王星是柯伊伯带中的矮行星，表面有氮冰、甲烷冰和暗红褐色地貌。',
    observationCode: 'EDGE-01 / NEW HORIZONS', tags: ['矮行星', '氮冰平原', '柯伊伯带'],
    visualIntent: '使用 USGS / New Horizons 全球拼接图，保留冷色冰质和暗红褐地貌差异。',
    facts: {
      identity: '冥王星是柯伊伯带矮行星，曾被归类为第九大行星。',
      age: '约 45–46 亿年，与外太阳系小天体形成时期相近。',
      formation: '可能由外太阳系冰质和岩石物质聚合形成，是早期太阳系遗存的一部分。',
      discovery: '1930 年由克莱德·汤博发现；2006 年被国际天文学联合会重新分类为矮行星。',
      composition: '岩石和冰混合体，表面含氮冰、甲烷冰、一氧化碳冰和托林类暗色物质。',
      surface: '新视野号显示其有明亮心形区域、冰川平原、山脉和暗红褐地貌。',
      missions: ['New Horizons'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.nasaPluto, SOLAR_SYSTEM_SOURCE_URLS.usgsPluto],
    },
    asset: {
      texture: 'textures/outer-system/pluto-usgs-new-horizons-1024.jpg',
      sourceName: 'USGS Astrogeology / NASA New Horizons Pluto Global Mosaic',
      sourceUrl: SOLAR_SYSTEM_SOURCE_URLS.usgsPluto,
      license: 'USGS page lists Access Constraints: None; Use Constraints: cite authors.',
      purpose: '冥王星全球表面贴图',
      realObservation: true,
      colorCalibrated: true,
    },
  },
  charon: {
    nameZh: '卡戎', nameEn: 'CHARON', typeZh: '冥王星大型卫星', typeEn: 'PLUTO MOON',
    diameter: '1,212 km', distance: '距冥王星约 19,600 km', dayLength: '约 6.4 个地球日', yearLength: '随冥王星绕日约 248 年', temperature: '约 -220°C',
    description: '卡戎是冥王星最大的卫星，与冥王星形成近似双天体系统。',
    observationCode: 'EDGE-02 / CHARON', tags: ['大型卫星', '冰岩表面', '暗红极区'],
    visualIntent: '使用 USGS / New Horizons 全球拼接图，突出灰色冰岩和暗红极区。',
    facts: {
      identity: '卡戎是冥王星最大的天然卫星，尺寸相对冥王星很大。',
      age: '约 45–46 亿年，可能与冥王星系统早期碰撞形成有关。',
      formation: '主流假说认为冥王星与另一柯伊伯带天体发生巨大碰撞后形成卡戎。',
      discovery: '1978 年由詹姆斯·克里斯蒂发现。',
      composition: '冰和岩石混合体，表面以水冰为主，并有暗红极区沉积物。',
      surface: '新视野号显示其有峡谷、断裂和暗色北极区域。',
      missions: ['New Horizons'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.usgsCharon, SOLAR_SYSTEM_SOURCE_URLS.nasaPluto],
    },
    asset: {
      texture: 'textures/outer-system/charon-usgs-new-horizons-1024.jpg',
      sourceName: 'USGS Astrogeology / NASA New Horizons Charon Global Mosaic',
      sourceUrl: SOLAR_SYSTEM_SOURCE_URLS.usgsCharon,
      license: 'USGS page lists Access Constraints: None; Use Constraints: cite authors.',
      purpose: '卡戎全球表面贴图',
      realObservation: true,
      colorCalibrated: true,
    },
  },
  ceres: {
    nameZh: '谷神星', nameEn: 'CERES', typeZh: '矮行星', typeEn: 'DWARF PLANET',
    diameter: '940 km', distance: '位于火星与木星之间的小行星带', dayLength: '约 9 小时', yearLength: '约 4.6 个地球年', temperature: '约 -105°C',
    description: '谷神星是小行星带中最大的天体，也被归类为矮行星。',
    observationCode: 'EDGE-03 / DAWN', tags: ['矮行星', '小行星带', '亮斑盐沉积'],
    visualIntent: '灰暗冰岩质、坑洼表面和克制亮斑；当前为 NASA Dawn 资料约束的程序可视化。',
    facts: {
      identity: '谷神星是小行星带最大天体，也是内太阳系唯一的矮行星。',
      age: '约 45–46 亿年。',
      formation: '在火星和木星之间的原行星物质中形成，未能继续成长为大行星。',
      discovery: '1801 年由朱塞佩·皮亚齐发现，是人类发现的第一颗小行星带天体。',
      composition: '岩石和冰混合体，可能含有水合矿物、盐类和地下冰。',
      surface: 'Dawn 任务观测到陨石坑、山体和 Occator 陨石坑中的明亮盐沉积。',
      missions: ['Dawn'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.nasaCeres],
      visualizationNote: '当前未接入真实全球贴图，使用基于 Dawn 观测描述的程序 fallback。找到可靠可分发全球贴图前不伪装为真实贴图。',
    },
    asset: {
      sourceName: 'NASA Ceres facts and Dawn mission descriptions',
      sourceUrl: SOLAR_SYSTEM_SOURCE_URLS.nasaCeres,
      license: 'NASA public information; no local texture file used',
      purpose: '谷神星程序可视化参考',
      realObservation: false,
      colorCalibrated: false,
    },
  },
  'asteroid-belt': {
    nameZh: '小行星带代表体', nameEn: 'ASTEROID BELT', typeZh: '小天体群', typeEn: 'SMALL BODY FIELD',
    diameter: '代表体非单一天体', distance: '主要位于火星与木星轨道之间', dayLength: '各天体差异较大', yearLength: '约 3–6 个地球年量级', temperature: '随距离和材质变化',
    description: '小行星带由大量岩石和金属质小天体组成，是早期太阳系物质的遗存。',
    observationCode: 'EDGE-04 / MAIN BELT', tags: ['小天体群', '不规则轮廓', '早期太阳系遗存'],
    visualIntent: '暗淡粗糙、非完全球体、低反光；代表小行星群而非具体单一天体。',
    facts: {
      identity: '小行星带是火星和木星之间的小天体群，不是一颗单独星球。',
      age: '多数小行星是约 45–46 亿年前太阳系形成时期的遗存。',
      formation: '受木星引力扰动影响，该区域物质未能聚合成完整行星。',
      discovery: '1801 年发现谷神星后，人类陆续确认大量小行星带成员。',
      composition: '主要包括岩石质、碳质和金属质小天体。',
      surface: '通常不规则、坑洼、暗淡且低反光。',
      missions: ['Dawn', 'Lucy', 'Psyche'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.nasaAsteroids],
      visualizationNote: '当前为代表性可视化，不对应单一真实小行星贴图。',
    },
    asset: {
      sourceName: 'NASA Asteroids overview',
      sourceUrl: SOLAR_SYSTEM_SOURCE_URLS.nasaAsteroids,
      license: 'NASA public information; no local texture file used',
      purpose: '小行星带代表体程序可视化参考',
      realObservation: false,
      colorCalibrated: false,
    },
  },
  comet: {
    nameZh: '彗星代表体', nameEn: 'COMET', typeZh: '彗星', typeEn: 'COMET',
    diameter: '代表彗核约数 km 至数十 km', distance: '轨道可从外太阳系进入内太阳系', dayLength: '各彗星差异很大', yearLength: '从数年到数千年不等', temperature: '随近日距离剧烈变化',
    description: '彗星由冰、尘埃和岩石混合物组成，靠近太阳时会形成彗发和彗尾。',
    observationCode: 'EDGE-05 / COMA', tags: ['暗色彗核', '尘埃尾', '挥发性冰'],
    visualIntent: '暗色不规则彗核，克制尘埃尾和气体尾，避免魔法特效。',
    facts: {
      identity: '彗星是富含冰和尘埃的小天体，接近太阳时挥发形成彗发和彗尾。',
      age: '许多彗星保留约 45–46 亿年前早期太阳系的原始物质。',
      formation: '形成于太阳系寒冷外侧区域，部分来自柯伊伯带或奥尔特云。',
      discovery: '明亮彗星自古被记录；现代任务近距离探测过多颗彗星。',
      composition: '水冰、二氧化碳冰、一氧化碳冰、尘埃、有机物和岩石颗粒。',
      surface: '彗核通常非常暗、不规则，局部活动区会喷出气体和尘埃。',
      missions: ['Giotto', 'Stardust', 'Deep Impact', 'Rosetta'],
      sourceLinks: [SOLAR_SYSTEM_SOURCE_URLS.nasaComets],
      visualizationNote: '当前为代表性可视化，不对应单一真实彗星贴图。',
    },
    asset: {
      sourceName: 'NASA Comets overview',
      sourceUrl: SOLAR_SYSTEM_SOURCE_URLS.nasaComets,
      license: 'NASA public information; no local texture file used',
      purpose: '彗星代表体程序可视化参考',
      realObservation: false,
      colorCalibrated: false,
    },
  },
}
