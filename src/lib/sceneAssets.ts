import * as THREE from 'three'
import type { CelestialBodyId } from './solarSystem'
import type { SatelliteMaterialPreset } from './satelliteMaterials'

function clampColor(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

export function seededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value = Math.imul(1664525, value) + 1013904223
    return (value >>> 0) / 4294967296
  }
}

export function createGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(128, 128, 5, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(255, 248, 196, 1)')
  gradient.addColorStop(0.18, 'rgba(255, 177, 52, .75)')
  gradient.addColorStop(0.5, 'rgba(255, 113, 24, .2)')
  gradient.addColorStop(1, 'rgba(255, 80, 10, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(canvas)
}

export function createTritonFrostTexture(source: THREE.Texture) {
  const image = source.image as CanvasImageSource & { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
  const width = image.naturalWidth ?? image.width ?? 512
  const height = image.naturalHeight ?? image.height ?? 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')!
  context.drawImage(image, 0, 0, width, height)

  const imageData = context.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index]
    const green = data[index + 1]
    const blue = data[index + 2]
    const luminance = red * 0.28 + green * 0.48 + blue * 0.24
    const noDataRegion = red < 18 && green < 18 && blue < 18
    if (noDataRegion) {
      const pixel = index / 4
      const x = pixel % width
      const y = Math.floor(pixel / width)
      const grain = Math.sin(x * 0.045 + y * 0.09) * 12 + Math.sin(x * 0.13) * 5
      const frost = 118 + grain + Math.max(0, 58 - (y / height) * 84)
      data[index] = clampColor(frost * 0.82)
      data[index + 1] = clampColor(frost * 0.96)
      data[index + 2] = clampColor(frost * 1.08)
      continue
    }
    const contrast = (luminance - 118) * 1.12 + 135
    const warmRegion = red > green + 10 && green > blue + 8
    const darkBand = luminance < 92

    data[index] = clampColor(contrast * (warmRegion ? 0.98 : 0.86) + (warmRegion ? 34 : 22))
    data[index + 1] = clampColor(contrast * (darkBand ? 0.78 : 0.98) + (warmRegion ? 18 : 34))
    data[index + 2] = clampColor(contrast * (darkBand ? 0.92 : 1.18) + (warmRegion ? 42 : 56))
  }
  context.putImageData(imageData, 0, 0)

  context.globalCompositeOperation = 'soft-light'
  context.fillStyle = 'rgba(128, 190, 220, 0.22)'
  context.fillRect(0, 0, width, height)
  context.globalCompositeOperation = 'source-over'

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = source.anisotropy
  texture.wrapS = source.wrapS
  texture.wrapT = source.wrapT
  texture.minFilter = source.minFilter
  texture.magFilter = source.magFilter
  texture.generateMipmaps = true
  return texture
}

function drawCraters(
  context: CanvasRenderingContext2D,
  random: () => number,
  count: number,
  options: { dark: string; light: string; maxRadius: number },
) {
  for (let index = 0; index < count; index += 1) {
    const x = random() * context.canvas.width
    const y = random() * context.canvas.height
    const radius = 2 + random() * options.maxRadius
    context.globalAlpha = 0.12 + random() * 0.18
    context.fillStyle = options.dark
    context.beginPath()
    context.ellipse(x, y, radius * (1.1 + random() * 0.45), radius * (0.7 + random() * 0.35), random() * Math.PI, 0, Math.PI * 2)
    context.fill()
    context.globalAlpha = 0.08
    context.strokeStyle = options.light
    context.lineWidth = 1
    context.stroke()
  }
  context.globalAlpha = 1
}

function drawCloudBands(context: CanvasRenderingContext2D, random: () => number, colors: string[], opacity = 0.42) {
  const { width, height } = context.canvas
  context.globalAlpha = opacity
  for (let band = 0; band < 16; band += 1) {
    const y = (band / 16) * height + (random() - 0.5) * 10
    context.strokeStyle = colors[band % colors.length]
    context.lineWidth = 5 + random() * 13
    context.beginPath()
    for (let x = -20; x <= width + 20; x += 28) {
      const wave = Math.sin(x * 0.018 + band * 1.7) * (5 + random() * 4)
      if (x === -20) context.moveTo(x, y + wave)
      else context.lineTo(x, y + wave)
    }
    context.stroke()
  }
  context.globalAlpha = 1
}

export function createPlanetFallbackTexture(bodyId: CelestialBodyId) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const context = canvas.getContext('2d')!
  const random = seededRandom([...bodyId].reduce((value, letter) => value + letter.charCodeAt(0), 2026))
  const gradient = context.createLinearGradient(0, 0, 512, 256)

  if (bodyId === 'sun') {
    gradient.addColorStop(0, '#a93c10')
    gradient.addColorStop(0.45, '#e98022')
    gradient.addColorStop(1, '#ffbf58')
    context.fillStyle = gradient
    context.fillRect(0, 0, 512, 256)
    drawCloudBands(context, random, ['rgba(255,230,120,.36)', 'rgba(110,35,8,.2)', 'rgba(255,160,40,.25)'], 0.58)
  } else if (bodyId === 'mercury') {
    gradient.addColorStop(0, '#4b4741')
    gradient.addColorStop(0.52, '#756f65')
    gradient.addColorStop(1, '#9a8f7f')
    context.fillStyle = gradient
    context.fillRect(0, 0, 512, 256)
    drawCraters(context, random, 170, { dark: 'rgba(35,32,28,.78)', light: 'rgba(210,198,176,.45)', maxRadius: 16 })
  } else if (bodyId === 'venus') {
    gradient.addColorStop(0, '#9c6431')
    gradient.addColorStop(0.5, '#d6ad68')
    gradient.addColorStop(1, '#f0cf8f')
    context.fillStyle = gradient
    context.fillRect(0, 0, 512, 256)
    drawCloudBands(context, random, ['rgba(255,230,170,.38)', 'rgba(166,96,42,.18)', 'rgba(242,190,102,.26)'], 0.72)
  } else if (bodyId === 'earth') {
    context.fillStyle = '#1e5d94'
    context.fillRect(0, 0, 512, 256)
    for (let index = 0; index < 42; index += 1) {
      context.globalAlpha = 0.38
      context.fillStyle = random() > 0.45 ? '#6f8d5b' : '#a58a54'
      context.beginPath()
      context.ellipse(random() * 512, random() * 256, 16 + random() * 48, 8 + random() * 22, random() * Math.PI, 0, Math.PI * 2)
      context.fill()
    }
    drawCloudBands(context, random, ['rgba(255,255,255,.28)', 'rgba(210,235,255,.18)'], 0.36)
  } else if (bodyId === 'mars') {
    gradient.addColorStop(0, '#5d2e22')
    gradient.addColorStop(0.52, '#9b5032')
    gradient.addColorStop(1, '#c2774d')
    context.fillStyle = gradient
    context.fillRect(0, 0, 512, 256)
    drawCraters(context, random, 72, { dark: 'rgba(52,27,20,.42)', light: 'rgba(214,141,92,.25)', maxRadius: 20 })
  } else if (bodyId === 'jupiter') {
    context.fillStyle = '#d8b287'
    context.fillRect(0, 0, 512, 256)
    drawCloudBands(context, random, ['rgba(92,50,28,.42)', 'rgba(238,214,176,.58)', 'rgba(179,92,45,.32)', 'rgba(244,234,210,.5)'], 0.88)
    context.globalAlpha = 0.5
    context.fillStyle = '#9a4a32'
    context.beginPath()
    context.ellipse(365, 145, 38, 15, -0.08, 0, Math.PI * 2)
    context.fill()
  } else if (bodyId === 'saturn') {
    context.fillStyle = '#d6b97c'
    context.fillRect(0, 0, 512, 256)
    drawCloudBands(context, random, ['rgba(118,83,45,.2)', 'rgba(245,225,178,.45)', 'rgba(180,136,72,.22)'], 0.62)
  } else if (bodyId === 'uranus') {
    gradient.addColorStop(0, '#5fa5a8')
    gradient.addColorStop(0.55, '#9bd6d2')
    gradient.addColorStop(1, '#c8f0ea')
    context.fillStyle = gradient
    context.fillRect(0, 0, 512, 256)
    drawCloudBands(context, random, ['rgba(230,255,250,.16)', 'rgba(65,125,132,.12)'], 0.42)
  } else {
    gradient.addColorStop(0, '#0d2a79')
    gradient.addColorStop(0.55, '#1f5ec3')
    gradient.addColorStop(1, '#78a7e8')
    context.fillStyle = gradient
    context.fillRect(0, 0, 512, 256)
    drawCloudBands(context, random, ['rgba(180,220,255,.2)', 'rgba(5,18,62,.18)'], 0.5)
    context.globalAlpha = 0.24
    context.fillStyle = '#07194f'
    context.beginPath()
    context.ellipse(340, 115, 34, 16, -0.15, 0, Math.PI * 2)
    context.fill()
  }

  context.globalAlpha = 1
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 2
  return texture
}

export function createPlanetDisplayTexture(source: THREE.Texture, bodyId: CelestialBodyId) {
  const image = source.image as CanvasImageSource & { naturalWidth?: number; naturalHeight?: number; width?: number; height?: number }
  const width = image.naturalWidth ?? image.width ?? 512
  const height = image.naturalHeight ?? image.height ?? 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')!
  context.drawImage(image, 0, 0, width, height)
  const imageData = context.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index]
    const green = data[index + 1]
    const blue = data[index + 2]
    const luminance = red * 0.3 + green * 0.48 + blue * 0.22
    if (bodyId === 'mercury') {
      const value = (luminance - 132) * 1.34 + 78
      data[index] = clampColor(value * 1.08)
      data[index + 1] = clampColor(value * 0.98)
      data[index + 2] = clampColor(value * 0.82)
    } else if (bodyId === 'venus') {
      const value = (luminance - 138) * 0.62 + 132
      data[index] = clampColor(value * 1.1)
      data[index + 1] = clampColor(value * 0.84)
      data[index + 2] = clampColor(value * 0.46)
    } else if (bodyId === 'mars') {
      const value = (luminance - 118) * 0.92 + 118
      data[index] = clampColor(value * 1.24)
      data[index + 1] = clampColor(value * 0.72)
      data[index + 2] = clampColor(value * 0.52)
    } else if (bodyId === 'jupiter') {
      data[index] = clampColor(red * 1.02 + 8)
      data[index + 1] = clampColor(green * 0.94)
      data[index + 2] = clampColor(blue * 0.82)
    } else if (bodyId === 'saturn') {
      data[index] = clampColor(red * 0.98)
      data[index + 1] = clampColor(green * 0.92)
      data[index + 2] = clampColor(blue * 0.76)
    } else if (bodyId === 'uranus') {
      const value = (luminance - 128) * 0.58 + 128
      data[index] = clampColor(value * 0.62)
      data[index + 1] = clampColor(value * 1.02)
      data[index + 2] = clampColor(value * 1.03)
    } else if (bodyId === 'neptune') {
      const value = (luminance - 118) * 0.9 + 126
      data[index] = clampColor(value * 0.34)
      data[index + 1] = clampColor(value * 0.66)
      data[index + 2] = clampColor(value * 1.34)
    } else if (bodyId === 'sun') {
      data[index] = clampColor(red * 0.94 + 14)
      data[index + 1] = clampColor(green * 0.88)
      data[index + 2] = clampColor(blue * 0.72)
    }
  }
  context.putImageData(imageData, 0, 0)

  if (bodyId === 'mercury') {
    context.globalCompositeOperation = 'multiply'
    context.fillStyle = 'rgba(88, 72, 54, .24)'
    context.fillRect(0, 0, width, height)
    context.globalCompositeOperation = 'source-over'
    drawCraters(context, seededRandom(3001), 82, { dark: 'rgba(22,20,18,.34)', light: 'rgba(190,174,142,.18)', maxRadius: Math.max(7, width * 0.025) })
  }
  if (bodyId === 'venus') {
    context.globalCompositeOperation = 'multiply'
    context.fillStyle = 'rgba(196, 122, 44, .2)'
    context.fillRect(0, 0, width, height)
    context.globalCompositeOperation = 'source-over'
    drawCloudBands(context, seededRandom(3002), ['rgba(255,224,152,.28)', 'rgba(128,70,32,.2)', 'rgba(238,176,86,.2)'], 0.74)
  }
  if (bodyId === 'jupiter') {
    drawCloudBands(context, seededRandom(3005), ['rgba(104,54,31,.24)', 'rgba(250,230,195,.28)', 'rgba(179,88,42,.16)'], 0.34)
    context.globalAlpha = 0.38
    context.fillStyle = '#9b4f36'
    context.beginPath()
    context.ellipse(width * 0.72, height * 0.58, width * 0.08, height * 0.045, -0.05, 0, Math.PI * 2)
    context.fill()
  }
  if (bodyId === 'uranus') {
    drawCloudBands(context, seededRandom(3007), ['rgba(240,255,252,.13)', 'rgba(42,92,104,.14)', 'rgba(124,200,198,.11)'], 0.5)
    context.globalCompositeOperation = 'multiply'
    context.fillStyle = 'rgba(36, 78, 85, .08)'
    context.fillRect(0, 0, width, height)
    context.globalCompositeOperation = 'source-over'
  }
  if (bodyId === 'neptune') {
    drawCloudBands(context, seededRandom(3008), ['rgba(190,225,255,.15)', 'rgba(4,12,54,.14)'], 0.38)
    context.globalAlpha = 0.28
    context.fillStyle = '#07194e'
    context.beginPath()
    context.ellipse(width * 0.64, height * 0.45, width * 0.07, height * 0.04, -0.12, 0, Math.PI * 2)
    context.fill()
  }
  if (bodyId === 'sun') {
    context.globalCompositeOperation = 'screen'
    drawCloudBands(context, seededRandom(3010), ['rgba(255,210,70,.18)', 'rgba(120,28,4,.12)'], 0.38)
    context.globalCompositeOperation = 'source-over'
  }

  context.globalAlpha = 1
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = source.anisotropy
  texture.wrapS = source.wrapS
  texture.wrapT = source.wrapT
  texture.minFilter = source.minFilter
  texture.magFilter = source.magFilter
  texture.generateMipmaps = true
  return texture
}

export function createReticleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const context = canvas.getContext('2d')!
  context.translate(256, 256)
  context.strokeStyle = 'rgba(120, 224, 233, .86)'
  context.lineWidth = 2
  context.beginPath()
  context.arc(0, 0, 154, 0.15, Math.PI * 1.35)
  context.stroke()
  context.strokeStyle = 'rgba(200, 239, 242, .35)'
  context.lineWidth = 1
  context.beginPath()
  context.arc(0, 0, 184, 0, Math.PI * 2)
  context.stroke()
  for (let index = 0; index < 48; index += 1) {
    const angle = (index / 48) * Math.PI * 2
    const major = index % 6 === 0
    const inner = major ? 166 : 174
    context.beginPath()
    context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner)
    context.lineTo(Math.cos(angle) * 190, Math.sin(angle) * 190)
    context.stroke()
  }
  context.strokeStyle = 'rgba(120, 224, 233, .55)'
  ;[[-214, 0, -178, 0], [214, 0, 178, 0], [0, -214, 0, -178], [0, 214, 0, 178]].forEach(([x1, y1, x2, y2]) => {
    context.beginPath()
    context.moveTo(x1, y1)
    context.lineTo(x2, y2)
    context.stroke()
  })
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createParticleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const context = canvas.getContext('2d')!
  const gradient = context.createRadialGradient(32, 32, 1, 32, 32, 31)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.24, 'rgba(224,248,255,.84)')
  gradient.addColorStop(0.62, 'rgba(164,224,242,.28)')
  gradient.addColorStop(1, 'rgba(130,210,240,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 64, 64)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createSatelliteFallbackTexture(preset: SatelliteMaterialPreset, seedLabel: string) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const context = canvas.getContext('2d')!
  const random = seededRandom([...seedLabel].reduce((value, letter) => value + letter.charCodeAt(0), 1977))
  const base = `#${preset.fallbackColor.toString(16).padStart(6, '0')}`
  const accent = `#${preset.fallbackAccent.toString(16).padStart(6, '0')}`
  context.fillStyle = base
  context.fillRect(0, 0, 256, 256)
  for (let index = 0; index < 190; index += 1) {
    const x = random() * 256
    const y = random() * 256
    const radius = 1.5 + random() * (preset.id === 'irregularRock' ? 13 : 8)
    context.globalAlpha = preset.id === 'hazyAtmosphere' ? 0.08 : 0.1 + random() * 0.18
    context.fillStyle = random() > 0.54 ? accent : 'rgba(8, 10, 14, .65)'
    context.beginPath()
    context.ellipse(x, y, radius * (0.65 + random()), radius * (0.45 + random() * 0.8), random() * Math.PI, 0, Math.PI * 2)
    context.fill()
  }
  if (preset.id === 'icyCracked' || preset.id === 'geyserIce' || preset.id === 'tritonFrost') {
    context.globalAlpha = 0.36
    context.strokeStyle = preset.id === 'geyserIce'
      ? 'rgba(210, 246, 255, .72)'
      : preset.id === 'tritonFrost'
        ? 'rgba(120, 166, 190, .5)'
        : 'rgba(124, 186, 214, .72)'
    context.lineWidth = 1.2
    for (let index = 0; index < 26; index += 1) {
      context.beginPath()
      let x = random() * 256
      let y = random() * 256
      context.moveTo(x, y)
      for (let segment = 0; segment < 4; segment += 1) {
        x += (random() - 0.5) * 52
        y += (random() - 0.5) * 34
        context.lineTo(x, y)
      }
      context.stroke()
    }
  }
  if (preset.id === 'tritonFrost') {
    for (let index = 0; index < 9; index += 1) {
      const y = 24 + index * 25 + (random() - 0.5) * 14
      const height = 9 + random() * 12
      const gradient = context.createLinearGradient(0, y - height, 256, y + height)
      gradient.addColorStop(0, 'rgba(42, 48, 58, 0)')
      gradient.addColorStop(0.28, 'rgba(74, 70, 78, .22)')
      gradient.addColorStop(0.52, 'rgba(172, 122, 145, .26)')
      gradient.addColorStop(1, 'rgba(218, 232, 238, 0)')
      context.globalAlpha = 1
      context.fillStyle = gradient
      context.beginPath()
      context.ellipse(128, y, 155 + random() * 50, height, (random() - 0.5) * 0.14, 0, Math.PI * 2)
      context.fill()
    }
    for (let index = 0; index < 34; index += 1) {
      const x = random() * 256
      const y = random() * 256
      const radius = 2 + random() * 10
      context.globalAlpha = 0.13 + random() * 0.12
      context.fillStyle = random() > 0.5 ? 'rgba(245, 250, 255, .9)' : 'rgba(146, 102, 124, .72)'
      context.beginPath()
      context.ellipse(x, y, radius * (1.1 + random()), radius * (0.45 + random() * 0.5), random() * Math.PI, 0, Math.PI * 2)
      context.fill()
    }
  }
  if (preset.id === 'volcanicSulfur') {
    for (let index = 0; index < 22; index += 1) {
      const x = random() * 256
      const y = random() * 256
      const gradient = context.createRadialGradient(x, y, 1, x, y, 16 + random() * 18)
      gradient.addColorStop(0, 'rgba(255, 150, 42, .62)')
      gradient.addColorStop(0.35, 'rgba(116, 50, 24, .38)')
      gradient.addColorStop(1, 'rgba(20, 12, 8, 0)')
      context.globalAlpha = 1
      context.fillStyle = gradient
      context.fillRect(x - 36, y - 36, 72, 72)
    }
  }
  if (preset.id === 'hazyAtmosphere') {
    const gradient = context.createLinearGradient(0, 0, 256, 256)
    gradient.addColorStop(0, 'rgba(255, 206, 112, .22)')
    gradient.addColorStop(0.5, 'rgba(180, 104, 44, .1)')
    gradient.addColorStop(1, 'rgba(72, 38, 18, .22)')
    context.globalAlpha = 1
    context.fillStyle = gradient
    context.fillRect(0, 0, 256, 256)
  }
  context.globalAlpha = 1
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 2
  return texture
}

export function createStarField(count: number, innerRadius: number, outerRadius: number, seed: number) {
  const random = seededRandom(seed)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const radius = innerRadius + random() * (outerRadius - innerRadius)
    const theta = random() * Math.PI * 2
    const phi = Math.acos(2 * random() - 1)
    const offset = index * 3
    positions[offset] = radius * Math.sin(phi) * Math.cos(theta)
    positions[offset + 1] = radius * Math.cos(phi)
    positions[offset + 2] = radius * Math.sin(phi) * Math.sin(theta)
    const brightness = 0.38 + random() * 0.62
    const temperature = random()
    colors[offset] = brightness * (temperature > 0.78 ? 1 : 0.76 + random() * 0.2)
    colors[offset + 1] = brightness * (0.82 + random() * 0.18)
    colors[offset + 2] = brightness * (temperature < 0.22 ? 0.72 : 1)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}

export function createIrregularGeometry(seed: number) {
  const geometry = new THREE.IcosahedronGeometry(1, 2)
  const position = geometry.attributes.position
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index)
    const y = position.getY(index)
    const z = position.getZ(index)
    const noise = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed) * 43758.5453
    const variation = 0.86 + (noise - Math.floor(noise)) * 0.18
    position.setXYZ(index, x * variation * 1.16, y * variation * 0.82, z * variation)
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

export function createPlumeGeometry(count: number, seed: number) {
  const random = seededRandom(seed)
  const positions = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3
    const height = 0.14 + random() * 1.05
    const spread = height * 0.3
    positions[offset] = (random() - 0.5) * spread
    positions[offset + 1] = -0.72 - height
    positions[offset + 2] = (random() - 0.5) * spread
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geometry
}

export function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2
}
