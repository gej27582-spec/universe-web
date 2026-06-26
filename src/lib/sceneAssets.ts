import * as THREE from 'three'
import type { SatelliteMaterialPreset } from './satelliteMaterials'

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
