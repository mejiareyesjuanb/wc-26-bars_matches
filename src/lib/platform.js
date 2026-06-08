// Lightweight client-side platform hints. Used only to choose the smoothest
// "add to calendar" delivery + which help text to show — never for gating logic.

export function isIOS() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  if (/iPad|iPhone|iPod/.test(ua)) return true
  // iPadOS 13+ masquerades as macOS Safari — detect the touch Mac.
  return ua.includes('Macintosh') && typeof document !== 'undefined' && 'ontouchend' in document
}

export function isAndroid() {
  if (typeof navigator === 'undefined') return false
  return /Android/.test(navigator.userAgent || '')
}
