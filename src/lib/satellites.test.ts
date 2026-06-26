import { describe, expect, it } from 'vitest'
import { getSatellite, getSatelliteSceneScale, getSatellitesForParent, SATELLITES } from './satellites'
import { getCelestialBody } from './solarSystem'

describe('satellite catalog', () => {
  it('contains ten unique satellites with valid parents and physical values', () => {
    expect(SATELLITES).toHaveLength(10)
    expect(new Set(SATELLITES.map((satellite) => satellite.id)).size).toBe(SATELLITES.length)
    for (const satellite of SATELLITES) {
      expect(getCelestialBody(satellite.parentId)).not.toBeNull()
      expect(satellite.diameterKm).toBeGreaterThan(0)
      expect(satellite.orbitalDistanceKm).toBeGreaterThan(0)
    }
  })

  it('groups satellites by parent and resolves known targets', () => {
    expect(getSatellitesForParent('mars').map((satellite) => satellite.id)).toEqual(['phobos', 'deimos'])
    expect(getSatellitesForParent('jupiter')).toHaveLength(4)
    expect(getSatellite('titan')?.parentId).toBe('saturn')
    expect(getSatellite(null)).toBeNull()
  })

  it('keeps Mars moons connected to dedicated surface textures', () => {
    expect(getSatellite('phobos')?.texture).toBe('satellites/phobos.jpg')
    expect(getSatellite('deimos')?.texture).toBe('satellites/deimos.jpg')
  })

  it('keeps satellite Chinese labels readable', () => {
    const text = SATELLITES.flatMap((satellite) => [
      satellite.nameZh,
      satellite.description,
      satellite.phenomenonLabel,
      satellite.phenomenonDescription,
    ]).join('')
    expect(text).toContain('月球')
    expect(text).toContain('火卫一')
    expect(text).toContain('欧罗巴')
    expect(text).not.toMatch(/[鐏鍗绠脳鈥]/)
  })

  it('uses exact parent-relative ratios in real scale mode', () => {
    const moon = getSatellite('moon')!
    const earth = getCelestialBody('earth')!
    const display = getSatelliteSceneScale(moon, earth, 'display')
    const real = getSatelliteSceneScale(moon, earth, 'real')
    expect(display).toEqual({ orbitRadius: moon.displayOrbitRadius, radius: moon.displayRadius })
    expect(real.radius / earth.radius).toBeCloseTo(moon.diameterKm / earth.diameterKm, 8)
    expect(real.orbitRadius / earth.radius).toBeCloseTo(moon.orbitalDistanceKm / (earth.diameterKm / 2), 8)
  })
})
