import { describe, expect, it } from 'vitest'
import {
  getBodiesForRegion,
  getCelestialBody,
  MINOR_BODIES,
  OBSERVATION_REGIONS,
  PLANETS,
  SOLAR_BODIES,
} from './solarSystem'

describe('solar system and outer region data', () => {
  it('keeps the Sun, eight planets, and five outer-system targets', () => {
    expect(SOLAR_BODIES.map((body) => body.id)).toEqual([
      'sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune',
      'pluto', 'charon', 'ceres', 'asteroid-belt', 'comet',
    ])
    expect(PLANETS.map((body) => body.id)).toEqual([
      'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune',
    ])
    expect(MINOR_BODIES).toHaveLength(5)
  })

  it('uses unique ids and region ids', () => {
    expect(new Set(SOLAR_BODIES.map((body) => body.id)).size).toBe(SOLAR_BODIES.length)
    expect(new Set(OBSERVATION_REGIONS.map((region) => region.id)).size).toBe(OBSERVATION_REGIONS.length)
    expect(getBodiesForRegion('solar-system')).toHaveLength(9)
    expect(getBodiesForRegion('outer-solar-system')).toHaveLength(5)
  })

  it('provides numeric comparison data and a valid camera composition for every body', () => {
    SOLAR_BODIES.forEach((body) => {
      expect(body.diameterKm).toBeGreaterThan(0)
      expect(body.gravityEarth).toBeGreaterThanOrEqual(0)
      expect(body.dayHours).toBeGreaterThan(0)
      expect(body.camera.distance).toBeGreaterThan(body.radius)
      expect(body.camera.duration).toBeGreaterThanOrEqual(1.4)
      expect(body.tags.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('defines a realism material profile for every body', () => {
    SOLAR_BODIES.forEach((body) => {
      expect(body.materialProfile.roughness).toBeGreaterThan(0.6)
      expect(body.materialProfile.emissiveIntensity).toBeGreaterThanOrEqual(0)
      expect(body.materialProfile.colorTint).toMatch(/^#[0-9a-f]{6}$/i)
      expect(body.materialProfile.visualIntent.length).toBeGreaterThan(12)
    })
    expect(getCelestialBody('neptune')?.materialProfile.visualIntent).toContain('深蓝')
    expect(getCelestialBody('pluto')?.materialProfile.visualIntent).toContain('USGS')
  })

  it('provides real fact archive fields and source links', () => {
    SOLAR_BODIES.forEach((body) => {
      expect(body.facts.identity).toBeTruthy()
      expect(body.facts.age).toMatch(/亿年|约/)
      expect(body.facts.formation).toBeTruthy()
      expect(body.facts.discovery).toBeTruthy()
      expect(body.facts.composition).toBeTruthy()
      expect(body.facts.surface).toBeTruthy()
      expect(body.facts.missions.length).toBeGreaterThan(0)
      expect(body.facts.sourceLinks.length).toBeGreaterThan(0)
      body.facts.sourceLinks.forEach((link) => expect(link).toMatch(/^https:\/\//))
    })
  })

  it('tracks asset provenance and marks procedural fallbacks honestly', () => {
    SOLAR_BODIES.forEach((body) => {
      expect(body.asset.sourceName).toBeTruthy()
      expect(body.asset.sourceUrl).toMatch(/^https:\/\//)
      expect(body.asset.license).toBeTruthy()
      expect(body.asset.purpose).toBeTruthy()
    })
    expect(getCelestialBody('pluto')?.asset.realObservation).toBe(true)
    expect(getCelestialBody('charon')?.asset.realObservation).toBe(true)
    expect(getCelestialBody('ceres')?.asset.realObservation).toBe(false)
    expect(getCelestialBody('ceres')?.facts.visualizationNote).toContain('不伪装为真实贴图')
  })

  it('resolves known bodies and rejects unknown ids', () => {
    expect(getCelestialBody('earth')?.nameZh).toBe('地球')
    expect(getCelestialBody('pluto')?.nameZh).toBe('冥王星')
    expect(getCelestialBody('unknown')).toBeNull()
  })

  it('keeps public Chinese labels readable', () => {
    const text = SOLAR_BODIES.flatMap((body) => [
      body.nameZh,
      body.typeZh,
      body.description,
      body.facts.identity,
      ...body.tags,
    ]).join('')

    expect(text).toContain('太阳')
    expect(text).toContain('地球')
    expect(text).toContain('海王星')
    expect(text).toContain('冥王星')
    expect(text).not.toMatch(/锟�|澶槼|娴风帇|鍐ョ帇/)
  })
})
