import { describe, expect, it } from 'vitest'
import { getCelestialBody, PLANETS, SOLAR_BODIES } from './solarSystem'

describe('solar system data', () => {
  it('contains the Sun followed by the eight planets', () => {
    expect(SOLAR_BODIES.map((body) => body.id)).toEqual([
      'sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune',
    ])
    expect(PLANETS).toHaveLength(8)
  })

  it('uses unique ids and increasing planetary orbit radii', () => {
    expect(new Set(SOLAR_BODIES.map((body) => body.id)).size).toBe(SOLAR_BODIES.length)
    expect(PLANETS.every((body, index) => index === 0 || body.orbitRadius > PLANETS[index - 1].orbitRadius)).toBe(true)
  })

  it('provides numeric comparison data and a valid camera composition for every body', () => {
    SOLAR_BODIES.forEach((body) => {
      expect(body.diameterKm).toBeGreaterThan(0)
      expect(body.gravityEarth).toBeGreaterThan(0)
      expect(body.dayHours).toBeGreaterThan(0)
      expect(body.camera.distance).toBeGreaterThan(body.radius)
      expect(body.camera.duration).toBeGreaterThanOrEqual(1.6)
      expect(body.tags.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('resolves known bodies and rejects unknown ids', () => {
    expect(getCelestialBody('earth')?.nameZh).toBe('地球')
    expect(getCelestialBody('pluto')).toBeNull()
  })
})
