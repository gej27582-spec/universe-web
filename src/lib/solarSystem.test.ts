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

  it('resolves known bodies and rejects unknown ids', () => {
    expect(getCelestialBody('earth')?.nameZh).toBe('地球')
    expect(getCelestialBody('pluto')).toBeNull()
  })
})
