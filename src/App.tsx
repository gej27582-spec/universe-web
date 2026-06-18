import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { getCelestialBody, PLANETS, SOLAR_BODIES } from './lib/solarSystem'

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
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(1)
  const appRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const selectedBody = useMemo(() => getCelestialBody(selectedId), [selectedId])
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
    if (!selectedBody || !appRef.current) return
    const context = gsap.context(() => {
      gsap.fromTo('.planet-detail > *', { opacity: 0, x: 12 }, {
        opacity: 1,
        x: 0,
        duration: reducedMotion ? 0 : 0.55,
        stagger: reducedMotion ? 0 : 0.055,
        ease: 'power3.out',
      })
    }, appRef)
    return () => context.revert()
  }, [selectedBody, reducedMotion])

  const selectBody = useCallback((id: string) => setSelectedId(id), [])

  return (
    <div ref={appRef} className={`observatory ${ready ? 'phase-exploring' : 'phase-booting'} ${selectedBody ? 'has-selection' : ''}`}>
      <Suspense fallback={null}>
        <SolarSystemScene
          selectedId={selectedId}
          paused={paused}
          speed={speed}
          reducedMotion={reducedMotion}
          onSelect={selectBody}
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
            <button className="identity" type="button" onClick={() => setSelectedId(null)} aria-label="返回太阳系全景">
              <span className="brand-mark" aria-hidden="true"><i /><i /></span>
              <span>深空观测站<small>DEEP SPACE OBSERVATORY</small></span>
            </button>
            <button className="sound-state" type="button" aria-pressed="false" title="声音功能预留，当前关闭">
              SOUND&nbsp;&nbsp;—&nbsp;&nbsp;OFF
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
                <li key={body.id}>
                  <button
                    type="button"
                    className={selectedId === body.id ? 'active' : ''}
                    onClick={() => selectBody(body.id)}
                    aria-pressed={selectedId === body.id}
                  >
                    <i style={{ '--body-color': body.baseColor } as React.CSSProperties} />
                    <span>{body.nameZh}<small>{body.nameEn}</small></span>
                    <em>{String(index).padStart(2, '0')}</em>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div className="wander-hint" aria-hidden="true">
            <span>拖动旋转 · 滚轮缩放 · 点击天体<small>DRAG · ZOOM · SELECT</small></span><i />
          </div>

          {selectedBody ? (
            <aside className="planet-detail" aria-live="polite">
              <header>
                <span>{selectedBody.typeZh}</span>
                <small>{selectedBody.typeEn}</small>
                <button type="button" onClick={() => setSelectedId(null)} aria-label="关闭天体信息">关闭</button>
              </header>
              <h2>{selectedBody.nameZh}<small>{selectedBody.nameEn}</small></h2>
              <p>{selectedBody.description}</p>
              <dl>
                <div><dt>直径</dt><dd>{selectedBody.diameter}</dd></div>
                <div><dt>自转周期</dt><dd>{selectedBody.dayLength}</dd></div>
                <div><dt>公转周期</dt><dd>{selectedBody.yearLength}</dd></div>
                <div><dt>温度</dt><dd>{selectedBody.temperature}</dd></div>
              </dl>
            </aside>
          ) : null}

          <section className="time-controls" aria-label="轨道时间控制">
            <button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>
              {paused ? '继续运行' : '暂停轨道'}<small>{paused ? 'RESUME' : 'PAUSE'}</small>
            </button>
            <span aria-hidden="true" />
            <button type="button" onClick={() => setSpeedIndex((value) => (value + 1) % SPEEDS.length)}>
              时间速度 <strong>{speed}×</strong><small>TIME SCALE</small>
            </button>
            {selectedBody ? (
              <button type="button" onClick={() => setSelectedId(null)}>返回全景<small>OVERVIEW</small></button>
            ) : null}
          </section>

          <footer className="system-line">
            <span>SOL · 01</span><i /><span>{paused ? 'ORBIT PAUSED' : `ORBIT SIMULATION ${speed}×`}</span>
            <b>{PLANETS.length} PLANETS</b>
          </footer>
        </main>
      )}
    </div>
  )
}
