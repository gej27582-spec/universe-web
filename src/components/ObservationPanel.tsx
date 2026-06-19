import { useState } from 'react'
import { JUPITER_MOONS, type JupiterMoon, type JupiterMoonId } from '../lib/jupiterMoons'
import type { CelestialBody } from '../lib/solarSystem'

type PanelTab = 'overview' | 'metrics' | 'compare'

interface ObservationPanelProps {
  body: CelestialBody
  moon: JupiterMoon | null
  onClose: () => void
  onMoonSelect: (id: JupiterMoonId) => void
}

const EARTH_DIAMETER = 12742
const EARTH_DAY = 23.934
const EARTH_YEAR = 365.25

function ratio(value: number, reference: number) {
  const result = value / reference
  if (result === 1) return '1.00×'
  if (result >= 10) return `${result.toFixed(1)}×`
  if (result >= 1) return `${result.toFixed(2)}×`
  return `${result.toFixed(3)}×`
}

function CompareView({ body }: { body: CelestialBody }) {
  const bodyRatio = body.diameterKm / EARTH_DIAMETER
  const maxRatio = Math.max(1, bodyRatio)
  const bodySize = Math.max(9, (bodyRatio / maxRatio) * 94)
  const earthSize = Math.max(9, (1 / maxRatio) * 94)

  return (
    <div className="compare-view">
      <div className="scale-figure" aria-label={`${body.nameZh}与地球直径轮廓对比`}>
        <span className="scale-body" style={{ width: bodySize, height: bodySize, borderColor: body.baseColor }}>
          <i>{body.nameEn}</i>
        </span>
        <span className="scale-earth" style={{ width: earthSize, height: earthSize }}><i>EARTH</i></span>
      </div>
      <dl className="compare-data">
        <div><dt>直径</dt><dd>{ratio(body.diameterKm, EARTH_DIAMETER)}</dd></div>
        <div><dt>表面重力</dt><dd>{ratio(body.gravityEarth, 1)}</dd></div>
        <div><dt>恒星日</dt><dd>{ratio(body.dayHours, EARTH_DAY)}</dd></div>
        <div><dt>公转周期</dt><dd>{body.yearDays ? ratio(body.yearDays, EARTH_YEAR) : '—'}</dd></div>
      </dl>
    </div>
  )
}

export default function ObservationPanel({ body, moon, onClose, onMoonSelect }: ObservationPanelProps) {
  const [tab, setTab] = useState<PanelTab>('overview')
  const tabs: Array<{ id: PanelTab; zh: string; en: string }> = [
    { id: 'overview', zh: '概览', en: 'OVERVIEW' },
    { id: 'metrics', zh: '参数', en: 'METRICS' },
    ...(body.id === 'sun' ? [] : [{ id: 'compare' as const, zh: '对比', en: 'COMPARE' }]),
  ]

  return (
    <aside className="planet-detail" aria-live="polite">
      <header>
        <span>{body.typeZh}</span>
        <small>{body.typeEn}</small>
        <button type="button" onClick={onClose} aria-label="关闭天体信息">关闭</button>
      </header>
      <h2>{body.nameZh}<small>{body.nameEn}</small></h2>
      <nav className="detail-tabs" role="tablist" aria-label="天体详情分类">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? 'active' : ''}
            onClick={() => setTab(item.id)}
          >
            {item.zh}<small>{item.en}</small>
          </button>
        ))}
      </nav>

      <div className="detail-content" role="tabpanel">
        {tab === 'overview' ? (
          <div className="overview-tab">
            <p>{body.description}</p>
            <div className="observation-meta">
              <span>{body.observationCode}</span>
              <span>{body.distance}</span>
            </div>
            <ul className="body-tags" aria-label="目标特征">
              {body.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </div>
        ) : null}
        {tab === 'metrics' ? (
          <dl className="metric-list">
            <div><dt>直径</dt><dd>{body.diameter}</dd></div>
            <div><dt>表面重力</dt><dd>{body.gravityEarth.toFixed(2)} g</dd></div>
            <div><dt>自转周期</dt><dd>{body.dayLength}</dd></div>
            <div><dt>公转周期</dt><dd>{body.yearLength}</dd></div>
            <div><dt>温度</dt><dd>{body.temperature}</dd></div>
            <div><dt>轴倾角</dt><dd>{body.axialTilt.toFixed(2)}°</dd></div>
          </dl>
        ) : null}
        {tab === 'compare' ? <CompareView body={body} /> : null}
      </div>

      {body.id === 'jupiter' ? (
        <nav className="moon-targets" aria-label="木星四大卫星">
          <span>次级目标 / GALILEAN MOONS</span>
          <div>
            {JUPITER_MOONS.map((target) => (
              <button
                key={target.id}
                type="button"
                className={moon?.id === target.id ? 'active' : ''}
                aria-pressed={moon?.id === target.id}
                onClick={() => onMoonSelect(target.id)}
              >
                {target.nameZh}<small>{target.nameEn}</small>
              </button>
            ))}
          </div>
        </nav>
      ) : null}

      {moon ? (
        <section className="moon-readout" aria-live="polite">
          <span>次级目标锁定 / SUBTARGET LOCKED</span>
          <h3>{moon.nameZh}<small>{moon.nameEn}</small></h3>
          <p>{moon.description}</p>
          <dl><div><dt>直径</dt><dd>{moon.diameter}</dd></div><div><dt>轨道</dt><dd>{moon.distance}</dd></div></dl>
        </section>
      ) : null}
    </aside>
  )
}
