import { useCallback, useEffect, useRef, useState } from 'react'

export type SoundCue = 'flyby' | 'lock'
export type SoundStatus = 'off' | 'loading' | 'on' | 'unavailable'

interface SoundAssets {
  ambient: HTMLAudioElement
  flyby: HTMLAudioElement
  lock: HTMLAudioElement
}

const AUDIO_BASE = `${import.meta.env.BASE_URL}audio`

async function playWithTimeout(audio: HTMLAudioElement, timeoutMs = 8000) {
  let timeout = 0
  try {
    await Promise.race([
      audio.play(),
      new Promise<never>((_, reject) => {
        timeout = window.setTimeout(() => reject(new DOMException('Audio startup timed out', 'NetworkError')), timeoutMs)
      }),
    ])
  } finally {
    window.clearTimeout(timeout)
  }
}

export function useSoundscape() {
  const [status, setStatus] = useState<SoundStatus>('off')
  const [errorName, setErrorName] = useState<string | null>(null)
  const assetsRef = useRef<SoundAssets | null>(null)
  const enabledRef = useRef(false)
  const fadeRef = useRef<number | null>(null)

  const stopFade = useCallback(() => {
    if (fadeRef.current !== null) cancelAnimationFrame(fadeRef.current)
    fadeRef.current = null
  }, [])

  const handlePlaybackFailure = useCallback((error: unknown) => {
    enabledRef.current = false
    const name = error instanceof DOMException ? error.name : ''
    setErrorName(name || 'UnknownError')
    setStatus(name === 'NotAllowedError' || name === 'AbortError' ? 'off' : 'unavailable')
  }, [])

  const getAssets = useCallback(() => {
    if (assetsRef.current) return assetsRef.current
    const ambient = new Audio(`${AUDIO_BASE}/ambient-loop.ogg`)
    const flyby = new Audio(`${AUDIO_BASE}/flyby.ogg`)
    const lock = new Audio(`${AUDIO_BASE}/scan-lock.ogg`)
    ambient.loop = true
    ambient.preload = 'auto'
    flyby.preload = 'auto'
    lock.preload = 'auto'
    ambient.volume = 0
    flyby.volume = 0.22
    lock.volume = 0.2
    assetsRef.current = { ambient, flyby, lock }
    return assetsRef.current
  }, [])

  const fadeAmbient = useCallback((target: number, duration: number, onComplete?: () => void) => {
    const ambient = assetsRef.current?.ambient
    if (!ambient) return
    stopFade()
    const from = ambient.volume
    const startedAt = performance.now()
    const step = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / duration)
      ambient.volume = from + (target - from) * progress
      if (progress < 1) {
        fadeRef.current = requestAnimationFrame(step)
      } else {
        fadeRef.current = null
        onComplete?.()
      }
    }
    fadeRef.current = requestAnimationFrame(step)
  }, [stopFade])

  const disable = useCallback(() => {
    enabledRef.current = false
    setStatus('off')
    fadeAmbient(0, 420, () => {
      const ambient = assetsRef.current?.ambient
      if (ambient) {
        ambient.pause()
        ambient.currentTime = 0
      }
    })
  }, [fadeAmbient])

  const toggle = useCallback(async () => {
    if (status === 'unavailable' || status === 'loading') return
    if (enabledRef.current) {
      disable()
      return
    }
    const assets = getAssets()
    setErrorName(null)
    setStatus('loading')
    try {
      await playWithTimeout(assets.ambient)
      enabledRef.current = true
      setStatus('on')
      fadeAmbient(0.16, 900)
    } catch (error) {
      handlePlaybackFailure(error)
    }
  }, [disable, fadeAmbient, getAssets, handlePlaybackFailure, status])

  const playCue = useCallback((cue: SoundCue) => {
    if (!enabledRef.current) return
    const audio = getAssets()[cue]
    audio.currentTime = 0
    void audio.play().catch(() => undefined)
  }, [getAssets])

  useEffect(() => {
    const onVisibility = () => {
      const ambient = assetsRef.current?.ambient
      if (!ambient) return
      if (document.hidden) {
        ambient.pause()
      } else if (enabledRef.current) {
        void ambient.play().then(() => fadeAmbient(0.16, 360)).catch(handlePlaybackFailure)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [fadeAmbient, handlePlaybackFailure])

  useEffect(() => () => {
    stopFade()
    enabledRef.current = false
    Object.values(assetsRef.current ?? {}).forEach((audio) => {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    })
    assetsRef.current = null
  }, [stopFade])

  return { status, errorName, toggle, playCue }
}
