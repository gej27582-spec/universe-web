import { lazy, Suspense, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import gsap from 'gsap'
import ObservationPanel from './components/ObservationPanel'
import { useSoundscape } from './hooks/useSoundscape'
import { getSystemStatus, initialObservationState, observationReducer } from './lib/observationState'
import { getSatellite, getSatellitesForParent, SATELLITES, type SatelliteId, type ScaleMode } from './lib/satellites'
import { UI_TEXT } from './lib/observatoryText.zh'
import {
  getBodiesForRegion,
  getCelestialBody,
  OBSERVATION_REGIONS,
  PLANETS,
  SOLAR_BODIES,
  type CelestialBodyId,
  type ObservationRegionId,
} from './lib/solarSystem'

const SolarSystemScene = lazy(() => import('./components/SolarSystemScene'))
const SPEEDS = [0.5, 1, 4]
const SATELLITE_GUIDE_STORAGE_KEY = 'deep-space-observatory-satellite-guide-seen'

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

function readGuideDismissed() {
  try {
    return window.localStorage.getItem(SATELLITE_GUIDE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(1)
  const [guideDismissed, setGuideDismissed] = useState(readGuideDismissed)
  const [regionId, setRegionId] = useState<ObservationRegionId>('solar-system')
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
  const visibleBodies = useMemo(() => getBodiesForRegion(regionId), [regionId])
  const activeRegion = OBSERVATION_REGIONS.find((region) => region.id === regionId)!
  const soundscape = useSoundscape()
  const speed = SPEEDS[speedIndex]
  const showSatelliteGuide = Boolean(
    selectedBody
    && selectedBodySatellites.length
    && observation.phase === 'focused'
    && !selectedSatellite
    && !guideDismissed,
  )

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
    if (selectedBody && selectedBody.regionId !== regionId) setRegionId(selectedBody.regionId)
  }, [selectedBody, regionId])

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

  const switchRegion = useCallback((id: ObservationRegionId) => {
    setRegionId(id)
    dispatch({ type: 'overview' })
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
    dispatch({ type: 'select', id: regionId === 'outer-solar-system' ? 'pluto' : 'sun', source: 'cruise' })
  }, [observation.cruiseActive, regionId])

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

  const dismissSatelliteGuide = useCallback(() => {
    setGuideDismissed(true)
    try {
      window.localStorage.setItem(SATELLITE_GUIDE_STORAGE_KEY, 'true')
    } catch {
      // Ignore unavailable localStorage; the current session state is already updated.
    }
  }, [])

  const systemStatus = getSystemStatus(observation)

  return (
    <div
      ref={appRef}
      className={`observatory quality-high ${ready ? 'phase-exploring' : 'phase-booting'} phase-${observation.phase} ${selectedBody ? 'has-selection' : ''} ${selectedSatellite ? 'has-satellite-selection' : ''} ${observation.cruiseActive ? 'is-cruising' : ''}`}
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
          <p>{UI_TEXT.app.brandZh}</p>
          <small>{UI_TEXT.app.brandEn}</small>
          <span className="boot-line"><i /></span>
          <em>{UI_TEXT.app.bootStatus}</em>
        </section>
      ) : (
        <main className="interface-layer">
          <header className="site-header">
            <button className="identity" type="button" onClick={returnOverview} aria-label={UI_TEXT.app.returnCurrentRegion}>
              <span className="brand-mark" aria-hidden="true"><i /><i /></span>
              <span>{UI_TEXT.app.brandZh}<small>{UI_TEXT.app.brandEn}</small></span>
            </button>
            <div className="header-tools" aria-label={UI_TEXT.app.headerSettingsLabel}>
              <button
                className={`sound-state ${soundscape.status === 'on' ? 'active' : ''}`}
                type="button"
                aria-pressed={soundscape.status === 'on'}
                disabled={soundscape.status === 'unavailable' || soundscape.status === 'loading'}
                data-audio-error={soundscape.errorName ?? undefined}
                title={soundscape.status === 'unavailable' ? UI_TEXT.app.soundUnavailable : UI_TEXT.app.soundTitle}
                onClick={soundscape.toggle}
              >
                SOUND&nbsp;&nbsp;—&nbsp;&nbsp;{soundscape.status === 'on' ? 'ON' : soundscape.status === 'loading' ? 'LOADING' : soundscape.status === 'unavailable' ? 'N/A' : 'OFF'}
              </button>
            </div>
          </header>

          <nav className="region-switcher" aria-label={UI_TEXT.app.regionSwitcherLabel}>
            {OBSERVATION_REGIONS.map((region) => (
              <button
                key={region.id}
                type="button"
                className={regionId === region.id ? 'active' : ''}
                aria-pressed={regionId === region.id}
                onClick={() => switchRegion(region.id)}
              >
                {region.nameZh}<small>{region.nameEn}</small>
              </button>
            ))}
          </nav>

          {!selectedBody ? (
            <section className="observation-copy" aria-label={UI_TEXT.app.regionDescriptionLabel}>
              <p>{activeRegion.description}</p>
              <small>{activeRegion.nameEn}</small>
              <code>{regionId === 'outer-solar-system' ? 'KUIPER BELT · SMALL BODIES · COMETARY RESERVOIR' : 'SOL SYSTEM · LOCAL INTERSTELLAR CLOUD'}</code>
            </section>
          ) : null}

          <nav className="celestial-index" aria-label={UI_TEXT.app.celestialIndex}>
            <header><span>{activeRegion.nameZh}</span><small>{activeRegion.nameEn}</small></header>
            <ol>
              {visibleBodies.map((body, index) => (
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
                    <ul className="satellite-index" aria-label={`${body.nameZh}${UI_TEXT.panel.naturalSatellite}`}>
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
            <span>{UI_TEXT.app.interactionHint}<small>{UI_TEXT.app.interactionHintDetail}</small></span><i />
          </div>

          {showSatelliteGuide ? (
            <aside className="satellite-guide" aria-live="polite">
              <span>{UI_TEXT.app.satelliteGuideTitle}</span>
              <p>{UI_TEXT.app.satelliteGuideBody}</p>
              <button type="button" onClick={dismissSatelliteGuide}>{UI_TEXT.app.gotIt}</button>
            </aside>
          ) : null}

          <aside className="orientation-hint" aria-live="polite">
            <strong>{UI_TEXT.app.landscapeTitle}</strong>
            <span>{UI_TEXT.app.landscapeBody}</span>
          </aside>

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

          <section className="time-controls" aria-label={UI_TEXT.app.orbitControlLabel}>
            <button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>
              {paused ? UI_TEXT.app.resumeOrbit : UI_TEXT.app.pauseOrbit}<small>{paused ? 'RESUME' : 'PAUSE'}</small>
            </button>
            <span aria-hidden="true" />
            <button type="button" onClick={() => setSpeedIndex((value) => (value + 1) % SPEEDS.length)}>
              {UI_TEXT.app.timeSpeed} <strong>{speed}×</strong><small>TIME SCALE</small>
            </button>
            <button type="button" className={observation.cruiseActive ? 'active' : ''} onClick={toggleCruise} aria-pressed={observation.cruiseActive}>
              {observation.cruiseActive ? UI_TEXT.app.stopCruise : UI_TEXT.app.autoCruise}<small>{observation.cruiseActive ? 'STOP TOUR' : 'AUTO TOUR'}</small>
            </button>
            {selectedBodySatellites.length ? (
              <button type="button" className={observation.scaleMode === 'real' ? 'active' : ''} onClick={() => onScaleModeChange(observation.scaleMode === 'display' ? 'real' : 'display')}>
                {UI_TEXT.app.scaleButton} {observation.scaleMode === 'display' ? UI_TEXT.app.display : UI_TEXT.app.real}<small>LOCAL SCALE</small>
              </button>
            ) : null}
            {selectedBody ? (
              <button type="button" onClick={selectedSatellite ? closeDetails : returnOverview}>{selectedSatellite ? UI_TEXT.app.returnParent : UI_TEXT.app.returnOverview}<small>{selectedSatellite ? 'PARENT' : 'OVERVIEW'}</small></button>
            ) : null}
          </section>

          <footer className="system-line">
            <span>{regionId === 'outer-solar-system' ? 'EDGE · 02' : 'SOL · 01'}</span><i /><span>{paused ? 'ORBIT PAUSED' : `${systemStatus} ${speed}×`}</span>
            <b>{observation.cruiseActive ? 'SEQUENCE ACTIVE' : `${PLANETS.length} PLANETS · ${SATELLITES.length} SATELLITES · ${SOLAR_BODIES.length - PLANETS.length - 1} EDGE TARGETS`}</b>
          </footer>
        </main>
      )}
    </div>
  )
}
