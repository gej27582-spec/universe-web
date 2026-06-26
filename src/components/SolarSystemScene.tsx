import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { ObservationPhase } from '../lib/observationState'
import {
  getSatelliteSceneScale,
  SATELLITES,
  type ParentBodyId,
  type Satellite,
  type SatelliteId,
  type ScaleMode,
} from '../lib/satellites'
import {
  getSatelliteMaterialPreset,
  QUALITY_SETTINGS,
  type QualityMode,
} from '../lib/satelliteMaterials'
import {
  createGlowTexture,
  createIrregularGeometry,
  createParticleTexture,
  createPlumeGeometry,
  createReticleTexture,
  createSatelliteFallbackTexture,
  createStarField,
  easeInOutCubic,
} from '../lib/sceneAssets'
import type { SceneDiagnostics } from '../lib/sceneDiagnostics'
import { SOLAR_BODIES, type CelestialBody, type CelestialBodyId } from '../lib/solarSystem'

interface SolarSystemSceneProps {
  selectedId: CelestialBodyId | null
  selectedSatelliteId: SatelliteId | null
  scaleMode: ScaleMode
  phase: ObservationPhase
  paused: boolean
  speed: number
  reducedMotion: boolean
  quality: QualityMode
  onSelect: (id: CelestialBodyId) => void
  onSatelliteSelect: (id: SatelliteId) => void
  onCameraArrived: (id: CelestialBodyId, satelliteId?: SatelliteId) => void
  onUserInteraction: () => void
  onPerformanceDegrade: (mode: QualityMode, fps: number) => void
}

const PLANET_TEXTURES: Record<CelestialBodyId, string> = {
  sun: '2k_sun.jpg', mercury: '2k_mercury.jpg', venus: '2k_venus_atmosphere.jpg',
  earth: '2k_earth_daymap.jpg', mars: '2k_mars.jpg', jupiter: '2k_jupiter.jpg',
  saturn: '2k_saturn.jpg', uranus: '2k_uranus.jpg', neptune: '2k_neptune.jpg',
}

const ATMOSPHERES: Partial<Record<CelestialBodyId, { color: number; opacity: number }>> = {
  venus: { color: 0xf0c786, opacity: 0.075 }, earth: { color: 0x67bfff, opacity: 0.12 },
  jupiter: { color: 0xe6c7a2, opacity: 0.055 }, uranus: { color: 0x9ee9ed, opacity: 0.09 },
  neptune: { color: 0x497ff1, opacity: 0.11 },
}

export default function SolarSystemScene({
  selectedId, selectedSatelliteId, scaleMode, phase, paused, speed, reducedMotion, quality,
  onSelect, onSatelliteSelect, onCameraArrived, onUserInteraction, onPerformanceDegrade,
}: SolarSystemSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef(selectedId)
  const selectedSatelliteRef = useRef(selectedSatelliteId)
  const scaleModeRef = useRef(scaleMode)
  const phaseRef = useRef(phase)
  const pausedRef = useRef(paused)
  const speedRef = useRef(speed)
  const callbacksRef = useRef({ onSelect, onSatelliteSelect, onCameraArrived, onUserInteraction, onPerformanceDegrade })
  selectedRef.current = selectedId
  selectedSatelliteRef.current = selectedSatelliteId
  scaleModeRef.current = scaleMode
  phaseRef.current = phase
  pausedRef.current = paused
  speedRef.current = speed
  callbacksRef.current = { onSelect, onSatelliteSelect, onCameraArrived, onUserInteraction, onPerformanceDegrade }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x02030a)
    scene.fog = new THREE.FogExp2(0x02030a, 0.011)

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 180)
    camera.position.set(0, 12.5, 24)
    const qualitySettings = QUALITY_SETTINGS[quality]
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, reducedMotion ? Math.min(1.05, qualitySettings.dprCap) : qualitySettings.dprCap))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.02
    mount.appendChild(renderer.domElement)

    const textureLoader = new THREE.TextureLoader()
    const planetTextureBase = `${import.meta.env.BASE_URL}textures/solar-system-scope`
    const textureBase = `${import.meta.env.BASE_URL}textures`
    const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), qualitySettings.textureAnisotropyCap)
    const textures: THREE.Texture[] = []
    const satelliteTextureCache = new Map<string, Promise<THREE.Texture | null>>()
    let satelliteTexturesLoaded = 0
    let disposed = false
    const loadTexture = (path: string, color = true) => {
      const texture = textureLoader.load(path)
      texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
      texture.anisotropy = maxAnisotropy
      textures.push(texture)
      return texture
    }
    const loadSatelliteTexture = (path: string) => {
      const cached = satelliteTextureCache.get(path)
      if (cached) return cached
      const request = textureLoader.loadAsync(path)
        .then((texture) => {
          if (disposed) {
            texture.dispose()
            return null
          }
          texture.colorSpace = THREE.SRGBColorSpace
          texture.anisotropy = maxAnisotropy
          textures.push(texture)
          satelliteTexturesLoaded += 1
          return texture
        })
        .catch(() => null)
      satelliteTextureCache.set(path, request)
      return request
    }

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.055
    controls.enablePan = false
    controls.minDistance = 0.85
    controls.maxDistance = 46
    controls.maxPolarAngle = Math.PI * 0.78
    controls.minPolarAngle = Math.PI * 0.08
    controls.target.set(0, 0, 0)

    const system = new THREE.Group()
    system.rotation.z = -0.04
    scene.add(system)

    scene.add(new THREE.AmbientLight(0x32465e, 0.38))
    scene.add(new THREE.HemisphereLight(0x496682, 0x080604, 0.16))
    const sunLight = new THREE.PointLight(0xffe0b4, 230, 72, 1.45)
    scene.add(sunLight)
    const observationFill = new THREE.DirectionalLight(0xa8d5e7, 0.12)
    scene.add(observationFill, observationFill.target)

    const skyTexture = loadTexture(`${planetTextureBase}/8k_stars_milky_way.jpg`)
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(120, 64, 40),
      new THREE.MeshBasicMaterial({ map: skyTexture, color: 0xe7efff, transparent: true, opacity: 0.9, side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false }),
    )
    sky.rotation.set(0.12, -0.8, -0.09)
    scene.add(sky)

    const starLayers = [
      { count: Math.round((reducedMotion ? 1600 : 3300) * qualitySettings.starMultiplier), inner: 44, outer: 88, size: 0.038, opacity: 0.65, seed: 20260619 },
      { count: Math.round((reducedMotion ? 500 : 1050) * qualitySettings.starMultiplier), inner: 19, outer: 43, size: 0.03, opacity: 0.5, seed: 19062026 },
      { count: Math.round((reducedMotion ? 120 : 260) * qualitySettings.starMultiplier), inner: 8, outer: 18, size: 0.022, opacity: 0.34, seed: 260619 },
    ]
    starLayers.forEach((layer) => {
      const geometry = createStarField(layer.count, layer.inner, layer.outer, layer.seed)
      const material = new THREE.PointsMaterial({ size: layer.size, vertexColors: true, transparent: true, opacity: layer.opacity, sizeAttenuation: true, depthWrite: false })
      scene.add(new THREE.Points(geometry, material))
    })

    const bodyMeshes = new Map<CelestialBodyId, THREE.Mesh>()
    const orbitGroups = new Map<CelestialBodyId, THREE.Group>()
    const planetOrbitMaterials: THREE.LineBasicMaterial[] = []
    const reticles = new Map<CelestialBodyId, THREE.Sprite>()
    const interactive: THREE.Object3D[] = []
    let earthClouds: THREE.Mesh | null = null

    const glowTexture = createGlowTexture()
    textures.push(glowTexture)
    const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: 0xffa63d, transparent: true, opacity: 0.74, depthWrite: false, blending: THREE.AdditiveBlending }))
    sunGlow.scale.setScalar(7.8)
    system.add(sunGlow)

    const reticleTexture = createReticleTexture()
    textures.push(reticleTexture)
    const particleTexture = createParticleTexture()
    textures.push(particleTexture)

    for (const body of SOLAR_BODIES) {
      const orbitGroup = new THREE.Group()
      orbitGroup.rotation.x = body.inclination
      system.add(orbitGroup)
      orbitGroups.set(body.id, orbitGroup)

      if (body.orbitRadius > 0) {
        const orbitPoints: THREE.Vector3[] = []
        for (let step = 0; step < 180; step += 1) {
          const angle = (step / 180) * Math.PI * 2
          orbitPoints.push(new THREE.Vector3(Math.cos(angle) * body.orbitRadius, 0, Math.sin(angle) * body.orbitRadius))
        }
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x78909a, transparent: true, opacity: 0.13 })
        planetOrbitMaterials.push(orbitMaterial)
        orbitGroup.add(new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(orbitPoints),
          orbitMaterial,
        ))
      }

      const texture = loadTexture(`${planetTextureBase}/${PLANET_TEXTURES[body.id]}`)
      const planetSegments = reducedMotion ? Math.min(32, qualitySettings.planetSegments) : qualitySettings.planetSegments
      const geometry = new THREE.SphereGeometry(body.radius, planetSegments, Math.max(16, Math.round(planetSegments * 0.66)))
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
      mesh.rotation.z = THREE.MathUtils.degToRad(body.axialTilt)
      mesh.position.set(Math.cos(body.startAngle) * body.orbitRadius, 0, Math.sin(body.startAngle) * body.orbitRadius)
      orbitGroup.add(mesh)
      bodyMeshes.set(body.id, mesh)
      interactive.push(mesh)

      const atmosphereData = ATMOSPHERES[body.id]
      if (atmosphereData) {
        mesh.add(new THREE.Mesh(
          new THREE.SphereGeometry(body.radius * 1.035, Math.min(40, qualitySettings.planetSegments), Math.min(28, Math.round(qualitySettings.planetSegments * 0.66))),
          new THREE.MeshBasicMaterial({ color: atmosphereData.color, transparent: true, opacity: atmosphereData.opacity, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }),
        ))
      }

      if (body.id === 'earth') {
        const cloudTexture = loadTexture(`${planetTextureBase}/2k_earth_clouds.jpg`, false)
        earthClouds = new THREE.Mesh(
          new THREE.SphereGeometry(body.radius * 1.012, planetSegments, Math.max(16, Math.round(planetSegments * 0.66))),
          new THREE.MeshStandardMaterial({ color: 0xffffff, alphaMap: cloudTexture, transparent: true, opacity: 0.38, roughness: 1, depthWrite: false }),
        )
        mesh.add(earthClouds)
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
        const ringTexture = loadTexture(`${planetTextureBase}/2k_saturn_ring_alpha.png`)
        const ring = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({ map: ringTexture, color: 0xe9e0d1, transparent: true, alphaTest: 0.025, opacity: 0.78, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }))
        ring.rotation.x = Math.PI / 2.35
        mesh.add(ring)
      }

      const reticle = new THREE.Sprite(new THREE.SpriteMaterial({ map: reticleTexture, color: 0x8ee8ee, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }))
      reticle.scale.setScalar(Math.max(body.radius * 4.1, 1.05))
      reticle.position.copy(mesh.position)
      orbitGroup.add(reticle)
      reticles.set(body.id, reticle)
    }

    type SatelliteRuntime = {
      satellite: Satellite
      root: THREE.Group
      hitProxy: THREE.Mesh
      material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial
      texturePath?: string
      textureLoaded: boolean
      orbit: THREE.LineLoop
      orbitMaterial: THREE.LineBasicMaterial
      reticle: THREE.Sprite
      reticleMaterial: THREE.SpriteMaterial
      effectMaterials: THREE.Material[]
      plume?: THREE.Points
      currentOrbitRadius: number
      currentRadius: number
    }

    const satelliteSystems = new Map<ParentBodyId, THREE.Group>()
    const satelliteRuntimes = new Map<SatelliteId, SatelliteRuntime>()

    for (const satellite of SATELLITES) {
      const parentBody = SOLAR_BODIES.find((body) => body.id === satellite.parentId)!
      const parentOrbitGroup = orbitGroups.get(satellite.parentId)!
      let satelliteSystem = satelliteSystems.get(satellite.parentId)
      if (!satelliteSystem) {
        satelliteSystem = new THREE.Group()
        satelliteSystem.name = `${satellite.parentId}-satellite-system`
        parentOrbitGroup.add(satelliteSystem)
        satelliteSystems.set(satellite.parentId, satelliteSystem)
      }

      const orbitPoints: THREE.Vector3[] = []
      for (let step = 0; step < 128; step += 1) {
        const angle = (step / 128) * Math.PI * 2
        orbitPoints.push(new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)))
      }
      const orbitMaterial = new THREE.LineBasicMaterial({ color: satellite.retrograde ? 0xd6a5ca : 0x91b5bd, transparent: true, opacity: 0.015 })
      const orbit = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(orbitPoints), orbitMaterial)
      orbit.rotation.x = satellite.inclination
      satelliteSystem.add(orbit)

      const root = new THREE.Group()
      root.name = satellite.id
      const geometry = satellite.phenomenon === 'irregular'
        ? createIrregularGeometry(satellite.id === 'phobos' ? 2401 : 2402)
        : new THREE.SphereGeometry(1, reducedMotion ? Math.min(24, qualitySettings.satelliteSegments) : qualitySettings.satelliteSegments, reducedMotion ? 16 : Math.max(14, Math.round(qualitySettings.satelliteSegments * 0.66)))
      const preset = getSatelliteMaterialPreset(satellite.id)
      const fallbackTexture = createSatelliteFallbackTexture(preset, satellite.id)
      textures.push(fallbackTexture)
      const material = preset.materialType === 'MeshPhysicalMaterial'
        ? new THREE.MeshPhysicalMaterial({
            map: fallbackTexture,
            color: satellite.color,
            roughness: preset.roughness,
            metalness: preset.metalness,
            clearcoat: preset.clearcoat ?? 0,
            clearcoatRoughness: preset.clearcoatRoughness ?? 0.4,
            emissive: new THREE.Color(satellite.color).multiplyScalar(preset.emissiveIntensity),
            transparent: true,
            opacity: 0,
          })
        : new THREE.MeshStandardMaterial({
            map: fallbackTexture,
            color: satellite.color,
            roughness: preset.roughness,
            metalness: preset.metalness,
            emissive: satellite.id === 'triton'
              ? new THREE.Color(0x2a1726)
              : new THREE.Color(satellite.color).multiplyScalar(preset.emissiveIntensity),
            transparent: true,
            opacity: 0,
          })
      const surface = new THREE.Mesh(geometry, material)
      surface.name = `${satellite.id}-surface`
      root.add(surface)

      const effectMaterials: THREE.Material[] = []
      if (satellite.phenomenon === 'earthshine') {
        const earthshineMaterial = new THREE.MeshBasicMaterial({ color: 0x6da7cf, transparent: true, opacity: 0, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
        root.add(new THREE.Mesh(new THREE.SphereGeometry(1.045, qualitySettings.hazeSegments, Math.max(14, Math.round(qualitySettings.hazeSegments * 0.62))), earthshineMaterial))
        effectMaterials.push(earthshineMaterial)
      }
      if (satellite.phenomenon === 'haze') {
        const hazeMaterial = new THREE.MeshBasicMaterial({ color: 0xe18d3e, transparent: true, opacity: 0, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
        root.add(new THREE.Mesh(new THREE.SphereGeometry(1.08, qualitySettings.hazeSegments, Math.max(12, Math.round(qualitySettings.hazeSegments * 0.62))), hazeMaterial))
        effectMaterials.push(hazeMaterial)
        if (quality !== 'low') {
          const outerHazeMaterial = new THREE.MeshBasicMaterial({ color: 0xf2b55f, transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false })
          root.add(new THREE.Mesh(new THREE.SphereGeometry(1.15, qualitySettings.hazeSegments, Math.max(12, Math.round(qualitySettings.hazeSegments * 0.62))), outerHazeMaterial))
          effectMaterials.push(outerHazeMaterial)
        }
      }
      if (satellite.phenomenon === 'volcanic') {
        const hotSpots: Array<[number, number, number, number]> = [
          [0.34, 0.36, 0.88, 0.42],
          [-0.52, -0.08, 0.72, 0.28],
          [0.08, -0.62, 0.78, 0.22],
        ]
        hotSpots.forEach(([x, y, z, size]) => {
          const volcanicMaterial = new THREE.SpriteMaterial({ map: glowTexture, color: 0xff8a2c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
          const volcanicGlow = new THREE.Sprite(volcanicMaterial)
          volcanicGlow.position.set(x, y, z).normalize().multiplyScalar(1.025)
          volcanicGlow.scale.setScalar(size)
          root.add(volcanicGlow)
          effectMaterials.push(volcanicMaterial)
        })
      }

      let plume: THREE.Points | undefined
      if (satellite.phenomenon === 'plume') {
        const plumeMaterial = new THREE.PointsMaterial({ map: particleTexture, color: 0xdaf7ff, size: quality === 'low' ? 0.016 : 0.02, transparent: true, opacity: 0, alphaTest: 0.01, depthWrite: false })
        plume = new THREE.Points(createPlumeGeometry(reducedMotion ? Math.min(18, qualitySettings.plumeParticles) : qualitySettings.plumeParticles, 1977), plumeMaterial)
        root.add(plume)
        effectMaterials.push(plumeMaterial)
      }

      const hitProxy = new THREE.Mesh(
        new THREE.SphereGeometry(1, 14, 10),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
      )
      hitProxy.name = `${satellite.id}-hit-target`
      hitProxy.userData.satelliteId = satellite.id
      satelliteSystem.add(root, hitProxy)
      interactive.push(hitProxy)

      const reticleMaterial = new THREE.SpriteMaterial({ map: reticleTexture, color: 0xa9f1f3, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
      const reticle = new THREE.Sprite(reticleMaterial)
      satelliteSystem.add(reticle)

      const initialScale = getSatelliteSceneScale(satellite, parentBody, 'display')
      satelliteRuntimes.set(satellite.id, {
        satellite, root, hitProxy, material, texturePath: satellite.texture ? `${textureBase}/${satellite.texture}` : undefined, textureLoaded: false,
        orbit, orbitMaterial, reticle, reticleMaterial, effectMaterials, plume,
        currentOrbitRadius: initialScale.orbitRadius,
        currentRadius: initialScale.radius,
      })
    }

    const ensureSatelliteTexture = (runtime: SatelliteRuntime) => {
      const allowCompactMarsMoonTexture = runtime.satellite.parentId === 'mars'
      if ((!qualitySettings.loadSatelliteTextures && !allowCompactMarsMoonTexture) || runtime.textureLoaded || !runtime.texturePath) return
      runtime.textureLoaded = true
      void loadSatelliteTexture(runtime.texturePath).then((texture) => {
        if (!texture || disposed) return
        runtime.material.map = texture
        runtime.material.needsUpdate = true
      })
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const pointerStart = new THREE.Vector2()
    const focusTarget = new THREE.Vector3()
    const parentFocusTarget = new THREE.Vector3()
    const previousFocusTarget = new THREE.Vector3()
    const desiredCamera = new THREE.Vector3()
    const desiredTarget = new THREE.Vector3()
    const transitionStartCamera = new THREE.Vector3()
    const transitionStartTarget = new THREE.Vector3()
    const viewDirection = new THREE.Vector3()
    const viewRight = new THREE.Vector3()
    const focusMovement = new THREE.Vector3()
    const up = new THREE.Vector3(0, 1, 0)
    const overviewPosition = new THREE.Vector3(0, 12.5, 24)
    const overviewTarget = new THREE.Vector3()
    let activeSelectedId: CelestialBodyId | null | undefined
    let activeSelectedSatelliteId: SatelliteId | null | undefined
    let transitionStartedAt = 0
    let transitionDuration = 1
    let transitionActive = false
    let arrivalReported = false
    let hovered: THREE.Object3D | null = null
    let elapsed = 0
    let visible = !document.hidden
    let frameCounter = 0
    let fpsWindowStart = performance.now()

    const pointerToNdc = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
    }
    const hitTest = (event: PointerEvent) => {
      pointerToNdc(event)
      raycaster.setFromCamera(pointer, camera)
      return raycaster.intersectObjects(interactive, false)
        .map((hit) => hit.object)
        .find((object) => {
          const satelliteId = object.userData.satelliteId as SatelliteId | undefined
          if (!satelliteId) return object.visible
          const satellite = satelliteRuntimes.get(satelliteId)?.satellite
          return object.visible && satellite?.parentId === selectedRef.current && phaseRef.current === 'focused'
        }) ?? null
    }
    const onPointerDown = (event: PointerEvent) => {
      pointerStart.set(event.clientX, event.clientY)
      callbacksRef.current.onUserInteraction()
    }
    const onPointerMove = (event: PointerEvent) => {
      hovered = hitTest(event)
      renderer.domElement.style.cursor = hovered ? 'pointer' : controls.enabled ? 'grab' : 'default'
    }
    const onPointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return
      const hit = hitTest(event)
      const satelliteId = hit?.userData.satelliteId as SatelliteId | undefined
      if (satelliteId) {
        callbacksRef.current.onSatelliteSelect(satelliteId)
        return
      }
      const bodyId = hit?.userData.bodyId as CelestialBodyId | undefined
      if (bodyId) callbacksRef.current.onSelect(bodyId)
    }
    const onWheel = () => callbacksRef.current.onUserInteraction()
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
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    resize()

    const diagnosticsWindow = window as Window & {
      __THREE_OBSERVATORY_DIAGNOSTICS__?: {
        renderer: THREE.WebGLRenderer['info']
        snapshot: () => SceneDiagnostics
      }
    }
    diagnosticsWindow.__THREE_OBSERVATORY_DIAGNOSTICS__ = {
      renderer: renderer.info,
      snapshot: () => ({
        selectedBody: selectedRef.current,
        selectedSatellite: selectedSatelliteRef.current,
        scaleMode: scaleModeRef.current,
        quality,
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        points: renderer.info.render.points,
        lines: renderer.info.render.lines,
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        satellites: satelliteRuntimes.size,
        satelliteTexturesLoaded,
        dpr: renderer.getPixelRatio(),
        canvas: { width: renderer.domElement.width, height: renderer.domElement.height },
      }),
    }

    let frame = 0
    let previousTime = 0
    let lowFpsWindows = 0
    let lastDegradeAt = 0
    const render = (time = 0) => {
      frame = requestAnimationFrame(render)
      if (!visible) return
      const delta = previousTime === 0 ? 0.016 : Math.min((time - previousTime) / 1000, 0.05)
      previousTime = time
      if (!pausedRef.current) elapsed += delta * speedRef.current

      for (const body of SOLAR_BODIES) {
        const mesh = bodyMeshes.get(body.id)!
        const reticle = reticles.get(body.id)!
        if (body.orbitRadius > 0) {
          const angle = body.startAngle + elapsed * body.orbitSpeed * 0.13
          mesh.position.set(Math.cos(angle) * body.orbitRadius, 0, Math.sin(angle) * body.orbitRadius)
        }
        reticle.position.copy(mesh.position)
        mesh.rotation.y += delta * body.rotationSpeed * (pausedRef.current ? 0 : speedRef.current)
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          const selected = selectedRef.current === body.id
          mesh.material.emissiveIntensity = THREE.MathUtils.lerp(mesh.material.emissiveIntensity, selected ? 1.5 : 1, 0.07)
        }
        const isolateTarget = selectedRef.current !== null && phaseRef.current !== 'flying'
        mesh.visible = !isolateTarget || selectedRef.current === body.id
        const reticleMaterial = reticle.material as THREE.SpriteMaterial
        const scanning = phaseRef.current === 'scanning' && selectedRef.current === body.id
        const targetOpacity = scanning ? 0.72 + Math.sin(time * 0.012) * 0.2 : 0
        reticleMaterial.opacity = THREE.MathUtils.lerp(reticleMaterial.opacity, targetOpacity, scanning ? 0.18 : 0.12)
        if (scanning && !reducedMotion) reticleMaterial.rotation -= delta * 0.42
      }

      const isolateTarget = selectedRef.current !== null && phaseRef.current !== 'flying'
      sunGlow.visible = !isolateTarget || selectedRef.current === 'sun'
      planetOrbitMaterials.forEach((material) => {
        material.opacity = THREE.MathUtils.lerp(material.opacity, isolateTarget ? 0.018 : 0.13, 0.08)
      })

      satelliteSystems.forEach((satelliteSystem, parentId) => {
        satelliteSystem.position.copy(bodyMeshes.get(parentId)!.position)
        satelliteSystem.visible = selectedRef.current === parentId
          && (phaseRef.current === 'scanning' || phaseRef.current === 'focused' || Boolean(selectedSatelliteRef.current))
      })

      satelliteRuntimes.forEach((runtime) => {
        const { satellite } = runtime
        const parentBody = SOLAR_BODIES.find((body) => body.id === satellite.parentId)!
        const targetScale = getSatelliteSceneScale(satellite, parentBody, scaleModeRef.current)
        const scaleEase = reducedMotion ? 1 : 0.075
        runtime.currentOrbitRadius = THREE.MathUtils.lerp(runtime.currentOrbitRadius, targetScale.orbitRadius, scaleEase)
        runtime.currentRadius = THREE.MathUtils.lerp(runtime.currentRadius, targetScale.radius, scaleEase)
        runtime.orbit.scale.setScalar(runtime.currentOrbitRadius)

        const direction = satellite.retrograde ? -1 : 1
        const angle = satellite.startAngle + elapsed * satellite.orbitSpeed * 0.42 * direction
        const orbitY = Math.sin(angle) * Math.sin(satellite.inclination) * runtime.currentOrbitRadius
        const orbitZ = Math.sin(angle) * Math.cos(satellite.inclination) * runtime.currentOrbitRadius
        runtime.root.position.set(Math.cos(angle) * runtime.currentOrbitRadius, orbitY, orbitZ)
        runtime.hitProxy.position.copy(runtime.root.position)
        runtime.reticle.position.copy(runtime.root.position)
        runtime.root.scale.setScalar(runtime.currentRadius)
        runtime.hitProxy.scale.setScalar(Math.max(runtime.currentRadius * 1.25, scaleModeRef.current === 'real' ? 0.17 : 0.12))
        runtime.reticle.scale.setScalar(Math.max(runtime.currentRadius * 4.3, 0.54))

        const parentActive = selectedRef.current === satellite.parentId
          && (phaseRef.current === 'scanning' || phaseRef.current === 'focused' || selectedSatelliteRef.current === satellite.id)
        if (parentActive || selectedSatelliteRef.current === satellite.id) ensureSatelliteTexture(runtime)
        const selected = selectedSatelliteRef.current === satellite.id
        const siblingDimmed = Boolean(selectedSatelliteRef.current) && !selected
        const surfaceOpacity = parentActive ? (siblingDimmed ? 0.16 : 1) : 0
        runtime.material.opacity = THREE.MathUtils.lerp(runtime.material.opacity, surfaceOpacity, 0.1)
        runtime.material.emissiveIntensity = satellite.phenomenon === 'volcanic'
          ? (0.42 + Math.sin(time * 0.004) * 0.08) * qualitySettings.effectIntensity
          : selected ? 1.08 : 0.86
        runtime.hitProxy.visible = parentActive && phaseRef.current === 'focused'
        runtime.orbitMaterial.opacity = THREE.MathUtils.lerp(runtime.orbitMaterial.opacity, parentActive ? (siblingDimmed ? 0.035 : 0.15) : 0.01, 0.09)
        runtime.root.rotation.y += pausedRef.current || reducedMotion ? 0 : delta * (satellite.phenomenon === 'irregular' ? 0.26 : 0.08)
        if (runtime.plume && !reducedMotion) runtime.plume.rotation.y += delta * 0.18

        runtime.effectMaterials.forEach((material, index) => {
          if (!('opacity' in material)) return
          let effectOpacity = 0
          if (parentActive && !siblingDimmed) {
            if (satellite.phenomenon === 'earthshine') effectOpacity = 0.13
            if (satellite.phenomenon === 'haze') effectOpacity = index === 0 ? 0.17 : 0.055
            if (satellite.phenomenon === 'volcanic') effectOpacity = 0.22 + Math.sin(time * 0.005) * 0.04
            if (satellite.phenomenon === 'plume') effectOpacity = 0.42
          }
          material.opacity = THREE.MathUtils.lerp(material.opacity, effectOpacity * qualitySettings.effectIntensity, 0.1)
        })

        const reticleActive = selected && parentActive && (phaseRef.current === 'scanning' || phaseRef.current === 'focused')
        const reticleOpacity = reticleActive
          ? phaseRef.current === 'scanning' ? 0.78 + Math.sin(time * 0.012) * 0.17 : 0.32
          : 0
        runtime.reticleMaterial.opacity = THREE.MathUtils.lerp(runtime.reticleMaterial.opacity, reticleOpacity, 0.14)
        if (reticleActive && !reducedMotion) runtime.reticleMaterial.rotation += delta * 0.55
      })

      if (selectedRef.current !== activeSelectedId || selectedSatelliteRef.current !== activeSelectedSatelliteId) {
        activeSelectedId = selectedRef.current
        activeSelectedSatelliteId = selectedSatelliteRef.current
        transitionStartedAt = time
        transitionActive = true
        arrivalReported = false
        transitionStartCamera.copy(camera.position)
        transitionStartTarget.copy(controls.target)
        previousFocusTarget.set(Number.NaN, Number.NaN, Number.NaN)
        const body = activeSelectedId ? SOLAR_BODIES.find((candidate) => candidate.id === activeSelectedId)! : null
        const satellite = activeSelectedSatelliteId ? satelliteRuntimes.get(activeSelectedSatelliteId)?.satellite : null
        transitionDuration = reducedMotion ? 0.05 : satellite?.camera.duration ?? body?.camera.duration ?? 1.7
        controls.enabled = false
      }

      const selectedBody = activeSelectedId ? SOLAR_BODIES.find((body) => body.id === activeSelectedId)! : null
      const selectedMesh = activeSelectedId ? bodyMeshes.get(activeSelectedId)! : null
      const selectedSatelliteRuntime = activeSelectedSatelliteId ? satelliteRuntimes.get(activeSelectedSatelliteId) ?? null : null
      if (selectedBody && selectedMesh) {
        if (selectedSatelliteRuntime) {
          selectedSatelliteRuntime.root.getWorldPosition(focusTarget)
          selectedMesh.getWorldPosition(parentFocusTarget)
          const preset = selectedSatelliteRuntime.satellite.camera
          viewDirection.copy(focusTarget).sub(parentFocusTarget)
          if (viewDirection.lengthSq() < 0.001) viewDirection.set(0, 0, 1)
          viewDirection.normalize().applyAxisAngle(up, preset.azimuth)
          viewDirection.y += Math.sin(preset.elevation)
          viewDirection.normalize()
          desiredCamera.copy(focusTarget).addScaledVector(viewDirection, preset.distance)
          desiredTarget.copy(focusTarget)
        } else if (selectedBody.id === 'sun') {
          selectedMesh.getWorldPosition(focusTarget)
          const preset = selectedBody.camera
          viewDirection.set(
            Math.sin(preset.azimuth) * Math.cos(preset.elevation),
            Math.sin(preset.elevation),
            Math.cos(preset.azimuth) * Math.cos(preset.elevation),
          ).normalize()
          desiredCamera.copy(focusTarget).addScaledVector(viewDirection, preset.distance)
          viewRight.copy(focusTarget).sub(desiredCamera).normalize().cross(up).normalize()
          desiredTarget.copy(focusTarget)
            .addScaledVector(viewRight, preset.horizontalOffset * selectedBody.radius * 1.35)
          desiredTarget.y += preset.targetHeight
        } else {
          selectedMesh.getWorldPosition(focusTarget)
          const preset = selectedBody.camera
          viewDirection.copy(focusTarget).multiplyScalar(-1)
          viewDirection.y = 0
          viewDirection.normalize().applyAxisAngle(up, preset.azimuth)
          viewDirection.y = Math.sin(preset.elevation)
          viewDirection.normalize()
          desiredCamera.copy(focusTarget).addScaledVector(viewDirection, preset.distance)
          viewRight.copy(focusTarget).sub(desiredCamera).normalize().cross(up).normalize()
          desiredTarget.copy(focusTarget)
            .addScaledVector(viewRight, preset.horizontalOffset * selectedBody.radius * 1.35)
          desiredTarget.y += preset.targetHeight
        }

        if (transitionActive) {
          const progress = Math.min(1, (time - transitionStartedAt) / (transitionDuration * 1000))
          const eased = easeInOutCubic(progress)
          camera.position.lerpVectors(transitionStartCamera, desiredCamera, eased)
          controls.target.lerpVectors(transitionStartTarget, desiredTarget, eased)
          if (progress >= 1) {
            transitionActive = false
            previousFocusTarget.copy(focusTarget)
            if (!arrivalReported) {
              arrivalReported = true
              callbacksRef.current.onCameraArrived(selectedBody.id, selectedSatelliteRuntime?.satellite.id)
            }
          }
        } else {
          if (Number.isFinite(previousFocusTarget.x)) {
            focusMovement.copy(focusTarget).sub(previousFocusTarget)
            camera.position.add(focusMovement)
            controls.target.add(focusMovement)
          }
          previousFocusTarget.copy(focusTarget)
        }
        controls.enabled = !transitionActive && phaseRef.current === 'focused'
        if (selectedSatelliteRuntime) {
          controls.minDistance = Math.max(0.26, selectedSatelliteRuntime.currentRadius * 2.2)
          controls.maxDistance = 4.5
        } else {
          controls.minDistance = Math.max(0.72, selectedBody.radius * 1.9)
          controls.maxDistance = Math.max(8, selectedBody.camera.distance * 2.4)
        }
      } else if (transitionActive) {
        const progress = Math.min(1, (time - transitionStartedAt) / (transitionDuration * 1000))
        const eased = easeInOutCubic(progress)
        camera.position.lerpVectors(transitionStartCamera, overviewPosition, eased)
        controls.target.lerpVectors(transitionStartTarget, overviewTarget, eased)
        if (progress >= 1) {
          transitionActive = false
          controls.enabled = true
          controls.minDistance = 6
          controls.maxDistance = 46
        }
      }

      controls.update()
      observationFill.intensity = THREE.MathUtils.lerp(observationFill.intensity, selectedSatelliteRef.current ? 0.72 : 0.12, 0.08)
      observationFill.position.copy(camera.position)
      observationFill.target.position.copy(controls.target)
      system.rotation.y += pausedRef.current || reducedMotion ? 0 : delta * 0.0015
      if (earthClouds && !pausedRef.current && !reducedMotion) earthClouds.rotation.y += delta * 0.012 * speedRef.current
      if (!reducedMotion) sky.rotation.y += delta * 0.0003
      renderer.render(scene, camera)

      frameCounter += 1
      if (frameCounter % 60 === 0) {
        const elapsedWindow = performance.now() - fpsWindowStart
        const fps = Math.round(60000 / Math.max(elapsedWindow, 1))
        fpsWindowStart = performance.now()
        mount.dataset.renderStats = `${fps} fps · ${renderer.info.render.calls} calls · ${renderer.info.render.triangles} triangles · ${renderer.info.memory.geometries} geometries · ${renderer.info.memory.textures} textures`
        if (fps < 45) lowFpsWindows += 1
        else lowFpsWindows = Math.max(0, lowFpsWindows - 1)
        if (lowFpsWindows >= 3 && performance.now() - lastDegradeAt > 20000) {
          lastDegradeAt = performance.now()
          lowFpsWindows = 0
          if (quality === 'high') callbacksRef.current.onPerformanceDegrade('balanced', fps)
          if (quality === 'balanced') callbacksRef.current.onPerformanceDegrade('low', fps)
        }
      }
    }
    render()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('wheel', onWheel)
      document.removeEventListener('visibilitychange', onVisibility)
      delete diagnosticsWindow.__THREE_OBSERVATORY_DIAGNOSTICS__
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) object.geometry?.dispose()
        if ('material' in object) {
          const owned = object as THREE.Object3D & { material?: THREE.Material | THREE.Material[] }
          const materials = Array.isArray(owned.material) ? owned.material : owned.material ? [owned.material] : []
          materials.forEach((material) => material.dispose())
        }
      })
      textures.forEach((texture) => texture.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [quality, reducedMotion])

  return <div ref={mountRef} className="solar-system-scene" aria-label="可交互太阳系模型" />
}
