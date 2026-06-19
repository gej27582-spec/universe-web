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

  it('only allows moon selection for a focused Jupiter', () => {
    const jupiter = { ...initialObservationState, phase: 'focused' as const, selectedId: 'jupiter' as const }
    expect(observationReducer(jupiter, { type: 'select-moon', id: 'europa' }).selectedMoonId).toBe('europa')
    expect(observationReducer(initialObservationState, { type: 'select-moon', id: 'europa' }).selectedMoonId).toBeNull()
  })
})
