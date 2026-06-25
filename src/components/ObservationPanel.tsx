import { useState } from 'react'
import type { Satellite, SatelliteId, ScaleMode } from '../lib/satellites'
import type { CelestialBody } from '../lib/solarSystem'

type PanelTab = 'overview' | 'metrics' | 'compare' | 'phenomenon'

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

export default function ObservationPanel({
  body, satellite, satellites, scaleMode, onClose, onSatelliteSelect, onScaleModeChange,
}: ObservationPanelProps) {
  const [tab, setTab] = useState<PanelTab>('overview')
  const tabs: Array<{ id: PanelTab; zh: string; en: string }> = satellite
    ? [
        { id: 'overview', zh: '概览', en: 'OVERVIEW' },
        { id: 'phenomenon', zh: '现象', en: 'PHENOMENON' },
        { id: 'metrics', zh: '参数', en: 'METRICS' },
      ]
    : [
        { id: 'overview', zh: '概览', en: 'OVERVIEW' },
        { id: 'metrics', zh: '参数', en: 'METRICS' },
        ...(body.id === 'sun' ? [] : [{ id: 'compare' as const, zh: '对比', en: 'COMPARE' }]),
      ]
  const activeNameZh = satellite?.nameZh ?? body.nameZh
  const activeNameEn = satellite?.nameEn ?? body.nameEn

  return (
    <aside className="planet-detail" aria-live="polite">
      <header>
        <span>{satellite ? '天然卫星' : body.typeZh}</span>
        <small>{satellite ? 'NATURAL SATELLITE' : body.typeEn}</small>
        <button type="button" onClick={onClose} aria-label={satellite ? `返回${body.nameZh}系统` : '关闭天体信息'}>
          {satellite ? '返回母星' : '关闭'}
        </button>
      </header>
      <h2>{activeNameZh}<small>{activeNameEn}</small></h2>
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
        {tab === 'overview' && !satellite ? (
          <div className="overview-tab">
            <section className="detail-section detail-section-lead" aria-label="简短描述">
              <span>简短描述</span>
              <p>{body.description}</p>
            </section>
            <section className="detail-section" aria-label="基础数据">
              <span>基础数据</span>
              <div className="observation-meta">
                <span>{body.observationCode}</span>
                <span>{body.distance}</span>
              </div>
            </section>
            <section className="detail-section" aria-label="特殊现象">
              <span>特殊现象</span>
              <ul className="body-tags" aria-label="目标特征">
                {body.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            </section>
          </div>
        ) : null}
        {tab === 'overview' && satellite ? (
          <div className="overview-tab satellite-overview">
            <section className="detail-section detail-section-lead" aria-label="简短描述">
              <span>简短描述</span>
              <p>{satellite.description}</p>
            </section>
            <section className="detail-section" aria-label="基础数据">
              <span>基础数据</span>
              <div className="observation-meta">
                <span>{body.nameEn} SYSTEM</span>
                <span>{satellite.retrograde ? 'RETROGRADE ORBIT' : 'PROGRADE ORBIT'}</span>
              </div>
            </section>
            <section className="detail-section" aria-label="特殊现象">
              <span>特殊现象</span>
              <ul className="body-tags" aria-label="卫星特征">
                <li>{satellite.phenomenonLabel}</li>
                <li>{scaleMode === 'real' ? '真实比例' : '展示比例'}</li>
              </ul>
            </section>
          </div>
        ) : null}
        {tab === 'metrics' && !satellite ? (
          <dl className="metric-list">
            <div><dt>直径</dt><dd>{body.diameter}</dd></div>
            <div><dt>表面重力</dt><dd>{body.gravityEarth.toFixed(2)} g</dd></div>
            <div><dt>自转周期</dt><dd>{body.dayLength}</dd></div>
            <div><dt>公转周期</dt><dd>{body.yearLength}</dd></div>
            <div><dt>温度</dt><dd>{body.temperature}</dd></div>
            <div><dt>轴倾角</dt><dd>{body.axialTilt.toFixed(2)}°</dd></div>
          </dl>
        ) : null}
        {tab === 'metrics' && satellite ? (
          <dl className="metric-list">
            <div><dt>直径</dt><dd>{satellite.diameter}</dd></div>
            <div><dt>轨道距离</dt><dd>{satellite.orbitalDistance}</dd></div>
            <div><dt>轨道方向</dt><dd>{satellite.retrograde ? '逆行' : '顺行'}</dd></div>
            <div><dt>母天体</dt><dd>{body.nameZh}</dd></div>
          </dl>
        ) : null}
        {tab === 'phenomenon' && satellite ? (
          <section className="phenomenon-view">
            <span>视觉观测特征 / VISUAL SIGNATURE</span>
            <h3>{satellite.phenomenonLabel}</h3>
            <p>{satellite.phenomenonDescription}</p>
            <small>视觉表现经过增强，不代表实时观测亮度。</small>
          </section>
        ) : null}
        {tab === 'compare' ? <CompareView body={body} /> : null}
      </div>

      {satellites.length ? (
        <section className="satellite-system-controls detail-section" aria-label={`${body.nameZh}卫星系统控制`}>
          <span>操作按钮</span>
          <div className="scale-mode-row">
            <span>局部系统比例 / LOCAL SCALE</span>
            <div role="group" aria-label="卫星系统比例">
              <button type="button" className={scaleMode === 'display' ? 'active' : ''} aria-pressed={scaleMode === 'display'} onClick={() => onScaleModeChange('display')}>展示</button>
              <button type="button" className={scaleMode === 'real' ? 'active' : ''} aria-pressed={scaleMode === 'real'} onClick={() => onScaleModeChange('real')}>真实</button>
            </div>
          </div>
          <nav className="moon-targets" aria-label={`${body.nameZh}卫星列表`}>
            <span>次级目标 / SATELLITE TARGETS</span>
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
      <section className="detail-guidance" aria-label="观测提示">
        <span>提示</span>
        <p>{satellite ? '返回母星可继续选择同一系统内的其他卫星。' : '点击卫星目标可进入独立镜头、扫描与聚焦流程。'}</p>
      </section>
    </aside>
  )
}
