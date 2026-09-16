import { useRef, useState, useEffect, useCallback } from 'react'

const PX_PER_SEC = 42

/**
 * Carrossel que rola sozinho, para sempre e sem corte visível.
 *
 * O laço é feito duplicando a lista: quando a rolagem chega na metade do
 * conteúdo, ela volta para o começo, e como as duas metades são idênticas o
 * salto não aparece. Mas isso só vale se a lista for maior que o trilho —
 * numa lista curta a cópia ficaria à mostra, mostrando cada pessoa duas
 * vezes. Por isso quem decide duplicar é o hook, depois de medir: o
 * componente renderiza a lista uma vez, e só repete se `duplicar` for true.
 *
 * Pausa quando o ponteiro está em cima e quando o trilho não está na faixa
 * central da tela — nada de gastar frame animando o que ninguém está vendo.
 */
export function useMarquee() {
  const ref = useRef(null)
  const paused = useRef(false)
  const offset = useRef(0)
  const [duplicar, setDuplicar] = useState(false)

  // Os cards têm largura fixa, então a medida não depende das imagens
  // carregarem — só de quanto espaço o trilho tem, que muda com a janela.
  useEffect(() => {
    const medir = () => {
      const el = ref.current
      if (!el) return
      // Já duplicado, uma cópia é metade do conteúdo.
      const umaCopia = duplicar ? el.scrollWidth / 2 : el.scrollWidth
      setDuplicar(umaCopia > el.clientWidth)
    }

    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [duplicar])

  useEffect(() => {
    if (!duplicar) return
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

      const half = el.scrollWidth / 2
      if (half < 2) return

      let next = offset.current + PX_PER_SEC * dt
      if (next >= half) next -= half
      offset.current = next
      el.scrollLeft = next
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [duplicar])

  const onMouseEnter = useCallback(() => { paused.current = true }, [])
  const onMouseLeave = useCallback(() => { paused.current = false }, [])

  return { ref, onMouseEnter, onMouseLeave, duplicar }
}
