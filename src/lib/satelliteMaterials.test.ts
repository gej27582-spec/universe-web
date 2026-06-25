import { describe, expect, it } from 'vitest'
import { SATELLITES } from './satellites'
import {
  getPresetForPhenomenon,
  getSatelliteMaterialPreset,
  QUALITY_SETTINGS,
  SATELLITE_MATERIAL_PRESET_BY_ID,
  SATELLITE_MATERIAL_PRESETS,
} from './satelliteMaterials'

describe('satellite material presets', () => {
  it('covers every satellite with a maintainable preset', () => {
    for (const satellite of SATELLITES) {
      expect(SATELLITE_MATERIAL_PRESET_BY_ID[satellite.id]).toBeTruthy()
      expect(getSatelliteMaterialPreset(satellite.id)).toBeTruthy()
    }
  })

  it('contains the required v0.3.2 material families', () => {
    expect(Object.keys(SATELLITE_MATERIAL_PRESETS).sort()).toEqual([
      'geyserIce',
      'hazyAtmosphere',
      'icyCracked',
      'irregularRock',
      'rockyCratered',
      'volcanicSulfur',
    ])
  })

  it('keeps quality modes ordered from expensive to cheap', () => {
    expect(QUALITY_SETTINGS.high.dprCap).toBeGreaterThan(QUALITY_SETTINGS.balanced.dprCap)
    expect(QUALITY_SETTINGS.balanced.dprCap).toBeGreaterThan(QUALITY_SETTINGS.low.dprCap)
    expect(QUALITY_SETTINGS.high.plumeParticles).toBeGreaterThan(QUALITY_SETTINGS.low.plumeParticles)
    expect(QUALITY_SETTINGS.low.loadSatelliteTextures).toBe(false)
  })

  it('maps satellite phenomena to the closest material family', () => {
    expect(getPresetForPhenomenon('volcanic')).toBe('volcanicSulfur')
    expect(getPresetForPhenomenon('haze')).toBe('hazyAtmosphere')
    expect(getPresetForPhenomenon('plume')).toBe('geyserIce')
    expect(getPresetForPhenomenon('irregular')).toBe('irregularRock')
  })
})
