/**
 * Estresse da lógica do Codigo.gs no simulador: muitas candidaturas e
 * milhares de votos misturados com fraude e reenvio, e no fim confere que
 * a planilha fechou certinho.
 *
 *   node tests/carga/simulacao.mjs [eleitores=3000] [candidatos=300]
 *
 * O simulador roda uma chamada por vez, então aqui se mede lógica e custo
 * por operação conforme a planilha cresce — não o limite de execuções
 * simultâneas do Google (isso é o google.mjs).
 */
import { criarBackend, sementePadrao, gerarCpf } from '../fake/appsScript.mjs'

const N_ELEITORES = Number(process.argv[2] || 3000)
const N_CANDIDATOS = Number(process.argv[3] || 300)
const FOTO = 'data:image/jpeg;base64,' + Buffer.alloc(120_000, 7).toString('base64')

const embaralhar = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const unicos = (n) => {
  const s = new Set()
  while (s.size < n) s.add(gerarCpf())
  return [...s]
}

const ids = Array.from({ length: N_ELEITORES }, (_, i) => `ZJ-${String(i).padStart(6, '0')}`)
const b = criarBackend(sementePadrao({ ids }))
const post = (dados) => b.atender('POST', { corpo: JSON.stringify(dados) })
const t = (fn) => { const t0 = performance.now(); const r = fn(); return [r, performance.now() - t0] }

// ---------------------------------------------------------------- inscrições
const cpfsCand = unicos(N_CANDIDATOS)
const tentativasInscricao = []
cpfsCand.forEach((cpf, i) => {
  const dados = { acao: 'inscrever', nome: `Pessoa${i}`, sobrenome: 'Teste', cpf, estado: 'PB', categoria: i % 2 ? 'rei' : 'rainha', foto: FOTO }
  tentativasInscricao.push({ tipo: 'nova', dados })
  if (i % 10 === 0) tentativasInscricao.push({ tipo: 'reenvio', dados })
  if (i % 15 === 0) tentativasInscricao.push({ tipo: 'cpf-repetido', dados: { ...dados, nome: 'Outra' } })
})
for (let i = 0; i < N_CANDIDATOS / 20; i++) {
  tentativasInscricao.push({ tipo: 'cpf-invalido', dados: { acao: 'inscrever', nome: 'X', sobrenome: 'Y', cpf: '11111111111', estado: 'PB', categoria: 'rei', foto: FOTO } })
}

const placarInscricao = {}
let msInscricao = 0
for (const { tipo, dados } of tentativasInscricao) {
  const [r, ms] = t(() => post(dados))
  msInscricao += ms
  const chave = `${tipo} → ${r.ok ? 'ok' : r.erro}`
  placarInscricao[chave] = (placarInscricao[chave] || 0) + 1
}

// Aprova todo mundo, como a organização faria na aba Candidatos.
b.abas.Candidatos.dados.slice(1).forEach((l) => { l[8] = 'SIM' })
b.editouAMao()
const status = b.atender('GET', { query: { acao: 'status' } })
const reis = status.candidatos.filter((c) => c.categoria === 'rei')
const rainhas = status.candidatos.filter((c) => c.categoria === 'rainha')
const sorteio = (lista) => lista[Math.floor(Math.random() * lista.length)].id

// ------------------------------------------------------------------- votação
const cpfsEleitor = unicos(N_ELEITORES)
const honestos = ids.map((id, i) => ({ tipo: 'voto', dados: { acao: 'votar', cpf: cpfsEleitor[i], id: id.toLowerCase(), rei: sorteio(reis), rainha: sorteio(rainhas) } }))
const ataques = []
for (let i = 0; i < N_ELEITORES / 10; i++) {
  const v = honestos[i].dados
  ataques.push({ tipo: 'reenvio-igual', dados: { ...v }, depois: i })
  ataques.push({ tipo: 'mesmo-cpf-outro-voto', dados: { ...v, rainha: v.rainha === rainhas[0].id ? rainhas[1].id : rainhas[0].id }, depois: i })
  ataques.push({ tipo: 'mesmo-cpf-outro-id', dados: { ...v, id: ids[(i + 1) % ids.length] }, depois: i })
  ataques.push({ tipo: 'id-de-outro', dados: { ...v, cpf: gerarCpf() }, depois: i })
  ataques.push({ tipo: 'id-inventado', dados: { ...v, cpf: gerarCpf(), id: 'ZJ-FALSO' + i } })
}

// Votos honestos em ordem aleatória; cada fraude/reenvio entra alguns passos
// depois do voto que tenta fraudar, misturada com os votos dos outros.
const honestosEmbaralhados = embaralhar(honestos.map((h, i) => ({ ...h, i })))
const ataquesDe = new Map()
for (const a of ataques) {
  if (a.depois === undefined) continue
  if (!ataquesDe.has(a.depois)) ataquesDe.set(a.depois, [])
  ataquesDe.get(a.depois).push(a)
}
const inventados = ataques.filter((a) => a.depois === undefined)

const placarVoto = {}
const tempos = []
const executar = ({ tipo, dados }) => {
  const [r, ms] = t(() => post(dados))
  tempos.push(ms)
  const chave = `${tipo} → ${r.ok ? 'ok' : r.erro}`
  placarVoto[chave] = (placarVoto[chave] || 0) + 1
}
let pendentes = []
for (const h of honestosEmbaralhados) {
  executar(h)
  for (const a of ataquesDe.get(h.i) || []) pendentes.push({ ...a, espera: Math.floor(Math.random() * 50) })
  if (Math.random() < inventados.length / honestos.length && inventados.length) executar(inventados.pop())
  const prontos = pendentes.filter((p) => p.espera-- <= 0)
  pendentes = pendentes.filter((p) => p.espera >= 0)
  prontos.forEach(executar)
}
pendentes.forEach(executar)
inventados.forEach(executar)
const fila = { length: tempos.length }

// -------------------------------------------------------------- integridade
const votos = b.linhas('Votos')
const eleitores = b.linhas('Eleitores')
const resultado = b.abas.Resultado.dados
const somaRei = resultado.slice(1).reduce((s, l) => s + (Number(l[1]) || 0), 0)
const somaRainha = resultado.slice(1).reduce((s, l) => s + (Number(l[4]) || 0), 0)
const usados = eleitores.filter((e) => e.votou_em)
const checagens = {
  'um voto por eleitor honesto': votos.length === N_ELEITORES,
  'nenhum CPF votou duas vezes': new Set(votos.map((v) => v.cpf_hash)).size === votos.length,
  'nenhum ID usado duas vezes': new Set(votos.map((v) => v.id_inscricao)).size === votos.length,
  'todo ID usado tem CPF gravado': usados.every((e) => String(e.cpf).length === 11),
  'CPF gravado = CPF de quem votou com o ID': usados.every((e) => cpfsEleitor[ids.indexOf(e.id_inscricao)] === String(e.cpf)),
  'Resultado soma o total (rei)': somaRei === votos.length,
  'Resultado soma o total (rainha)': somaRainha === votos.length,
  'TOTAL DE VOTOS bate': resultado[1][6] === votos.length,
  'candidaturas = CPFs únicos válidos': b.linhas('Candidatos').length === N_CANDIDATOS,
  'uma foto por candidatura': b.arquivos.size === N_CANDIDATOS,
}

const fatia = (a, ini, fim) => a.slice(Math.floor(a.length * ini), Math.floor(a.length * fim))
const media = (a) => a.reduce((s, x) => s + x, 0) / a.length

console.log(`\n=== Inscrições (${tentativasInscricao.length} tentativas) ===`)
console.table(placarInscricao)
console.log(`média ${(msInscricao / tentativasInscricao.length).toFixed(2)} ms por inscrição no simulador`)
console.log(`\n=== Votação (${fila.length} tentativas: ${N_ELEITORES} honestas + ${ataques.length} fraudes/reenvios) ===`)
console.table(placarVoto)
console.log(`custo por voto no simulador: começo ${media(fatia(tempos, 0, 0.1)).toFixed(2)} ms → fim ${media(fatia(tempos, 0.9, 1)).toFixed(2)} ms`)
console.log('\n=== Integridade ===')
for (const [nome, ok] of Object.entries(checagens)) console.log(`${ok ? '✅' : '❌'} ${nome}`)
process.exitCode = Object.values(checagens).every(Boolean) ? 0 : 1
