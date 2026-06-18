import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { SOLAR_BODIES, type CelestialBody } from '../lib/solarSystem'

interface SolarSystemSceneProps {
  selectedId: string | null
  paused: boolean
  speed: number
  reducedMotion: boolean
  onSelect: (id: string) => void
}

function seededRandom(seed: number) {
  let value = seed >>> 0
  return () => {
    value = Math.imul(1664525, value) + 1013904223
    return (value >>> 0) / 4294967296
  }
}

function colorToRgb(color: string) {
  const value = new THREE.Color(color)
  return { r: value.r * 255, g: value.g * 255, b: value.b * 255 }
}

function createPlanetTexture(body: CelestialBody) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const context = canvas.getContext('2d')!
  const base = colorToRgb(body.baseColor)
  const accent = colorToRgb(body.accentColor)
  const random = seededRandom([...body.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) * 97)

  context.fillStyle = body.baseColor
  context.fillRect(0, 0, canvas.width, canvas.height)

  if (['jupiter', 'saturn', 'venus', 'uranus', 'neptune'].includes(body.id)) {
    for (let y = 0; y < canvas.height; y += 8 + Math.floor(random() * 12)) {
      const opacity = 0.08 + random() * 0.24
      context.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${opacity})`
      context.fillRect(0, y, canvas.width, 3 + random() * 10)
    }
    if (body.id === 'jupiter') {
      context.fillStyle = 'rgba(132, 53, 36, .65)'
      context.beginPath()
      context.ellipse(365, 154, 42, 17, -0.08, 0, Math.PI * 2)
      context.fill()
    }
  } else {
    for (let index = 0; index < 120; index += 1) {
      const x = random() * canvas.width
      const y = random() * canvas.height
      const size = 2 + random() * (body.id === 'earth' ? 20 : 12)
      context.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.08 + random() * 0.32})`
      context.beginPath()
      context.ellipse(x, y, size * (0.6 + random()), size * 0.45, random() * Math.PI, 0, Math.PI * 2)
      context.fill()
    }
  }

  if (body.id === 'earth') {
    context.strokeStyle = 'rgba(245, 252, 255, .28)'
    context.lineCap = 'round'
    for (let index = 0; index < 18; index += 1) {
      const x = random() * canvas.width
      const y = 18 + random() * (canvas.height - 36)
      const length = 24 + random() * 90
      context.lineWidth = 1 + random() * 2.2
      context.beginPath()
      context.moveTo(x, y)
      context.bezierCurveTo(x + length * 0.3, y - 8, x + length * 0.7, y + 9, x + length, y - 2)
      context.stroke()
    }
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  for (let index = 0; index < imageData.data.length; index += 4) {
    const noise = (random() - 0.5) * 14
    imageData.data[index] = Math.max(0, Math.min(255, imageData.data[index] + noise + base.r * 0.02))
    imageData.data[index + 1] = Math.max(0, Math.min(255, imageData.data[index + 1] + noise + base.g * 0.02))
    imageData.data[index + 2] = Math.max(0, Math.min(255, imageData.data[index + 2] + noise + base.b * 0.02))
  }
  context.putImageData(imageData, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function createGlowTexture() {
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

function createStarField(count: number) {
  const random = seededRandom(20260619)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  for (let index = 0; index < count; index += 1) {
    const radius = 32 + random() * 55
    const theta = random() * Math.PI * 2
    const phi = Math.acos(2 * random() - 1)
    const offset = index * 3
    positions[offset] = radius * Math.sin(phi) * Math.cos(theta)
    positions[offset + 1] = radius * Math.cos(phi)
    positions[offset + 2] = radius * Math.sin(phi) * Math.sin(theta)
    const brightness = 0.42 + random() * 0.58
    colors[offset] = brightness * (0.78 + random() * 0.22)
    colors[offset + 1] = brightness * (0.86 + random() * 0.14)
    colors[offset + 2] = brightness
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return geometry
}

export default function SolarSystemScene({ selectedId, paused, speed, reducedMotion, onSelect }: SolarSystemSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef(selectedId)
  const pausedRef = useRef(paused)
  const speedRef = useRef(speed)
  const onSelectRef = useRef(onSelect)
  selectedRef.current = selectedId
  pausedRef.current = paused
  speedRef.current = speed
  onSelectRef.current = onSelect

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x02030a)
    scene.fog = new THREE.FogExp2(0x02030a, 0.012)

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 180)
    camera.position.set(0, 12.5, 24)

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    const pixelRatio = Math.min(window.devicePixelRatio, reducedMotion ? 1.15 : 1.5)
    renderer.setPixelRatio(pixelRatio)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.055
    controls.enablePan = false
    controls.minDistance = 6
    controls.maxDistance = 46
    controls.maxPolarAngle = Math.PI * 0.49
    controls.minPolarAngle = Math.PI * 0.12
    controls.target.set(0, 0, 0)

    const system = new THREE.Group()
    system.rotation.z = -0.04
    scene.add(system)

    const ambientLight = new THREE.AmbientLight(0x496078, 0.62)
    scene.add(ambientLight)
    const sunLight = new THREE.PointLight(0xffe0a0, 180, 65, 1.5)
    scene.add(sunLight)

    const starGeometry = createStarField(reducedMotion ? 1700 : 3400)
    const starMaterial = new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.84, sizeAttenuation: true })
    scene.add(new THREE.Points(starGeometry, starMaterial))

    const bodyMeshes = new Map<string, THREE.Mesh>()
    const bodyGroups = new Map<string, THREE.Group>()
    const textures: THREE.Texture[] = []
    const interactive: THREE.Object3D[] = []

    const glowTexture = createGlowTexture()
    textures.push(glowTexture)
    const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0xffa63d, transparent: true, opacity: 0.74, depthWrite: false, blending: THREE.AdditiveBlending }))
    sunGlow.scale.setScalar(7.8)
    system.add(sunGlow)

    for (const body of SOLAR_BODIES) {
      const orbitGroup = new THREE.Group()
      orbitGroup.rotation.x = body.inclination
      system.add(orbitGroup)
      bodyGroups.set(body.id, orbitGroup)

      if (body.orbitRadius > 0) {
        const orbitPoints: THREE.Vector3[] = []
        for (let step = 0; step < 160; step += 1) {
          const angle = (step / 160) * Math.PI * 2
          orbitPoints.push(new THREE.Vector3(Math.cos(angle) * body.orbitRadius, 0, Math.sin(angle) * body.orbitRadius))
        }
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints)
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x78909a, transparent: true, opacity: 0.14 })
        orbitGroup.add(new THREE.LineLoop(orbitGeometry, orbitMaterial))
      }

      const texture = createPlanetTexture(body)
      textures.push(texture)
      const geometry = new THREE.SphereGeometry(body.radius, reducedMotion ? 32 : 48, reducedMotion ? 20 : 32)
      const material = body.id === 'sun'
        ? new THREE.MeshBasicMaterial({ map: texture, color: 0xffc45a })
        : new THREE.MeshStandardMaterial({ map: texture, roughness: 0.82, metalness: 0.02, emissive: new THREE.Color(body.baseColor).multiplyScalar(0.075) })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = body.id
      mesh.userData.bodyId = body.id
      mesh.position.set(Math.cos(body.startAngle) * body.orbitRadius, 0, Math.sin(body.startAngle) * body.orbitRadius)
      orbitGroup.add(mesh)
      bodyMeshes.set(body.id, mesh)
      interactive.push(mesh)

      if (body.id === 'earth') {
        const atmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(body.radius * 1.035, 40, 28),
          new THREE.MeshBasicMaterial({ color: 0x7ecbff, transparent: true, opacity: 0.13, side: THREE.BackSide, blending: THREE.AdditiveBlending }),
        )
        mesh.add(atmosphere)
      }

      if (body.hasRings) {
        const ringBands = [
          { inner: 1.28, outer: 1.53, color: 0xb8aa8d, opacity: 0.34 },
          { inner: 1.59, outer: 1.92, color: 0xe2d3ae, opacity: 0.52 },
          { inner: 2.0, outer: 2.28, color: 0x9f957f, opacity: 0.28 },
        ]
        ringBands.forEach((band) => {
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(body.radius * band.inner, body.radius * band.outer, 96),
            new THREE.MeshBasicMaterial({ color: band.color, transparent: true, opacity: band.opacity, side: THREE.DoubleSide, depthWrite: false }),
          )
          ring.rotation.x = Math.PI / 2.35
          mesh.add(ring)
        })
      }
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const pointerStart = new THREE.Vector2()
    const focusTarget = new THREE.Vector3()
    const focusDirection = new THREE.Vector3()
    const desiredCamera = new THREE.Vector3()
    const overviewPosition = new THREE.Vector3(0, 12.5, 24)
    const overviewTarget = new THREE.Vector3()
    let lastSelectedId: string | null = null
    let focusTransition = 1
    let hovered: THREE.Object3D | null = null
    let elapsed = 0
    let visible = !document.hidden

    const pointerToNdc = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
    }
    const hitTest = (event: PointerEvent) => {
      pointerToNdc(event)
      raycaster.setFromCamera(pointer, camera)
      return raycaster.intersectObjects(interactive, false)[0]?.object ?? null
    }
    const onPointerDown = (event: PointerEvent) => pointerStart.set(event.clientX, event.clientY)
    const onPointerMove = (event: PointerEvent) => {
      hovered = hitTest(event)
      renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab'
    }
    const onPointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return
      const hit = hitTest(event)
      const id = hit?.userData.bodyId as string | undefined
      if (id) onSelectRef.current(id)
    }
    const onVisibility = () => { visible = !document.hidden }
    const resize = () => {
      const width = mount.clientWidth
      const height = Math.max(mount.clientHeight, 1)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    document.addEventListener('visibilitychange', onVisibility)
    resize()

    let frame = 0
    let previousTime = 0
    const render = (time = 0) => {
      frame = requestAnimationFrame(render)
      if (!visible) return
      const delta = previousTime === 0 ? 0.016 : Math.min((time - previousTime) / 1000, 0.05)
      previousTime = time
      if (!pausedRef.current) elapsed += delta * speedRef.current

      for (const body of SOLAR_BODIES) {
        const mesh = bodyMeshes.get(body.id)!
        if (body.orbitRadius > 0) {
          const angle = body.startAngle + elapsed * body.orbitSpeed * 0.13
          mesh.position.set(Math.cos(angle) * body.orbitRadius, 0, Math.sin(angle) * body.orbitRadius)
        }
        mesh.rotation.y += delta * body.rotationSpeed * (pausedRef.current ? 0 : speedRef.current)
        const material = mesh.material
        if (material instanceof THREE.MeshStandardMaterial) {
          const selected = selectedRef.current === body.id
          material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, selected ? 2.2 : 1, 0.08)
        }
      }

      if (selectedRef.current !== lastSelectedId) {
        lastSelectedId = selectedRef.current
        focusTransition = 0
        focusDirection.copy(camera.position).sub(controls.target).normalize()
      }

      const selectedMesh = selectedRef.current ? bodyMeshes.get(selectedRef.current) : null
      if (selectedMesh) {
        selectedMesh.getWorldPosition(focusTarget)
        controls.target.lerp(focusTarget, 0.075)
        if (focusTransition < 1) {
          const body = SOLAR_BODIES.find((candidate) => candidate.id === selectedRef.current)!
          const focusDistance = Math.max(4.4, body.radius * 5.4)
          desiredCamera.copy(focusTarget).addScaledVector(focusDirection, focusDistance)
          desiredCamera.y += Math.max(0.35, body.radius * 0.55)
          camera.position.lerp(desiredCamera, 0.065)
          focusTransition = Math.min(1, focusTransition + delta * 0.9)
        }
      } else {
        controls.target.lerp(overviewTarget, 0.045)
        if (focusTransition < 1) {
          camera.position.lerp(overviewPosition, 0.045)
          focusTransition = Math.min(1, focusTransition + delta * 0.75)
        }
      }
      controls.update()
      system.rotation.y += pausedRef.current || reducedMotion ? 0 : delta * 0.002
      renderer.render(scene, camera)
    }
    render()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('visibilitychange', onVisibility)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry?.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      textures.forEach((texture) => texture.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [reducedMotion])

  return <div ref={mountRef} className="solar-system-scene" aria-label="可交互太阳系模型" />
}
