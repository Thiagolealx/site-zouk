import { useRef, useEffect, useCallback } from 'react'

const PX_PER_SEC = 42

/**
 * Carrossel que rola sozinho, para sempre e sem corte visível.
 *
 * O componente precisa renderizar a lista DUPLICADA dentro do trilho: quando
 * a rolagem chega na metade do conteúdo, ela volta para o começo, e como as
 * duas metades são idênticas o salto não aparece.
 *
 * Pausa quando o ponteiro está em cima e quando o trilho não está na faixa
 * central da tela — nada de gastar frame animando o que ninguém está vendo.
 */
export function useMarquee() {
  const ref = useRef(null)
  const paused = useRef(false)
  const offset = useRef(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf
    let last = 0

    const step = (ts) => {
      raf = requestAnimationFrame(step)
      const el = ref.current
      if (!el) return

      // Primeiro frame não tem delta; o clamp segura o salto quando a aba
      // volta do background com centenas de ms acumulados.
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0
      last = ts

      const rect = el.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      const inFocus = center > window.innerHeight * 0.18 && center < window.innerHeight * 0.82

      if (paused.current || !inFocus) {
        // Parado: adota a posição atual, para não desfazer um arrasto manual.
        offset.current = el.scrollLeft
        return
      }

      // O laço só fecha se UMA cópia da lista já for mais larga que o trilho:
      // senão o navegador trava a rolagem antes da metade e o carrossel
      // congela deslocado. Listas curtas ficam paradas, que é o certo.
      const half = el.scrollWidth / 2
      if (half < 2 || el.clientWidth >= half) return

      let next = offset.current + PX_PER_SEC * dt
      if (next >= half) next -= half
      offset.current = next
      el.scrollLeft = next
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onMouseEnter = useCallback(() => { paused.current = true }, [])
  const onMouseLeave = useCallback(() => { paused.current = false }, [])

  return { ref, onMouseEnter, onMouseLeave }
}
