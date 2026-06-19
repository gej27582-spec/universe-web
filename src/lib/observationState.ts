import type { CelestialBodyId } from './solarSystem'
import { getSatellite, type SatelliteId, type ScaleMode } from './satellites'

export type ObservationPhase = 'overview' | 'flying' | 'scanning' | 'focused'

export interface ObservationState {
  phase: ObservationPhase
  selectedId: CelestialBodyId | null
  selectedSatelliteId: SatelliteId | null
  scaleMode: ScaleMode
  cruiseActive: boolean
}

export type ObservationAction =
  | { type: 'select'; id: CelestialBodyId; source: 'manual' | 'cruise' }
  | { type: 'camera-arrived'; id: CelestialBodyId; satelliteId?: SatelliteId }
  | { type: 'scan-complete'; id: CelestialBodyId; satelliteId?: SatelliteId }
  | { type: 'select-satellite'; id: SatelliteId }
  | { type: 'return-parent' }
  | { type: 'set-scale-mode'; mode: ScaleMode }
  | { type: 'start-cruise' }
  | { type: 'stop-cruise' }
  | { type: 'overview' }

export const initialObservationState: ObservationState = {
  phase: 'overview',
  selectedId: null,
  selectedSatelliteId: null,
  scaleMode: 'display',
  cruiseActive: false,
}

export function observationReducer(state: ObservationState, action: ObservationAction): ObservationState {
  switch (action.type) {
    case 'select':
      if (state.selectedId === action.id && state.phase !== 'overview') {
        return action.source === 'manual'
          ? { ...state, phase: 'focused', cruiseActive: false, selectedSatelliteId: null }
          : state
      }
      return {
        phase: 'flying',
        selectedId: action.id,
        selectedSatelliteId: null,
        scaleMode: state.scaleMode,
        cruiseActive: action.source === 'cruise' ? state.cruiseActive : false,
      }
    case 'camera-arrived':
      return state.phase === 'flying'
        && state.selectedId === action.id
        && state.selectedSatelliteId === (action.satelliteId ?? null)
        ? { ...state, phase: 'scanning' }
        : state
    case 'scan-complete':
      return state.phase === 'scanning'
        && state.selectedId === action.id
        && state.selectedSatelliteId === (action.satelliteId ?? null)
        ? { ...state, phase: 'focused' }
        : state
    case 'select-satellite': {
      const satellite = getSatellite(action.id)
      return satellite && state.selectedId === satellite.parentId && state.phase === 'focused'
        ? { ...state, phase: 'flying', selectedSatelliteId: action.id, cruiseActive: false }
        : state
    }
    case 'return-parent':
      return state.selectedId && state.selectedSatelliteId
        ? { ...state, phase: 'focused', selectedSatelliteId: null, cruiseActive: false }
        : state
    case 'set-scale-mode':
      return { ...state, scaleMode: action.mode }
    case 'start-cruise':
      return { ...state, cruiseActive: true, selectedSatelliteId: null }
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
