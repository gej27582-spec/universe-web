import { describe, expect, it } from 'vitest'
import { SATELLITES } from './satellites'
import {
  getPresetForPhenomenon,
  getSatelliteMaterialPreset,
  getSatelliteRealismProfile,
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
      'tritonFrost',
      'volcanicSulfur',
    ])
  })

  it('keeps Triton on a dedicated nitrogen frost material', () => {
    const preset = getSatelliteMaterialPreset('triton')
    expect(SATELLITE_MATERIAL_PRESET_BY_ID.triton).toBe('tritonFrost')
    expect(preset.labelZh).toBe('氮冰霜冻型')
    expect(preset.textureTint).toBe(0xf7fbff)
    expect(preset.fallbackColor).not.toBe(0x8d877c)
    expect(getSatelliteRealismProfile('triton').fallbackPolicy).toContain('不允许棕色石球')
  })

  it('uses a single highest quality observatory profile', () => {
    expect(Object.keys(QUALITY_SETTINGS)).toEqual(['high'])
    expect(QUALITY_SETTINGS.high.loadSatelliteTextures).toBe(true)
    expect(QUALITY_SETTINGS.high.textureAnisotropyCap).toBeGreaterThanOrEqual(8)
    expect(QUALITY_SETTINGS.high.plumeParticles).toBeGreaterThanOrEqual(58)
  })

  it('maps satellite phenomena to the closest material family', () => {
    expect(getPresetForPhenomenon('volcanic')).toBe('volcanicSulfur')
    expect(getPresetForPhenomenon('haze')).toBe('hazyAtmosphere')
    expect(getPresetForPhenomenon('plume')).toBe('geyserIce')
    expect(getPresetForPhenomenon('irregular')).toBe('irregularRock')
    expect(getPresetForPhenomenon('frost')).toBe('rockyCratered')
    expect(getPresetForPhenomenon('nitrogenFrost')).toBe('tritonFrost')
  })
})
