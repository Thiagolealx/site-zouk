import { useRef, useState, useEffect, useCallback } from 'react'

const PX_PER_SEC = 42
// Depois que a pessoa solta o trilho, espera antes de voltar a andar sozinho —
// tempo de ler o nome do card que ela parou em cima sem a tela fugir.
const ESPERA_APOS_TOQUE = 2500

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
 * Pausa quando o ponteiro está em cima, quando o trilho não está na faixa
 * central da tela, e enquanto a pessoa estiver arrastando — no celular não há
 * hover, então sem essa pausa a animação desfazia o arrasto a cada frame e o
 * dedo não conseguia passar os cards.
 */
export function useMarquee() {
  const ref = useRef(null)
  const paused = useRef(false)
  const offset = useRef(0)
  // Enquanto agora < retomarEm o trilho fica parado. Infinity = dedo na tela.
  const retomarEm = useRef(0)
  // Última posição escrita pela animação, para distinguir a rolagem nossa da
  // que veio da pessoa (inclusive a inércia, que continua depois do dedo sair).
  const ultimoAuto = useRef(-1)
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

  // Toque e rolagem manual seguram a animação. Listeners no elemento, e não
  // props do React, para poderem ser passivos — assim o navegador não espera
  // nosso código para começar a arrastar.
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const segurar = () => { retomarEm.current = Infinity }
    const soltar = () => { retomarEm.current = performance.now() + ESPERA_APOS_TOQUE }

    const aoRolar = () => {
      // Se a posição não é a que escrevemos, quem rolou foi a pessoa.
      if (Math.abs(el.scrollLeft - ultimoAuto.current) > 2) soltar()
    }

    const opts = { passive: true }
    el.addEventListener('pointerdown', segurar, opts)
    el.addEventListener('touchstart', segurar, opts)
    el.addEventListener('scroll', aoRolar, opts)
    // A soltura escuta na janela: o dedo costuma sair do trilho antes de
    // levantar, e um "pausado para sempre" travaria o carrossel de vez.
    window.addEventListener('pointerup', soltar, opts)
    window.addEventListener('pointercancel', soltar, opts)
    window.addEventListener('touchend', soltar, opts)
    window.addEventListener('touchcancel', soltar, opts)

    return () => {
      el.removeEventListener('pointerdown', segurar)
      el.removeEventListener('touchstart', segurar)
      el.removeEventListener('scroll', aoRolar)
      window.removeEventListener('pointerup', soltar)
      window.removeEventListener('pointercancel', soltar)
      window.removeEventListener('touchend', soltar)
      window.removeEventListener('touchcancel', soltar)
    }
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

      if (paused.current || !inFocus || performance.now() < retomarEm.current) {
        // Parado: adota a posição atual, para não desfazer um arrasto manual.
        offset.current = el.scrollLeft
        return
      }

      const half = el.scrollWidth / 2
      if (half < 2) return

      // O arrasto pode ter deixado a posição em qualquer ponto das duas
      // cópias; o resto da divisão traz de volta para dentro da primeira.
      let next = offset.current + PX_PER_SEC * dt
      if (next >= half) next %= half
      if (next < 0) next = 0
      offset.current = next
      el.scrollLeft = next
      // Lê de volta: o navegador arredonda, e é esse valor que o `scroll` vê.
      ultimoAuto.current = el.scrollLeft
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [duplicar])

  const onMouseEnter = useCallback(() => { paused.current = true }, [])
  const onMouseLeave = useCallback(() => { paused.current = false }, [])

  return { ref, onMouseEnter, onMouseLeave, duplicar }
}
