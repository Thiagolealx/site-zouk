import { useEffect, useState } from 'react'
import { API_URL, UFS, buscarStatus, enviar, mascaraCpf, cpfValido, reduzirFoto } from '../data/reiRainha'

export const campo =
  'w-full px-4 py-3.5 rounded-xl bg-night border border-line text-sand placeholder:text-haze/70 focus:outline-none focus:border-sun-yellow transition-colors'
export const rotulo = 'block mb-2 text-[13px] font-bold tracking-[0.1em] uppercase text-mist'

export function Cabecalho({ etiqueta, titulo, children }) {
  return (
    <div className="text-center max-w-[720px] mx-auto">
      <span className="text-xs font-bold tracking-[0.16em] uppercase text-sun-yellow">{etiqueta}</span>
      <h1 className="mt-3 font-display uppercase text-sand text-[clamp(38px,6vw,68px)]">{titulo}</h1>
      <p className="mt-3.5 text-lg leading-[1.55] text-mist">{children}</p>
    </div>
  )
}

export function Aviso({ children }) {
  return (
    <div className="mt-12 max-w-[560px] mx-auto p-8 rounded-[22px] bg-night-light border border-line text-center text-[17px] leading-[1.55] text-mist">
      {children}
    </div>
  )
}

function Formulario() {
  const [dados, setDados] = useState({ nome: '', sobrenome: '', cpf: '', estado: '', categoria: '' })
  const [foto, setFoto] = useState(null)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [pronto, setPronto] = useState(false)

  const mudar = (chave) => (e) =>
    setDados((d) => ({ ...d, [chave]: chave === 'cpf' ? mascaraCpf(e.target.value) : e.target.value }))

  const escolherFoto = async (e) => {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    try {
      setFoto(await reduzirFoto(arquivo))
      setErro('')
    } catch (err) {
      setErro(err.message)
    }
  }

  const submeter = async (e) => {
    e.preventDefault()
    if (!cpfValido(dados.cpf)) return setErro('Confira o CPF.')
    if (!dados.categoria) return setErro('Escolha se é candidatura a rei ou a rainha.')
    if (!foto) return setErro('Envie uma foto.')

    setEnviando(true)
    setErro('')
    try {
      const r = await enviar({ acao: 'inscrever', ...dados, foto })
      if (r.ok) setPronto(true)
      else setErro(r.erro)
    } catch {
      setErro('Não conseguimos enviar. Verifique a internet e tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  if (pronto) {
    return (
      <Aviso>
        <p className="font-display text-3xl uppercase text-sand">Candidatura enviada 👑</p>
        <p className="mt-3">
          Agora a organização confere os dados e a foto. Depois de aprovada, sua candidatura
          aparece na votação.
        </p>
      </Aviso>
    )
  }

  return (
    <form
      onSubmit={submeter}
      className="mt-12 max-w-[640px] mx-auto p-7 sm:p-9 rounded-[22px] bg-night-light border border-line grid gap-5"
    >
      <fieldset>
        <legend className={rotulo}>Quero concorrer a</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'rei', label: '🤴 Rei do baile' },
            { id: 'rainha', label: '👸 Rainha do baile' },
          ].map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => setDados((d) => ({ ...d, categoria: op.id }))}
              aria-pressed={dados.categoria === op.id}
              className={`py-4 rounded-xl border text-base font-bold transition-colors ${
                dados.categoria === op.id
                  ? 'border-sun-yellow bg-night-hover text-sun-yellow'
                  : 'border-line bg-night text-sand hover:border-mist'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-5">
        <label>
          <span className={rotulo}>Nome</span>
          <input required maxLength={60} value={dados.nome} onChange={mudar('nome')} className={campo} />
        </label>
        <label>
          <span className={rotulo}>Sobrenome</span>
          <input required maxLength={80} value={dados.sobrenome} onChange={mudar('sobrenome')} className={campo} />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <label>
          <span className={rotulo}>CPF</span>
          <input
            required
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={dados.cpf}
            onChange={mudar('cpf')}
            className={campo}
          />
        </label>
        <label>
          <span className={rotulo}>Estado</span>
          <select required value={dados.estado} onChange={mudar('estado')} className={campo}>
            <option value="" disabled>
              Escolha
            </option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <span className={rotulo}>Foto</span>
        <label className="flex items-center gap-4 p-4 rounded-xl bg-night border border-dashed border-line cursor-pointer hover:border-mist transition-colors">
          {foto ? (
            <img src={foto} alt="Sua foto" className="w-20 h-20 rounded-xl object-cover" />
          ) : (
            <span className="w-20 h-20 rounded-xl bg-night-hover grid place-items-center text-3xl">📷</span>
          )}
          <span className="text-[15px] text-mist">
            {foto ? 'Trocar foto' : 'Escolha uma foto sua, de rosto bem visível.'}
          </span>
          <input type="file" accept="image/*" onChange={escolherFoto} className="sr-only" />
        </label>
      </div>

      <p className="text-[13.5px] leading-relaxed text-haze">
        Seu nome, estado e foto aparecem na votação depois que a organização aprovar. O CPF é usado
        só para evitar candidatura repetida e não é mostrado no site.
      </p>

      {erro && <p className="text-coral font-semibold">{erro}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="py-4 rounded-full text-base font-bold text-night bg-sunset-gradient hover:brightness-110 transition-[filter] disabled:opacity-60"
      >
        {enviando ? 'Enviando…' : 'Enviar candidatura'}
      </button>
    </form>
  )
}

export default function ReiRainhaPage() {
  const [status, setStatus] = useState(null)
  const [falhou, setFalhou] = useState(false)

  useEffect(() => {
    if (!API_URL) return
    buscarStatus().then(setStatus).catch(() => setFalhou(true))
  }, [])

  let conteudo
  if (!API_URL) conteudo = <Aviso>As inscrições abrem em breve. Fique de olho no nosso Instagram!</Aviso>
  else if (falhou) conteudo = <Aviso>Não conseguimos carregar agora. Recarregue a página.</Aviso>
  else if (!status) conteudo = <Aviso>Carregando…</Aviso>
  else if (!status.inscricoesAbertas)
    conteudo = <Aviso>As inscrições estão encerradas.</Aviso>
  else conteudo = <Formulario />

  // Com a votação aberta, quem chega aqui quase sempre quer votar: o botão
  // vem antes do formulário de candidatura.
  const chamadaVotacao = status?.votacaoAberta && (
    <div className="mt-10 max-w-[640px] mx-auto p-7 rounded-[22px] border border-sun-yellow bg-night-hover text-center">
      <p className="font-display text-3xl uppercase text-sand">A votação está aberta 👑</p>
      <p className="mt-2 text-[15px] text-mist">
        Inscritos no congresso escolhem o rei e a rainha do baile.
      </p>
      <a
        href="/votacao"
        className="mt-5 inline-block px-8 py-4 rounded-full text-base font-bold text-night bg-sunset-gradient hover:brightness-110 transition-[filter]"
      >
        Votar agora
      </a>
    </div>
  )

  return (
    <section className="pt-[140px] pb-24">
      <div className="max-w-[1180px] mx-auto px-6">
        <Cabecalho etiqueta="Baile de gala" titulo="Rei e Rainha do Baile">
          Como nos filmes: candidate-se, o público do congresso vota, e a coroação acontece no
          baile. Qualquer pessoa pode se candidatar.
        </Cabecalho>
        {chamadaVotacao}
        {status?.votacaoAberta && status.inscricoesAbertas && (
          <h2 className="mt-16 text-center font-display uppercase text-sand text-[clamp(28px,4vw,42px)]">
            Quer se candidatar?
          </h2>
        )}
        {conteudo}
      </div>
    </section>
  )
}
