import { describe, expect, it } from 'vitest'
import { initialObservationState, observationReducer } from './observationState'

describe('observation state', () => {
  it('moves through flying, scanning, and focused for the same target', () => {
    const flying = observationReducer(initialObservationState, { type: 'select', id: 'earth', source: 'manual' })
    const scanning = observationReducer(flying, { type: 'camera-arrived', id: 'earth' })
    const focused = observationReducer(scanning, { type: 'scan-complete', id: 'earth' })
    expect([flying.phase, scanning.phase, focused.phase]).toEqual(['flying', 'scanning', 'focused'])
  })

  it('ignores stale completion events after switching targets', () => {
    const earth = observationReducer(initialObservationState, { type: 'select', id: 'earth', source: 'manual' })
    const mars = observationReducer(earth, { type: 'select', id: 'mars', source: 'manual' })
    expect(observationReducer(mars, { type: 'camera-arrived', id: 'earth' })).toEqual(mars)
  })

  it('only allows a satellite belonging to the focused parent', () => {
    const earth = { ...initialObservationState, phase: 'focused' as const, selectedId: 'earth' as const }
    const selected = observationReducer(earth, { type: 'select-satellite', id: 'moon' })
    expect(selected.selectedSatelliteId).toBe('moon')
    expect(selected.phase).toBe('flying')
    expect(observationReducer(earth, { type: 'select-satellite', id: 'europa' })).toEqual(earth)
    expect(observationReducer(initialObservationState, { type: 'select-satellite', id: 'moon' }).selectedSatelliteId).toBeNull()
  })

  it('matches camera and scan events to the active satellite target', () => {
    const flying = {
      ...initialObservationState,
      phase: 'flying' as const,
      selectedId: 'saturn' as const,
      selectedSatelliteId: 'titan' as const,
    }
    expect(observationReducer(flying, { type: 'camera-arrived', id: 'saturn' })).toEqual(flying)
    const scanning = observationReducer(flying, { type: 'camera-arrived', id: 'saturn', satelliteId: 'titan' })
    expect(scanning.phase).toBe('scanning')
    expect(observationReducer(scanning, { type: 'scan-complete', id: 'saturn', satelliteId: 'titan' }).phase).toBe('focused')
  })

  it('returns from a satellite to its parent and preserves the chosen scale mode', () => {
    const satellite = {
      ...initialObservationState,
      phase: 'focused' as const,
      selectedId: 'neptune' as const,
      selectedSatelliteId: 'triton' as const,
      scaleMode: 'real' as const,
    }
    expect(observationReducer(satellite, { type: 'return-parent' })).toEqual({
      ...satellite,
      selectedSatelliteId: null,
    })
    expect(observationReducer(satellite, { type: 'overview' })).toEqual(initialObservationState)
  })
})
