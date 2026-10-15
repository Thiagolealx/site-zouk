/**
 * Carga contra o Apps Script de verdade.
 *
 * Leitura (seguro na planilha oficial: só consulta o status, como quem abre
 * a página):
 *   node tests/carga/google.mjs leitura [niveis=1,10,30,60] [rodadas=2]
 *
 * Escrita (inscrições e votos de mentira — SÓ numa CÓPIA da planilha, com
 * implantação própria; recusa o link oficial):
 *   node tests/carga/google.mjs escrita <url-da-copia> <ids.txt> [simultaneos=20]
 *   ids.txt = um ID livre por linha (gere na cópia com 🔑 Gerar IDs).
 */
import fs from 'node:fs'
import { gerarCpf } from '../fake/appsScript.mjs'

const OFICIAL = 'https://script.google.com/macros/s/AKfycbzX4fLMdoWqwwqF-ACDRRWOmvzDrFTa8xLkaH5d-IaUyzPyBOvVYAmZY0uDeuBCbrNCcQ/exec'
const [modo = 'leitura', ...args] = process.argv.slice(2)

async function chamar(url, corpo) {
  const t0 = performance.now()
  try {
    const res = await fetch(corpo ? url : `${url}?acao=status`, corpo ? { method: 'POST', body: JSON.stringify(corpo) } : {})
    const texto = await res.text()
    const ms = performance.now() - t0
    try {
      const json = JSON.parse(texto)
      return { ms, ok: true, json }
    } catch {
      // O Google devolve página HTML quando estoura limite ("too many…").
      const motivo = (texto.match(/<title>([^<]*)/i)?.[1] || texto.slice(0, 80)).trim()
      return { ms, ok: false, motivo: `HTTP ${res.status}: ${motivo}` }
    }
  } catch (e) {
    return { ms: performance.now() - t0, ok: false, motivo: String(e.cause?.code || e.message) }
  }
}

const pct = (a, p) => a.length ? a.slice().sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * p))] : 0
const resumo = (rs) => {
  const ms = rs.map((r) => r.ms)
  const falhas = rs.filter((r) => !r.ok)
  const motivos = {}
  falhas.forEach((f) => { motivos[f.motivo] = (motivos[f.motivo] || 0) + 1 })
  return {
    pedidos: rs.length,
    ok: rs.length - falhas.length,
    falhas: falhas.length,
    'p50 (s)': (pct(ms, 0.5) / 1000).toFixed(2),
    'p95 (s)': (pct(ms, 0.95) / 1000).toFixed(2),
    'máx (s)': (Math.max(...ms) / 1000).toFixed(2),
    motivos: Object.entries(motivos).map(([m, n]) => `${n}× ${m}`).join(' | ') || '-',
  }
}

if (modo === 'leitura') {
  const niveis = (args[0] || '1,10,30,60').split(',').map(Number)
  const rodadas = Number(args[1] || 2)
  const tabela = {}
  for (const n of niveis) {
    const rs = []
    for (let r = 0; r < rodadas; r++) {
      rs.push(...await Promise.all(Array.from({ length: n }, () => chamar(OFICIAL))))
    }
    tabela[`${n} ao mesmo tempo`] = resumo(rs)
    console.log(`${n} simultâneos: ok`)
  }
  console.table(tabela)
} else if (modo === 'escrita') {
  const [url, arquivoIds, simultaneos = '20'] = args
  if (!url || url === OFICIAL) {
    console.error('Escrita só numa CÓPIA da planilha, com implantação própria. Passe o link /exec da cópia.')
    process.exit(1)
  }
  const ids = fs.readFileSync(arquivoIds, 'utf8').split(/\s+/).filter(Boolean)
  const status = (await chamar(url)).json
  if (!status?.votacaoAberta || status.candidatos.length < 2) {
    console.error('Na cópia: abra a votação e aprove ao menos 1 rei e 1 rainha.')
    process.exit(1)
  }
  const reis = status.candidatos.filter((c) => c.categoria === 'rei')
  const rainhas = status.candidatos.filter((c) => c.categoria === 'rainha')
  const foto = 'data:image/jpeg;base64,' + Buffer.alloc(150_000, 7).toString('base64')
  const n = Number(simultaneos)

  // Ondas de N pessoas ao mesmo tempo, metade votando e metade se inscrevendo
  // na primeira onda, depois só votos, até acabarem os IDs.
  const tabela = {}
  const inscr = await Promise.all(Array.from({ length: Math.ceil(n / 2) }, (_, i) => chamar(url, {
    acao: 'inscrever', nome: `Carga${i}`, sobrenome: 'Teste', cpf: gerarCpf(), estado: 'PB', categoria: i % 2 ? 'rei' : 'rainha', foto,
  })))
  tabela['inscrições'] = resumo(inscr.map((r) => (r.ok && !r.json.ok ? { ...r, ok: false, motivo: r.json.erro } : r)))

  const votos = []
  for (let i = 0; i < ids.length; i += n) {
    const onda = ids.slice(i, i + n).map((id) => chamar(url, {
      acao: 'votar', cpf: gerarCpf(), id,
      rei: reis[Math.floor(Math.random() * reis.length)].id,
      rainha: rainhas[Math.floor(Math.random() * rainhas.length)].id,
    }))
    votos.push(...await Promise.all(onda))
    console.log(`votos enviados: ${votos.length}/${ids.length}`)
  }
  tabela['votos'] = resumo(votos.map((r) => (r.ok && !r.json.ok ? { ...r, ok: false, motivo: r.json.erro } : r)))
  console.table(tabela)
  console.log('Confira na cópia: a aba Votos deve ter exatamente', votos.filter((r) => r.ok && r.json.ok).length, 'linhas.')
} else {
  console.error('modo: leitura | escrita')
  process.exit(1)
}
