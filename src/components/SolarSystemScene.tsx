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

const PLANET_TEXTURES: Record<CelestialBody['id'], string> = {
  sun: '2k_sun.jpg',
  mercury: '2k_mercury.jpg',
  venus: '2k_venus_atmosphere.jpg',
  earth: '2k_earth_daymap.jpg',
  mars: '2k_mars.jpg',
  jupiter: '2k_jupiter.jpg',
  saturn: '2k_saturn.jpg',
  uranus: '2k_uranus.jpg',
  neptune: '2k_neptune.jpg',
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
    renderer.toneMappingExposure = 1.02
    mount.appendChild(renderer.domElement)

    const textureLoader = new THREE.TextureLoader()
    const textureBase = `${import.meta.env.BASE_URL}textures/solar-system-scope`
    const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)
    const textures: THREE.Texture[] = []
    const loadTexture = (file: string, color = true) => {
      const texture = textureLoader.load(`${textureBase}/${file}`)
      texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
      texture.anisotropy = maxAnisotropy
      textures.push(texture)
      return texture
    }

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

    const ambientLight = new THREE.AmbientLight(0x32465e, 0.38)
    scene.add(ambientLight)
    const sunLight = new THREE.PointLight(0xffe0b4, 230, 72, 1.45)
    scene.add(sunLight)

    const skyTexture = loadTexture('8k_stars_milky_way.jpg')
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(120, 64, 40),
      new THREE.MeshBasicMaterial({
        map: skyTexture,
        color: 0xe7efff,
        transparent: true,
        opacity: 0.9,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    )
    sky.rotation.set(0.12, -0.8, -0.09)
    scene.add(sky)

    const starGeometry = createStarField(reducedMotion ? 2200 : 4600)
    const starMaterial = new THREE.PointsMaterial({ size: 0.042, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true, depthWrite: false })
    scene.add(new THREE.Points(starGeometry, starMaterial))

    const bodyMeshes = new Map<string, THREE.Mesh>()
    const bodyGroups = new Map<string, THREE.Group>()
    const interactive: THREE.Object3D[] = []
    let earthClouds: THREE.Mesh | null = null

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

      const texture = loadTexture(PLANET_TEXTURES[body.id])
      const geometry = new THREE.SphereGeometry(body.radius, reducedMotion ? 32 : 48, reducedMotion ? 20 : 32)
      const material = body.id === 'sun'
        ? new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff })
        : new THREE.MeshStandardMaterial({
            map: texture,
            roughness: ['jupiter', 'saturn', 'uranus', 'neptune', 'venus'].includes(body.id) ? 0.94 : 0.82,
            metalness: 0,
            emissive: new THREE.Color(body.baseColor).multiplyScalar(0.025),
          })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = body.id
      mesh.userData.bodyId = body.id
      mesh.position.set(Math.cos(body.startAngle) * body.orbitRadius, 0, Math.sin(body.startAngle) * body.orbitRadius)
      orbitGroup.add(mesh)
      bodyMeshes.set(body.id, mesh)
      interactive.push(mesh)

      if (body.id === 'earth') {
        const cloudTexture = loadTexture('2k_earth_clouds.jpg', false)
        earthClouds = new THREE.Mesh(
          new THREE.SphereGeometry(body.radius * 1.012, 48, 32),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            alphaMap: cloudTexture,
            transparent: true,
            opacity: 0.62,
            roughness: 1,
            depthWrite: false,
          }),
        )
        mesh.add(earthClouds)
        const atmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(body.radius * 1.035, 40, 28),
          new THREE.MeshBasicMaterial({ color: 0x67bfff, transparent: true, opacity: 0.16, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }),
        )
        mesh.add(atmosphere)
      }

      if (body.hasRings) {
        const innerRadius = body.radius * 1.25
        const outerRadius = body.radius * 2.32
        const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 160)
        const positions = ringGeometry.attributes.position
        const uvs = ringGeometry.attributes.uv
        for (let index = 0; index < positions.count; index += 1) {
          const radius = Math.hypot(positions.getX(index), positions.getY(index))
          uvs.setXY(index, (radius - innerRadius) / (outerRadius - innerRadius), 0.5)
        }
        const ringTexture = loadTexture('2k_saturn_ring_alpha.png')
        const ring = new THREE.Mesh(
          ringGeometry,
          new THREE.MeshBasicMaterial({
            map: ringTexture,
            color: 0xe9e0d1,
            transparent: true,
            alphaTest: 0.025,
            opacity: 0.78,
            side: THREE.DoubleSide,
            depthWrite: false,
            toneMapped: false,
          }),
        )
        ring.rotation.x = Math.PI / 2.35
        mesh.add(ring)
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
      if (earthClouds && !pausedRef.current && !reducedMotion) earthClouds.rotation.y += delta * 0.012 * speedRef.current
      if (!reducedMotion) sky.rotation.y += delta * 0.00035
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
