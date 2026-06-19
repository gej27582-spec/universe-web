import type { CelestialBodyId } from './solarSystem'
import type { JupiterMoonId } from './jupiterMoons'

export type ObservationPhase = 'overview' | 'flying' | 'scanning' | 'focused'

export interface ObservationState {
  phase: ObservationPhase
  selectedId: CelestialBodyId | null
  selectedMoonId: JupiterMoonId | null
  cruiseActive: boolean
}

export type ObservationAction =
  | { type: 'select'; id: CelestialBodyId; source: 'manual' | 'cruise' }
  | { type: 'camera-arrived'; id: CelestialBodyId }
  | { type: 'scan-complete'; id: CelestialBodyId }
  | { type: 'select-moon'; id: JupiterMoonId }
  | { type: 'start-cruise' }
  | { type: 'stop-cruise' }
  | { type: 'overview' }

export const initialObservationState: ObservationState = {
  phase: 'overview',
  selectedId: null,
  selectedMoonId: null,
  cruiseActive: false,
}

export function observationReducer(state: ObservationState, action: ObservationAction): ObservationState {
  switch (action.type) {
    case 'select':
      if (state.selectedId === action.id && state.phase !== 'overview') {
        return action.source === 'manual' ? { ...state, cruiseActive: false, selectedMoonId: null } : state
      }
      return {
        phase: 'flying',
        selectedId: action.id,
        selectedMoonId: null,
        cruiseActive: action.source === 'cruise' ? state.cruiseActive : false,
      }
    case 'camera-arrived':
      return state.phase === 'flying' && state.selectedId === action.id
        ? { ...state, phase: 'scanning' }
        : state
    case 'scan-complete':
      return state.phase === 'scanning' && state.selectedId === action.id
        ? { ...state, phase: 'focused' }
        : state
    case 'select-moon':
      return state.selectedId === 'jupiter' && state.phase === 'focused'
        ? { ...state, selectedMoonId: action.id, cruiseActive: false }
        : state
    case 'start-cruise':
      return { ...state, cruiseActive: true, selectedMoonId: null }
    case 'stop-cruise':
      return { ...state, cruiseActive: false }
    case 'overview':
      return initialObservationState
  }
}

export function getSystemStatus(state: ObservationState) {
  if (state.cruiseActive) return 'AUTO TOUR'
  if (state.phase === 'flying') return 'SLEWING'
  if (state.phase === 'scanning') return 'SCANNING'
  if (state.phase === 'focused') return 'TARGET LOCKED'
  return 'ORBIT SIMULATION'
}
