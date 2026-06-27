import { useState } from 'react'
import { UI_TEXT } from '../lib/observatoryText.zh'
import type { Satellite, SatelliteId, ScaleMode } from '../lib/satellites'
import type { CelestialBody } from '../lib/solarSystem'

type PanelTab = 'overview' | 'metrics' | 'archive' | 'compare' | 'phenomenon'

interface ObservationPanelProps {
  body: CelestialBody
  satellite: Satellite | null
  satellites: Satellite[]
  scaleMode: ScaleMode
  onClose: () => void
  onSatelliteSelect: (id: SatelliteId) => void
  onScaleModeChange: (mode: ScaleMode) => void
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
      <div className="scale-figure" aria-label={UI_TEXT.panel.comparisonLabel(body.nameZh)}>
        <span className="scale-body" style={{ width: bodySize, height: bodySize, borderColor: body.baseColor }}>
          <i>{body.nameEn}</i>
        </span>
        <span className="scale-earth" style={{ width: earthSize, height: earthSize }}><i>EARTH</i></span>
      </div>
      <dl className="compare-data">
        <div><dt>{UI_TEXT.panel.diameter}</dt><dd>{ratio(body.diameterKm, EARTH_DIAMETER)}</dd></div>
        <div><dt>{UI_TEXT.panel.gravity}</dt><dd>{ratio(body.gravityEarth, 1)}</dd></div>
        <div><dt>{UI_TEXT.panel.dayLength}</dt><dd>{ratio(body.dayHours, EARTH_DAY)}</dd></div>
        <div><dt>{UI_TEXT.panel.yearLength}</dt><dd>{body.yearDays ? ratio(body.yearDays, EARTH_YEAR) : '—'}</dd></div>
      </dl>
    </div>
  )
}

function FactArchive({ body }: { body: CelestialBody }) {
  return (
    <div className="archive-view">
      <section className="detail-section detail-section-lead">
        <span>{UI_TEXT.panel.realIdentity}</span>
        <p>{body.facts.identity}</p>
      </section>
      <dl className="fact-list">
        <div><dt>{UI_TEXT.panel.age}</dt><dd>{body.facts.age}</dd></div>
        <div><dt>{UI_TEXT.panel.formation}</dt><dd>{body.facts.formation}</dd></div>
        <div><dt>{UI_TEXT.panel.discovery}</dt><dd>{body.facts.discovery}</dd></div>
        <div><dt>{UI_TEXT.panel.composition}</dt><dd>{body.facts.composition}</dd></div>
        <div><dt>{UI_TEXT.panel.surface}</dt><dd>{body.facts.surface}</dd></div>
        <div><dt>{UI_TEXT.panel.missions}</dt><dd>{body.facts.missions.join(' · ')}</dd></div>
      </dl>
      {body.facts.visualizationNote ? (
        <section className="detail-section warning-section">
          <span>{UI_TEXT.panel.visualizationNote}</span>
          <p>{body.facts.visualizationNote}</p>
        </section>
      ) : null}
      <section className="detail-section source-section">
        <span>{UI_TEXT.panel.sources}</span>
        <ul>
          {body.facts.sourceLinks.map((link) => (
            <li key={link}><a href={link} target="_blank" rel="noreferrer">{link}</a></li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default function ObservationPanel({
  body, satellite, satellites, scaleMode, onClose, onSatelliteSelect, onScaleModeChange,
}: ObservationPanelProps) {
  const [tab, setTab] = useState<PanelTab>('overview')
  const tabs: Array<{ id: PanelTab; zh: string; en: string }> = satellite
    ? [
        { id: 'overview', zh: UI_TEXT.panel.overview, en: 'OVERVIEW' },
        { id: 'phenomenon', zh: UI_TEXT.panel.phenomenon, en: 'PHENOMENON' },
        { id: 'metrics', zh: UI_TEXT.panel.metrics, en: 'METRICS' },
      ]
    : [
        { id: 'overview', zh: UI_TEXT.panel.overview, en: 'OVERVIEW' },
        { id: 'archive', zh: UI_TEXT.panel.archive, en: 'ARCHIVE' },
        { id: 'metrics', zh: UI_TEXT.panel.metrics, en: 'METRICS' },
        ...(body.id === 'sun' ? [] : [{ id: 'compare' as const, zh: UI_TEXT.panel.compare, en: 'COMPARE' }]),
      ]
  const activeNameZh = satellite?.nameZh ?? body.nameZh
  const activeNameEn = satellite?.nameEn ?? body.nameEn

  return (
    <aside className="planet-detail" aria-live="polite">
      <header>
        <span>{satellite ? UI_TEXT.panel.naturalSatellite : body.typeZh}</span>
        <small>{satellite ? `${body.nameZh}${UI_TEXT.app.parentSystem}` : body.typeEn}</small>
        <button type="button" onClick={onClose} aria-label={satellite ? UI_TEXT.panel.returnToSystemLabel(body.nameZh) : UI_TEXT.panel.closeInfoLabel}>
          {satellite ? UI_TEXT.panel.returnToSystem(body.nameZh) : UI_TEXT.panel.close}
        </button>
      </header>
      <h2>{activeNameZh}<small>{activeNameEn}</small></h2>
      <nav className="detail-tabs" role="tablist" aria-label={UI_TEXT.panel.detailTabsLabel}>
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
        {tab === 'overview' && !satellite ? (
          <div className="overview-tab">
            <section className="detail-section detail-section-lead" aria-label={UI_TEXT.panel.shortDescription}>
              <span>{UI_TEXT.panel.shortDescription}</span>
              <p>{body.description}</p>
            </section>
            <section className="detail-section" aria-label={UI_TEXT.panel.basicData}>
              <span>{UI_TEXT.panel.basicData}</span>
              <div className="observation-meta">
                <span>{body.observationCode}</span>
                <span>{body.distance}</span>
                <span>{body.classification.toUpperCase()}</span>
              </div>
            </section>
            <section className="detail-section" aria-label={UI_TEXT.panel.visualFeatures}>
              <span>{UI_TEXT.panel.visualFeatures}</span>
              <ul className="body-tags" aria-label={UI_TEXT.panel.targetFeaturesLabel}>
                {body.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            </section>
            <section className="detail-section source-section">
              <span>{UI_TEXT.panel.sourceMaterial}</span>
              <p>{body.asset.sourceName}</p>
              <small>{body.asset.realObservation ? UI_TEXT.panel.realObservationAsset : UI_TEXT.panel.proceduralFallbackAsset}</small>
            </section>
          </div>
        ) : null}
        {tab === 'overview' && satellite ? (
          <div className="overview-tab satellite-overview">
            <section className="detail-section detail-section-lead" aria-label={UI_TEXT.panel.shortDescription}>
              <span>{UI_TEXT.panel.shortDescription}</span>
              <p>{satellite.description}</p>
            </section>
            <section className="detail-section" aria-label={UI_TEXT.panel.basicData}>
              <span>{UI_TEXT.panel.basicData}</span>
              <div className="observation-meta">
                <span>{body.nameEn} SYSTEM</span>
                <span>{satellite.retrograde ? 'RETROGRADE ORBIT' : 'PROGRADE ORBIT'}</span>
              </div>
            </section>
            <section className="detail-section" aria-label={UI_TEXT.panel.specialPhenomenon}>
              <span>{UI_TEXT.panel.specialPhenomenon}</span>
              <ul className="body-tags" aria-label={UI_TEXT.panel.satelliteFeaturesLabel}>
                <li>{satellite.phenomenonLabel}</li>
                <li>{scaleMode === 'real' ? UI_TEXT.app.realScale : UI_TEXT.app.displayScale}</li>
              </ul>
            </section>
          </div>
        ) : null}
        {tab === 'archive' && !satellite ? <FactArchive body={body} /> : null}
        {tab === 'metrics' && !satellite ? (
          <dl className="metric-list">
            <div><dt>{UI_TEXT.panel.diameter}</dt><dd>{body.diameter}</dd></div>
            <div><dt>{UI_TEXT.panel.gravity}</dt><dd>{body.gravityEarth.toFixed(3)} g</dd></div>
            <div><dt>{UI_TEXT.panel.dayLength}</dt><dd>{body.dayLength}</dd></div>
            <div><dt>{UI_TEXT.panel.yearLength}</dt><dd>{body.yearLength}</dd></div>
            <div><dt>{UI_TEXT.panel.temperature}</dt><dd>{body.temperature}</dd></div>
            <div><dt>{UI_TEXT.panel.axialTilt}</dt><dd>{body.axialTilt.toFixed(2)}°</dd></div>
          </dl>
        ) : null}
        {tab === 'metrics' && satellite ? (
          <dl className="metric-list">
            <div><dt>{UI_TEXT.panel.diameter}</dt><dd>{satellite.diameter}</dd></div>
            <div><dt>{UI_TEXT.panel.orbitalDistance}</dt><dd>{satellite.orbitalDistance}</dd></div>
            <div><dt>{UI_TEXT.panel.orbitDirection}</dt><dd>{satellite.retrograde ? UI_TEXT.panel.retrograde : UI_TEXT.panel.prograde}</dd></div>
            <div><dt>{UI_TEXT.panel.parentBody}</dt><dd>{body.nameZh}</dd></div>
          </dl>
        ) : null}
        {tab === 'phenomenon' && satellite ? (
          <section className="phenomenon-view">
            <span>{UI_TEXT.panel.visualSignature}</span>
            <h3>{satellite.phenomenonLabel}</h3>
            <p>{satellite.phenomenonDescription}</p>
            <small>{UI_TEXT.panel.enhancedVisualNotice}</small>
          </section>
        ) : null}
        {tab === 'compare' ? <CompareView body={body} /> : null}
      </div>

      {satellites.length ? (
        <section className="satellite-system-controls detail-section" aria-label={`${body.nameZh}${UI_TEXT.panel.satelliteSystemControl}`}>
          <span>{UI_TEXT.panel.operationButtons}</span>
          <div className="scale-mode-row">
            <span>{UI_TEXT.panel.localScale}</span>
            <div role="group" aria-label={UI_TEXT.panel.satelliteScaleLabel}>
              <button type="button" className={scaleMode === 'display' ? 'active' : ''} aria-pressed={scaleMode === 'display'} onClick={() => onScaleModeChange('display')}>{UI_TEXT.app.display}</button>
              <button type="button" className={scaleMode === 'real' ? 'active' : ''} aria-pressed={scaleMode === 'real'} onClick={() => onScaleModeChange('real')}>{UI_TEXT.app.real}</button>
            </div>
          </div>
          <nav className="moon-targets" aria-label={`${body.nameZh}${UI_TEXT.panel.satelliteListLabel}`}>
            <span>{UI_TEXT.panel.satelliteTargets}</span>
            <div>
              {satellites.map((target) => (
                <button
                  key={target.id}
                  type="button"
                  className={satellite?.id === target.id ? 'active' : ''}
                  aria-pressed={satellite?.id === target.id}
                  onClick={() => onSatelliteSelect(target.id)}
                >
                  {target.nameZh}<small>{target.nameEn}</small>
                </button>
              ))}
            </div>
          </nav>
        </section>
      ) : null}
      <section className="detail-guidance" aria-label={UI_TEXT.panel.guidanceLabel}>
        <span>{UI_TEXT.panel.guidance}</span>
        <p>
          {satellite
            ? UI_TEXT.panel.satelliteReturnHint(body.nameZh)
            : satellites.length
              ? UI_TEXT.panel.chooseSatelliteHint
              : UI_TEXT.panel.archiveHint}
        </p>
      </section>
    </aside>
  )
}
