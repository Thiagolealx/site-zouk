/**
 * O último minuto da votação: muita gente votando junto no site de verdade
 * (Apps Script e fotos do Drive reais). Parte das pessoas são navegadores
 * de celular fazendo tudo pela tela; o resto faz os mesmos pedidos que o
 * site faz (abrir a cédula e votar, com as mesmas novas tentativas).
 *
 *   node tests/carga/pico.mjs <url-do-site> [opções]
 *     --de=1 --ate=150     IDs TESTE-001…TESTE-150 (menu 🧪 Teste de carga)
 *     --janela=120         segundos em que as pessoas chegam; mais gente
 *                          perto do fim. 0 = todo mundo no mesmo segundo
 *     --navegadores=30     quantas delas usam um navegador de verdade
 *     --fraudes=TESTE-151  a partir deste ID, 9 IDs para as fraudes
 *
 * Grava votos de verdade com IDs TESTE-: no fim, menu 🧪 → Apagar tudo do teste.
 */
import { chromium, devices } from '@playwright/test'
import { gerarCpf } from '../fake/appsScript.mjs'

const [site, ...resto] = process.argv.slice(2)
if (!site) {
  console.error('uso: node tests/carga/pico.mjs <url-do-site> [--de=1 --ate=150 --janela=120 --navegadores=30 --fraudes=TESTE-151]')
  process.exit(1)
}
const op = Object.fromEntries(resto.map((a) => a.replace(/^--/, '').split('=')))
const DE = Number(op.de || 1)
const ATE = Number(op.ate || 150)
const JANELA = Number(op.janela ?? 120)
const NAVEGADORES = Number(op.navegadores ?? 30)
const FRAUDES = op.fraudes ? Number(op.fraudes.replace(/\D/g, '')) : 0
// --api=<link> só para ensaiar o próprio teste contra um simulador local.
const API = op.api || 'https://script.google.com/macros/s/AKfycbzX4fLMdoWqwwqF-ACDRRWOmvzDrFTa8xLkaH5d-IaUyzPyBOvVYAmZY0uDeuBCbrNCcQ/exec'

const idTeste = (n) => `TESTE-${String(n).padStart(3, '0')}`
const s = (ms) => (ms / 1000).toFixed(1)
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))

// ------------------------------------------------- pedidos iguais aos do site
async function comPrazo(url, opcoes, ms) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), ms)
  try {
    const res = await fetch(url, { ...opcoes, signal: ctl.signal })
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}
const ocupado = (r) => r && !r.ok && (r.ocupado || /^(Muita gente|Erro inesperado)/.test(r.erro || ''))
async function enviar(dados, r) {
  let ultimo
  for (let t = 0; t < 5; t++) {
    if (t) await esperar(2000 * t)
    r.tentativas = t + 1
    try {
      const resp = await comPrazo(API, { method: 'POST', body: JSON.stringify(dados) }, 45000)
      if (!ocupado(resp)) return resp
      ultimo = resp
      r.filaCheia = (r.filaCheia || 0) + 1
      if (resp.detalhe) (r.detalhes ||= []).push(resp.detalhe)
    } catch (e) {
      ultimo = e
      r.semResposta = (r.semResposta || 0) + 1
    }
  }
  if (ultimo instanceof Error) throw ultimo
  return ultimo
}
async function status() {
  for (let t = 0; t < 3; t++) {
    try { return await comPrazo(`${API}?acao=status`, {}, 12000) } catch { /* tenta de novo */ }
  }
  throw new Error('status não respondeu')
}

// Pessoa sem navegador: abre a cédula (status + fotos) e vota.
async function pessoaApi(p) {
  const r = { ...p, tipo: 'api' }
  try {
    const t0 = Date.now()
    const st = await status()
    r.cedula = Date.now() - t0
    if (!st.votacaoAberta) throw new Error('votação fechada')
    const reis = st.candidatos.filter((c) => c.categoria === 'rei')
    const rainhas = st.candidatos.filter((c) => c.categoria === 'rainha')
    const fotos = await Promise.all(st.candidatos.map((c) => fetch(c.foto).then((x) => x.ok && x.arrayBuffer()).catch(() => false)))
    r.fotos = st.candidatos.length
    r.fotosOk = fotos.filter(Boolean).length
    const t1 = Date.now()
    const resp = await enviar({
      acao: 'votar', cpf: p.cpf, id: p.id,
      rei: reis[Math.floor(Math.random() * reis.length)].id,
      rainha: rainhas[Math.floor(Math.random() * rainhas.length)].id,
    }, r)
    r.voto = Date.now() - t1
    r.resultado = resp.ok ? 'registrado' : resp.erro
  } catch (e) {
    r.resultado = `FALHOU: ${String(e.message).split('\n')[0]}`
  }
  return r
}

// Pessoa com navegador de celular: faz tudo pela tela.
async function pessoaNavegador(navegador, p) {
  const r = { ...p, tipo: 'celular' }
  const ctx = await navegador.newContext({ ...devices['Pixel 7'] })
  const page = await ctx.newPage()
  page.on('request', (req) => {
    if (req.method() === 'POST' && req.url().startsWith('https://script.google.com')) r.tentativas = (r.tentativas || 0) + 1
  })
  try {
    const t0 = Date.now()
    await page.goto(`${site}/votacao`, { timeout: 60000 })
    await page.getByRole('button', { name: 'Confirmar voto' }).waitFor({ timeout: 90000 })
    r.cedula = Date.now() - t0
    const fotos = page.locator('button[aria-pressed] img')
    r.fotos = await fotos.count()
    for (let i = 0; i < r.fotos; i++) await fotos.nth(i).scrollIntoViewIfNeeded()
    await page.waitForFunction(() => [...document.querySelectorAll('button[aria-pressed] img')]
      .every((img) => img.complete && img.naturalWidth > 0), null, { timeout: 45000 }).catch(() => {})
    r.fotosOk = await page.evaluate(() => [...document.querySelectorAll('button[aria-pressed] img')]
      .filter((img) => img.complete && img.naturalWidth > 0).length)
    const grades = page.locator('div.mt-14')
    for (const g of [0, 1]) {
      const cards = grades.nth(g).locator('button[aria-pressed]')
      await cards.nth(Math.floor(Math.random() * await cards.count())).click()
    }
    await page.getByLabel('CPF').fill(p.cpf)
    await page.getByLabel('ID da inscrição').fill(p.id)
    const t1 = Date.now()
    await page.getByRole('button', { name: 'Confirmar voto' }).click()
    const ok = page.getByText('Voto registrado')
    const erro = page.locator('p.text-coral')
    await Promise.race([ok.waitFor({ timeout: 240000 }), erro.waitFor({ timeout: 240000 })])
    r.voto = Date.now() - t1
    r.resultado = (await ok.isVisible()) ? 'registrado' : await erro.textContent()
  } catch (e) {
    r.resultado = `FALHOU: ${String(e.message).split('\n')[0]}`
  } finally {
    await ctx.close()
  }
  return r
}

// ------------------------------------------------------------- quem é quem
const pessoas = []
for (let n = DE; n <= ATE; n++) {
  // Mais gente perto do fim: raiz de um sorteio uniforme.
  pessoas.push({ id: idTeste(n), cpf: gerarCpf(), chega: JANELA * 1000 * Math.sqrt(Math.random()) })
}
const passo = Math.max(1, Math.floor(pessoas.length / Math.max(1, NAVEGADORES)))
pessoas.forEach((p, i) => { p.n = i + 1; p.navegador = i % passo === 0 && i / passo < NAVEGADORES })

// Fraudes, todas no meio do pico (quando a fila está mais cheia).
const fraudes = []
if (FRAUDES) {
  const meio = JANELA * 1000 * 0.8
  for (let k = 0; k < 3; k++) {
    // Mesmo CPF com dois IDs diferentes, no mesmo instante: só um pode entrar.
    const cpf = gerarCpf()
    fraudes.push({ id: idTeste(FRAUDES + 2 * k), cpf, chega: meio, grupo: `cpf-duplo-${k}`, espera: 'um dos dois' })
    fraudes.push({ id: idTeste(FRAUDES + 2 * k + 1), cpf, chega: meio, grupo: `cpf-duplo-${k}`, espera: 'um dos dois' })
  }
  for (let k = 0; k < 2; k++) {
    // Mesmo ID com dois CPFs diferentes, no mesmo instante: só um pode entrar.
    const id = idTeste(FRAUDES + 6 + k)
    fraudes.push({ id, cpf: gerarCpf(), chega: meio, grupo: `id-duplo-${k}`, espera: 'um dos dois' })
    fraudes.push({ id, cpf: gerarCpf(), chega: meio, grupo: `id-duplo-${k}`, espera: 'um dos dois' })
  }
  // Duplo clique / reenvio: mesmo CPF e ID duas vezes juntos. Os dois
  // recebem "registrado", mas só pode existir uma linha.
  const cpf = gerarCpf()
  fraudes.push({ id: idTeste(FRAUDES + 8), cpf, chega: meio, grupo: 'reenvio', espera: 'os dois ok, 1 linha', mesmoVoto: true })
  fraudes.push({ id: idTeste(FRAUDES + 8), cpf, chega: meio, grupo: 'reenvio', espera: 'os dois ok, 1 linha', mesmoVoto: true })
  // ID que não existe.
  fraudes.push({ id: 'ZJ-NAOEXISTE', cpf: gerarCpf(), chega: meio, grupo: 'id-falso', espera: 'recusado' })
  fraudes.forEach((f, i) => { f.n = `F${i + 1}` })
}

// O reenvio precisa mandar os mesmos candidatos nas duas vezes.
async function pessoaFraude(f, st) {
  if (!f.mesmoVoto) return pessoaApi(f)
  const reis = st.candidatos.filter((c) => c.categoria === 'rei')
  const rainhas = st.candidatos.filter((c) => c.categoria === 'rainha')
  const r = { ...f, tipo: 'api' }
  const t1 = Date.now()
  const resp = await enviar({ acao: 'votar', cpf: f.cpf, id: f.id, rei: reis[0].id, rainha: rainhas[0].id }, r)
  r.voto = Date.now() - t1
  r.resultado = resp.ok ? 'registrado' : resp.erro
  return r
}

// ------------------------------------------------------------------ rodar
const st0 = await status()
if (!st0.votacaoAberta) {
  console.error('A votação está fechada na planilha. Abra (menu ▶ Abrir votação) e rode de novo.')
  process.exit(1)
}
console.log(`script versão ${st0.versao}; ${pessoas.length} pessoas (${pessoas.filter((p) => p.navegador).length} em celular de verdade), ${fraudes.length} fraudes, janela ${JANELA} s`)

const navegador = await chromium.launch()
const inicio = Date.now()
const progresso = setInterval(() => console.log(`… ${s(Date.now() - inicio)} s`), 15000)
const rs = await Promise.all([
  ...pessoas.map(async (p) => {
    await esperar(p.chega)
    return p.navegador ? pessoaNavegador(navegador, p) : pessoaApi(p)
  }),
  ...fraudes.map(async (f) => { await esperar(f.chega); return pessoaFraude(f, st0) }),
])
clearInterval(progresso)
await navegador.close()

// ---------------------------------------------------------------- relatório
const honestos = rs.filter((r) => !r.grupo)
const pct = (a, p) => (a.length ? a.slice().sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * p))] : 0)
const linha = (nome, rsx, k) => {
  const v = rsx.map((r) => r[k]).filter((x) => x != null)
  return { medida: nome, p50: s(pct(v, 0.5)), p90: s(pct(v, 0.9)), máx: s(Math.max(0, ...v)) }
}
const ruins = rs.filter((r) => r.resultado !== 'registrado' && !r.grupo)
if (ruins.length) console.table(ruins.map((r) => ({ n: r.n, id: r.id, tipo: r.tipo, tentativas: r.tentativas, resultado: r.resultado })))

console.log(`\nTudo em ${s(Date.now() - inicio)} s`)
console.table([
  linha('abrir cédula (s), celular', honestos.filter((r) => r.tipo === 'celular'), 'cedula'),
  linha('abrir cédula (s), todos', honestos, 'cedula'),
  linha('registrar voto (s), celular', honestos.filter((r) => r.tipo === 'celular'), 'voto'),
  linha('registrar voto (s), todos', honestos, 'voto'),
])
const reg = honestos.filter((r) => r.resultado === 'registrado').length
console.log(`Votos honestos registrados: ${reg}/${honestos.length}`)
console.log(`Precisaram tentar de novo: ${honestos.filter((r) => (r.tentativas || 1) > 1).length} (fila cheia ${honestos.reduce((a, r) => a + (r.filaCheia || 0), 0)}×, sem resposta ${honestos.reduce((a, r) => a + (r.semResposta || 0), 0)}×)`)
const fotos = honestos.reduce((a, r) => a + (r.fotos || 0), 0)
const fotosOk = honestos.reduce((a, r) => a + (r.fotosOk || 0), 0)
const detalhes = {}
rs.forEach((r) => (r.detalhes || []).forEach((d) => { detalhes[d] = (detalhes[d] || 0) + 1 }))
if (Object.keys(detalhes).length) console.log('Erros do Google (o site tentou de novo):', detalhes)
console.log(`Fotos: ${fotosOk}/${fotos} carregaram (celular: ${honestos.filter((r) => r.tipo === 'celular').reduce((a, r) => a + (r.fotosOk || 0), 0)}/${honestos.filter((r) => r.tipo === 'celular').reduce((a, r) => a + (r.fotos || 0), 0)})`)

if (fraudes.length) {
  console.log('\nFraudes e casos de borda:')
  const grupos = {}
  rs.filter((r) => r.grupo).forEach((r) => (grupos[r.grupo] ||= []).push(r))
  console.table(Object.entries(grupos).map(([g, rsx]) => {
    const okN = rsx.filter((r) => r.resultado === 'registrado').length
    const esperado = rsx[0].espera
    const certo = esperado === 'um dos dois' ? okN === 1 : esperado === 'recusado' ? okN === 0 : okN === 2
    return { caso: g, esperado, respostas: rsx.map((r) => r.resultado).join(' | '), certo: certo ? '✅' : '❌' }
  }))
}
console.log(`\nNa planilha, a aba Votos deve ganhar ${reg + (fraudes.length ? 3 + 2 + 1 : 0)} linhas TESTE- (honestos + 1 por caso de fraude que entrou).`)
console.log(JSON.stringify({ honestosRegistrados: reg, idsFraude: fraudes.map((f) => f.id) }))
