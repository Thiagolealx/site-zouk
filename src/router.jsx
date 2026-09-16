import { useState, useEffect } from 'react'

const NAV_OFFSET = 84 // altura da nav fixa, para a âncora não ficar por baixo dela

export const ROUTES = ['/', '/inscricao', '/camisas']

// A página de ingressos e a de inscrição viraram uma só: o passe e o
// pagamento agora vivem dentro do formulário. O endereço antigo continua
// respondendo para não quebrar link já divulgado.
const ATALHOS = { '/ingressos': '/inscricao' }

function scrollToHash(hash, instant) {
  if (!hash) {
    window.scrollTo({ top: 0, behavior: instant ? 'auto' : 'smooth' })
    return
  }
  const el = document.getElementById(hash.slice(1))
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
  window.scrollTo({ top, behavior: instant ? 'auto' : 'smooth' })
}

/**
 * Navega para uma URL interna sem recarregar a página.
 * Usada tanto pelo <Link> quanto pela interceptação global de cliques,
 * para que âncoras soltas dentro das páginas (ex.: "← Voltar ao site")
 * continuem funcionando sem precisar ser reescritas.
 */
export function navigate(to) {
  const url = new URL(to, window.location.origin)
  const samePage = url.pathname === window.location.pathname

  // A query entra no push: é por ela que o passe escolhido chega à inscrição.
  const alvo = url.pathname + url.search + url.hash
  if (alvo !== window.location.pathname + window.location.search + window.location.hash) {
    window.history.pushState({}, '', alvo)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  // Trocar de rota remonta a árvore: o alvo da âncora só existe no próximo
  // frame, então o scroll espera. Na mesma página, rola na hora.
  if (samePage) scrollToHash(url.hash, false)
  else requestAnimationFrame(() => scrollToHash(url.hash, !url.hash))
}

export function Link({ to, children, ...props }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        navigate(to)
      }}
      {...props}
    >
      {children}
    </a>
  )
}

export function useRoute() {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const sync = () => setPath(window.location.pathname)
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  // Links internos escritos como <a href="/..."> em qualquer lugar da árvore
  // viram navegação de SPA. Alvo externo, download, target ou tecla
  // modificadora continuam com o comportamento nativo do navegador.
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
      const a = e.target.closest?.('a')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href || !href.startsWith('/')) return
      if (a.target && a.target !== '_self') return
      if (a.hasAttribute('download')) return

      e.preventDefault()
      navigate(href)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Chegada direta numa URL com âncora (/#lineup vindo de fora).
  useEffect(() => {
    if (window.location.hash) {
      requestAnimationFrame(() => scrollToHash(window.location.hash, true))
    }
  }, [])

  // Resolve na hora para a árvore nunca renderizar com a rota antiga; o
  // efeito abaixo só acerta o que aparece na barra de endereço.
  const destino = ATALHOS[path] || path

  useEffect(() => {
    if (ATALHOS[path]) {
      const url = ATALHOS[path] + window.location.search + window.location.hash
      window.history.replaceState({}, '', url)
      setPath(ATALHOS[path])
    }
  }, [path])

  return ROUTES.includes(destino) ? destino : '/'
}
