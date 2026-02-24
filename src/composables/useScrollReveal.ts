import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollReveal(threshold = 0.15) {
  const isVisible = ref(false)
  let el: HTMLElement | null = null
  let observer: IntersectionObserver | null = null
  let rafId: number | null = null

  const setRef = (element: any) => {
    el = element instanceof HTMLElement ? element : null
  }

  const cleanup = () => {
    observer?.disconnect()
    observer = null
    if (rafId != null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  onMounted(() => {
    if (!el) return

    // Delay one frame so the browser finishes initial layout.
    // Without this, IntersectionObserver can report stale positions.
    rafId = requestAnimationFrame(() => {
      rafId = null
      if (!el || isVisible.value) return

      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            isVisible.value = true
            cleanup()
          }
        },
        { threshold },
      )

      observer.observe(el)
    })
  })

  onUnmounted(cleanup)

  return { setRef, isVisible }
}
