import { useRef, useEffect } from 'react'

/**
 * Prepara um iframe do Tally para altura dinâmica.
 *
 * O loadEmbeds() do Tally só enxerga iframes que tenham `data-tally-src` e
 * NENHUM `src` — é ele quem preenche o src e passa a escutar as mensagens de
 * redimensionamento. Deixar o `src` no HTML faz o formulário aparecer, mas
 * preso na altura inicial e cortado no fim.
 *
 * Passe `chave` quando o iframe for remontado (ex.: "pedir outra camisa"),
 * para o efeito rodar de novo no elemento novo.
 */
export function useTallyEmbed(chave) {
  const ref = useRef(null)

  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return

    const carregar = () => window.Tally?.loadEmbeds?.()
    carregar()

    // O script entra com `async` no index.html: numa SPA ele pode chegar
    // antes ou depois deste componente montar, então cobrimos os dois casos.
    const script = document.querySelector('script[src*="tally.so/widgets/embed.js"]')
    script?.addEventListener('load', carregar)

    // Se o script não chegar (bloqueador, rede caída), o iframe ficaria sem
    // src nenhum e a pessoa não veria formulário algum. Passada a espera,
    // montamos na mão: perde a altura dinâmica, mas dá para se inscrever.
    const reserva = setTimeout(() => {
      if (iframe.isConnected && !iframe.getAttribute('src')) {
        iframe.src = iframe.dataset.tallySrc
      }
    }, 3000)

    return () => {
      clearTimeout(reserva)
      script?.removeEventListener('load', carregar)
    }
  }, [chave])

  return ref
}
