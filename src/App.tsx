import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import gsap from 'gsap'
import ObservationPanel from './components/ObservationPanel'
import { useSoundscape } from './hooks/useSoundscape'
import { getSystemStatus, initialObservationState, observationReducer } from './lib/observationState'
import { getSatellite, getSatellitesForParent, SATELLITES, type SatelliteId, type ScaleMode } from './lib/satellites'
import { getCelestialBody, PLANETS, SOLAR_BODIES, type CelestialBodyId } from './lib/solarSystem'

const SolarSystemScene = lazy(() => import('./components/SolarSystemScene'))
const SPEEDS = [0.5, 1, 4]

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(1)
  const [observation, dispatch] = useReducer(observationReducer, initialObservationState)
  const appRef = useRef<HTMLDivElement>(null)
  const previousPhaseRef = useRef(observation.phase)
  const reducedMotion = useReducedMotion()
  const selectedBody = useMemo(() => getCelestialBody(observation.selectedId), [observation.selectedId])
  const selectedSatellite = useMemo(() => getSatellite(observation.selectedSatelliteId), [observation.selectedSatelliteId])
  const selectedBodySatellites = useMemo(
    () => observation.selectedId ? getSatellitesForParent(observation.selectedId) : [],
    [observation.selectedId],
  )
  const soundscape = useSoundscape()
  const speed = SPEEDS[speedIndex]

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), reducedMotion ? 180 : 1450)
    return () => window.clearTimeout(timer)
  }, [reducedMotion])

  useEffect(() => {
    if (!ready || !appRef.current) return
    const context = gsap.context(() => {
      gsap.fromTo('.interface-layer', { opacity: 0 }, { opacity: 1, duration: reducedMotion ? 0 : 1.05, ease: 'power2.out' })
    }, appRef)
    return () => context.revert()
  }, [ready, reducedMotion])

  useEffect(() => {
    if (observation.phase !== 'focused' || !appRef.current) return
    const context = gsap.context(() => {
      gsap.fromTo('.planet-detail > *', { opacity: 0, x: 12 }, {
        opacity: 1,
        x: 0,
        duration: reducedMotion ? 0 : 0.5,
        stagger: reducedMotion ? 0 : 0.045,
        ease: 'power3.out',
      })
    }, appRef)
    return () => context.revert()
  }, [observation.phase, observation.selectedId, observation.selectedSatelliteId, reducedMotion])

  useEffect(() => {
    if (observation.phase !== 'scanning' || !observation.selectedId) return
    const id = observation.selectedId
    const satelliteId = observation.selectedSatelliteId ?? undefined
    const timer = window.setTimeout(
      () => dispatch({ type: 'scan-complete', id, satelliteId }),
      reducedMotion ? 80 : 1400,
    )
    return () => window.clearTimeout(timer)
  }, [observation.phase, observation.selectedId, observation.selectedSatelliteId, reducedMotion])

  useEffect(() => {
    const previous = previousPhaseRef.current
    if (observation.phase === 'flying' && previous !== 'flying') soundscape.playCue('flyby')
    if (observation.phase === 'focused' && previous === 'scanning') soundscape.playCue('lock')
    previousPhaseRef.current = observation.phase
  }, [observation.phase, soundscape.playCue])

  useEffect(() => {
    if (!observation.cruiseActive || observation.phase !== 'focused' || !observation.selectedId) return
    const index = SOLAR_BODIES.findIndex((body) => body.id === observation.selectedId)
    const next = SOLAR_BODIES[(index + 1) % SOLAR_BODIES.length]
    const timer = window.setTimeout(
      () => dispatch({ type: 'select', id: next.id, source: 'cruise' }),
      reducedMotion ? 900 : 3000,
    )
    return () => window.clearTimeout(timer)
  }, [observation.cruiseActive, observation.phase, observation.selectedId, reducedMotion])

  const selectBody = useCallback((id: CelestialBodyId) => {
    dispatch({ type: 'select', id, source: 'manual' })
  }, [])

  const returnOverview = useCallback(() => dispatch({ type: 'overview' }), [])
  const closeDetails = useCallback(() => {
    dispatch({ type: observation.selectedSatelliteId ? 'return-parent' : 'overview' })
  }, [observation.selectedSatelliteId])

  const toggleCruise = useCallback(() => {
    if (observation.cruiseActive) {
      dispatch({ type: 'stop-cruise' })
      return
    }
    dispatch({ type: 'start-cruise' })
    dispatch({ type: 'select', id: 'sun', source: 'cruise' })
  }, [observation.cruiseActive])

  const onCameraArrived = useCallback((id: CelestialBodyId, satelliteId?: SatelliteId) => {
    dispatch({ type: 'camera-arrived', id, satelliteId })
  }, [])

  const onSatelliteSelect = useCallback((id: SatelliteId) => {
    dispatch({ type: 'select-satellite', id })
  }, [])

  const onScaleModeChange = useCallback((mode: ScaleMode) => {
    dispatch({ type: 'set-scale-mode', mode })
  }, [])

  const stopCruiseOnInteraction = useCallback(() => {
    dispatch({ type: 'stop-cruise' })
  }, [])

  const systemStatus = getSystemStatus(observation)

  return (
    <div
      ref={appRef}
      className={`observatory ${ready ? 'phase-exploring' : 'phase-booting'} phase-${observation.phase} ${selectedBody ? 'has-selection' : ''} ${selectedSatellite ? 'has-satellite-selection' : ''} ${observation.cruiseActive ? 'is-cruising' : ''}`}
    >
      <Suspense fallback={null}>
        <SolarSystemScene
          selectedId={observation.selectedId}
          selectedSatelliteId={observation.selectedSatelliteId}
          scaleMode={observation.scaleMode}
          phase={observation.phase}
          paused={paused}
          speed={speed}
          reducedMotion={reducedMotion}
          onSelect={selectBody}
          onSatelliteSelect={onSatelliteSelect}
          onCameraArrived={onCameraArrived}
          onUserInteraction={stopCruiseOnInteraction}
        />
      </Suspense>
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {!ready ? (
        <section className="boot-screen" aria-live="polite">
          <span className="brand-mark" aria-hidden="true"><i /><i /></span>
          <p>深空观测站</p>
          <small>DEEP SPACE OBSERVATORY</small>
          <span className="boot-line"><i /></span>
          <em>正在同步行星轨道 / SYNCHRONIZING ORBITS</em>
        </section>
      ) : (
        <main className="interface-layer">
          <header className="site-header">
            <button className="identity" type="button" onClick={returnOverview} aria-label="返回太阳系全景">
              <span className="brand-mark" aria-hidden="true"><i /><i /></span>
              <span>深空观测站<small>DEEP SPACE OBSERVATORY</small></span>
            </button>
            <button
              className={`sound-state ${soundscape.status === 'on' ? 'active' : ''}`}
              type="button"
              aria-pressed={soundscape.status === 'on'}
              disabled={soundscape.status === 'unavailable' || soundscape.status === 'loading'}
              data-audio-error={soundscape.errorName ?? undefined}
              title={soundscape.status === 'unavailable' ? '音频素材加载失败' : '艺术化环境音景，并非真实太空声音'}
              onClick={soundscape.toggle}
            >
              SOUND&nbsp;&nbsp;—&nbsp;&nbsp;{soundscape.status === 'on' ? 'ON' : soundscape.status === 'loading' ? 'LOADING' : soundscape.status === 'unavailable' ? 'N/A' : 'OFF'}
            </button>
          </header>

          {!selectedBody ? (
            <section className="observation-copy" aria-label="太阳系说明">
              <p>太阳系：从一颗恒星开始的八个世界。</p>
              <small>ONE STAR. EIGHT WORLDS. A SINGLE GRAVITATIONAL HOME.</small>
              <code>SOL SYSTEM · LOCAL INTERSTELLAR CLOUD</code>
            </section>
          ) : null}

          <nav className="celestial-index" aria-label="太阳系天体索引">
            <header><span>天体索引</span><small>CELESTIAL INDEX</small></header>
            <ol>
              {SOLAR_BODIES.map((body, index) => (
                <li key={body.id} className={observation.selectedId === body.id ? 'expanded' : ''}>
                  <button
                    type="button"
                    className={observation.selectedId === body.id ? 'active' : ''}
                    onClick={() => selectBody(body.id)}
                    aria-pressed={observation.selectedId === body.id}
                  >
                    <i style={{ '--body-color': body.baseColor } as React.CSSProperties} />
                    <span>{body.nameZh}<small>{body.nameEn}</small></span>
                    <em>{String(index).padStart(2, '0')}</em>
                  </button>
                  {observation.selectedId === body.id && getSatellitesForParent(body.id).length ? (
                    <ul className="satellite-index" aria-label={`${body.nameZh}卫星`}>
                      {getSatellitesForParent(body.id).map((satellite) => (
                        <li key={satellite.id}>
                          <button
                            type="button"
                            className={observation.selectedSatelliteId === satellite.id ? 'active' : ''}
                            aria-pressed={observation.selectedSatelliteId === satellite.id}
                            onClick={() => onSatelliteSelect(satellite.id)}
                            disabled={observation.phase !== 'focused'}
                          >
                            <i style={{ '--body-color': `#${satellite.color.toString(16).padStart(6, '0')}` } as React.CSSProperties} />
                            <span>{satellite.nameZh}<small>{satellite.nameEn}</small></span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
          </nav>

          <div className="wander-hint" aria-hidden="true">
            <span>拖动旋转 · 滚轮缩放 · 点击天体<small>DRAG · ZOOM · SELECT</small></span><i />
          </div>

          {observation.phase === 'scanning' && selectedBody ? (
            <div className="scan-status" aria-live="polite">
              <span>ACQUIRING</span><span>ANALYZING</span><span>TARGET LOCKED</span>
              <small>{selectedSatellite ? `${selectedBody.nameEn} / ${selectedSatellite.nameEn}` : selectedBody.observationCode}</small>
            </div>
          ) : null}

          {selectedBody && observation.phase === 'focused' ? (
            <ObservationPanel
              key={`${selectedBody.id}:${selectedSatellite?.id ?? 'body'}`}
              body={selectedBody}
              satellite={selectedSatellite}
              satellites={selectedBodySatellites}
              scaleMode={observation.scaleMode}
              onClose={closeDetails}
              onSatelliteSelect={onSatelliteSelect}
              onScaleModeChange={onScaleModeChange}
            />
          ) : null}

          <section className="time-controls" aria-label="轨道与观测控制">
            <button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>
              {paused ? '继续运行' : '暂停轨道'}<small>{paused ? 'RESUME' : 'PAUSE'}</small>
            </button>
            <span aria-hidden="true" />
            <button type="button" onClick={() => setSpeedIndex((value) => (value + 1) % SPEEDS.length)}>
              时间速度 <strong>{speed}×</strong><small>TIME SCALE</small>
            </button>
            <button type="button" className={observation.cruiseActive ? 'active' : ''} onClick={toggleCruise} aria-pressed={observation.cruiseActive}>
              {observation.cruiseActive ? '停止巡航' : '自动巡航'}<small>{observation.cruiseActive ? 'STOP TOUR' : 'AUTO TOUR'}</small>
            </button>
            {selectedBodySatellites.length ? (
              <button type="button" className={observation.scaleMode === 'real' ? 'active' : ''} onClick={() => onScaleModeChange(observation.scaleMode === 'display' ? 'real' : 'display')}>
                比例 {observation.scaleMode === 'display' ? '展示' : '真实'}<small>LOCAL SCALE</small>
              </button>
            ) : null}
            {selectedBody ? (
              <button type="button" onClick={selectedSatellite ? closeDetails : returnOverview}>{selectedSatellite ? '返回母星' : '返回全景'}<small>{selectedSatellite ? 'PARENT' : 'OVERVIEW'}</small></button>
            ) : null}
          </section>

          <footer className="system-line">
            <span>SOL · 01</span><i /><span>{paused ? 'ORBIT PAUSED' : `${systemStatus} ${speed}×`}</span>
            <b>{observation.cruiseActive ? 'SEQUENCE 00—08' : `${PLANETS.length} PLANETS · ${SATELLITES.length} SATELLITES`}</b>
          </footer>
        </main>
      )}
    </div>
  )
}
