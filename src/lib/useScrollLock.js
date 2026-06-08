import { useEffect } from 'react'

// Ref-counted background scroll lock for modals / bottom sheets. Uses the
// position-fixed body technique (so it also holds on iOS Safari, where
// `overflow: hidden` on body is unreliable), compensates for the scrollbar width
// to avoid a desktop layout shift, and restores the exact scroll position on close.
let lockCount = 0
let savedScrollY = 0

function lock() {
  if (lockCount++ > 0) return
  savedScrollY = window.scrollY
  const sbw = window.innerWidth - document.documentElement.clientWidth
  const s = document.body.style
  s.position = 'fixed'
  s.top = `-${savedScrollY}px`
  s.left = '0'
  s.right = '0'
  s.width = '100%'
  s.overflow = 'hidden'
  if (sbw > 0) s.paddingRight = `${sbw}px`
}

function unlock() {
  if (lockCount > 0 && --lockCount === 0) {
    const s = document.body.style
    s.position = s.top = s.left = s.right = s.width = s.overflow = s.paddingRight = ''
    window.scrollTo(0, savedScrollY)
  }
}

// Locks page scroll while the calling component is mounted.
export function useScrollLock() {
  useEffect(() => {
    lock()
    return unlock
  }, [])
}
