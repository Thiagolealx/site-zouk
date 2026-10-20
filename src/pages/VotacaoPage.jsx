import { useEffect, useRef, useState } from 'react'
import { API_URL, buscarStatus, statusGuardado, enviar, mascaraCpf, cpfValido } from '../data/reiRainha'
import { Aviso, Cabecalho, campo, rotulo } from './ReiRainhaPage'

// No teste com 20 celulares ao mesmo tempo, 2 de 200 fotos do Drive ficaram
// travadas sem nunca carregar. Se a foto der erro ou passar de 8 s sem
// chegar, pede de novo (até 3 vezes), com outro endereço para não reusar o
// pedido travado.
function Foto({ src, alt }) {
  const [tentativa, setTentativa] = useState(0)
  const [carregou, setCarregou] = useState(false)
  const [visivel, setVisivel] = useState(false)
  const ref = useRef(null)

  // Só conta o prazo quando a foto entra na tela (ela é lazy).
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return setVisivel(true)
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisivel(true), { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visivel || carregou || tentativa >= 3) return
    const t = setTimeout(() => setTentativa((n) => n + 1), 8000)
    return () => clearTimeout(t)
  }, [visivel, carregou, tentativa])

  return (
    <img
      ref={ref}
      src={tentativa ? `${src}${src.includes('?') ? '&' : '?'}t=${tentativa}` : src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onLoad={() => setCarregou(true)}
      onError={() => setTentativa((n) => (n < 3 ? n + 1 : n))}
      className="w-full h-full object-cover"
    />
  )
}

function Grade({ titulo, candidatos, escolhido, escolher }) {
  return (
    <div className="mt-14">
      <h2 className="font-display uppercase text-sand text-[clamp(28px,4vw,42px)] text-center">{titulo}</h2>
      {candidatos.length === 0 ? (
        <p className="mt-4 text-center text-mist">Nenhuma candidatura aprovada ainda.</p>
      ) : (
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {candidatos.map((c) => {
            const ativo = c.id === escolhido
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => escolher(c.id)}
                aria-pressed={ativo}
                className={`w-[calc(50%-8px)] sm:w-[200px] text-left rounded-[18px] overflow-hidden border-2 bg-night-light transition-all hover:-translate-y-1 ${
                  ativo ? 'border-sun-yellow' : 'border-line hover:border-mist'
                }`}
              >
                <div className="relative aspect-[4/5] bg-night">
                  <Foto src={c.foto} alt={`${c.nome} ${c.sobrenome}`} />
                  {ativo && (
                    <span className="absolute top-2.5 right-2.5 px-3 py-1 rounded-full text-xs font-bold text-night bg-sunset-gradient">
                      Seu voto ✓
                    </span>
                  )}
                </div>
                <div className="p-3.5">
                  <p className="font-bold text-sand leading-tight">
                    {c.nome} {c.sobrenome}
                  </p>
                  <p className="mt-1 text-[13px] text-haze">{c.estado}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Cedula({ candidatos }) {
  const [rei, setRei] = useState('')
  const [rainha, setRainha] = useState('')
  const [cpf, setCpf] = useState('')
  const [id, setId] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [pronto, setPronto] = useState(false)

  const reis = candidatos.filter((c) => c.categoria === 'rei')
  const rainhas = candidatos.filter((c) => c.categoria === 'rainha')

  const submeter = async (e) => {
    e.preventDefault()
    if (!rei || !rainha) return setErro('Escolha um rei e uma rainha.')
    if (!cpfValido(cpf)) return setErro('Confira o CPF.')

    setEnviando(true)
    setErro('')
    try {
      const r = await enviar({ acao: 'votar', cpf, id, rei, rainha })
      if (r.ok) setPronto(true)
      else setErro(r.erro)
    } catch {
      setErro('Não conseguimos registrar. Verifique a internet e tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  if (pronto) {
    return (
      <Aviso>
        <p className="font-display text-3xl uppercase text-sand">Voto registrado 👑</p>
        <p className="mt-3">Obrigado! O resultado sai na coroação, durante o baile.</p>
      </Aviso>
    )
  }

  return (
    <form onSubmit={submeter}>
      <Grade titulo="🤴 Rei do baile" candidatos={reis} escolhido={rei} escolher={setRei} />
      <Grade titulo="👸 Rainha do baile" candidatos={rainhas} escolhido={rainha} escolher={setRainha} />

      <div className="mt-16 max-w-[640px] mx-auto p-7 sm:p-9 rounded-[22px] bg-night-light border border-line grid gap-5">
        <div>
          <h2 className="font-display uppercase text-sand text-3xl">Confirme seu voto</h2>
          <p className="mt-2 text-[15px] text-mist">
            Só vota quem está inscrito no congresso, uma vez por CPF. Depois de confirmado, não dá
            para trocar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <label>
            <span className={rotulo}>CPF</span>
            <input
              required
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(mascaraCpf(e.target.value))}
              className={campo}
            />
          </label>
          <label>
            <span className={rotulo}>ID da inscrição</span>
            <input required value={id} onChange={(e) => setId(e.target.value)} className={campo} />
          </label>
        </div>

        {erro && <p className="text-coral font-semibold">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="py-4 rounded-full text-base font-bold text-night bg-sunset-gradient hover:brightness-110 transition-[filter] disabled:opacity-60"
        >
          {enviando ? 'Registrando…' : 'Confirmar voto'}
        </button>
      </div>
    </form>
  )
}

export default function VotacaoPage() {
  // Abre com o último status visto neste aparelho e atualiza por trás.
  const [status, setStatus] = useState(() => (API_URL ? statusGuardado() : null))
  const [falhou, setFalhou] = useState(false)

  useEffect(() => {
    if (!API_URL) return
    buscarStatus().then(setStatus).catch(() => setFalhou(true))
  }, [])

  let conteudo
  if (!API_URL) conteudo = <Aviso>A votação abre em breve.</Aviso>
  else if (falhou && !status) conteudo = <Aviso>Não conseguimos carregar agora. Recarregue a página.</Aviso>
  else if (!status) conteudo = <Aviso>Carregando…</Aviso>
  else if (!status.votacaoAberta)
    conteudo = (
      <Aviso>
        A votação ainda não está aberta.
        {status.inscricoesAbertas && (
          <>
            {' '}
            <a href="/rei-e-rainha" className="text-sun-yellow font-bold underline">
              Quer se candidatar? →
            </a>
          </>
        )}
      </Aviso>
    )
  else conteudo = <Cedula candidatos={status.candidatos} />

  return (
    <section className="pt-[140px] pb-24">
      <div className="max-w-[1180px] mx-auto px-6">
        <Cabecalho etiqueta="Baile de gala" titulo="Votação">
          Escolha um rei e uma rainha do baile. A coroação acontece no baile.
        </Cabecalho>
        {conteudo}
      </div>
    </section>
  )
}
