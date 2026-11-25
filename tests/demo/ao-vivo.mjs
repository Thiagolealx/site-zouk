/**
 * Votação ao vivo NA TELA: abre janelas de verdade para você assistir.
 *
 *   npm run test:ao-vivo                     (ou node tests/demo/ao-vivo.mjs)
 *     --pessoas=100       quantas votam juntas no pico
 *     --celulares=4       quantas delas aparecem em janelas de celular na tela
 *     --navegadores=30    quantas (contando as da tela) usam navegador de
 *                         verdade escondido; o resto faz os mesmos pedidos do site
 *     --segurar=30        segundos com tudo aberto no fim, para você olhar
 *     --sem-demo          pula a parte 1 (uma pessoa votando devagar)
 *
 * Parte 1: uma pessoa vota devagar, passo a passo, com legenda.
 * Parte 2: as pessoas abrem a cédula, escolhem rei e rainha e, na contagem
 *          3-2-1, TODO MUNDO aperta "Confirmar voto" no mesmo instante. Junto
 *          entram tentativas de fraude (CPF repetido, ID repetido, ID falso).
 *          Um painel mostra cada pessoa e a apuração ao vivo.
 *
 * Não toca na planilha de verdade: o Codigo.gs roda aqui no computador
 * (tests/fake), com atraso de rede e limite de execuções simultâneas
 * imitando o Google — a fila cheia faz o site esperar e tentar de novo,
 * como no último minuto da votação.
 */
import { spawn } from 'node:child_process'
import { chromium, devices } from '@playwright/test'
import { criarBackend, sementePadrao, gerarCpf } from '../fake/appsScript.mjs'
import { png } from '../e2e/apoio.mjs'

const op = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const PESSOAS = Number(op.pessoas || 100)
const CELULARES = Number(op.celulares ?? 4)
const NAVEGADORES = Math.max(CELULARES, Number(op.navegadores ?? 30))
const SEGURAR = Number(op.segurar ?? 30)
const PORTA = 5181
const SITE = `http://localhost:${PORTA}`
// Google: até ~30 execuções ao mesmo tempo; cada voto leva 1–3 s.
const LIMITE_GOOGLE = 30
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))
const sorteio = (a) => a[Math.floor(Math.random() * a.length)]

// ------------------------------------------------------------ "planilha"
const CANDIDATOS = [
  { id: 'R1', nome: 'Davi', sobrenome: 'Melo', categoria: 'rei', cor: [70, 130, 230] },
  { id: 'R2', nome: 'Edu', sobrenome: 'Rocha', categoria: 'rei', estado: 'SP', cor: [40, 170, 120] },
  { id: 'R3', nome: 'Caio', sobrenome: 'Nunes', categoria: 'rei', estado: 'RN', cor: [120, 90, 200] },
  { id: 'Q1', nome: 'Ana', sobrenome: 'Souza', categoria: 'rainha', cor: [240, 90, 140] },
  { id: 'Q2', nome: 'Bia', sobrenome: 'Lima', categoria: 'rainha', estado: 'PE', cor: [250, 150, 60] },
  { id: 'Q3', nome: 'Lia', sobrenome: 'Costa', categoria: 'rainha', estado: 'CE', cor: [230, 200, 60] },
]
const idPessoa = (n) => `TESTE-${String(n).padStart(3, '0')}`
const ids = ['DEMO-001', ...Array.from({ length: PESSOAS + 10 }, (_, i) => idPessoa(i + 1))]
const backend = criarBackend(sementePadrao({ ids, candidatos: CANDIDATOS }))
const fotos = Object.fromEntries(CANDIDATOS.map((c) => [c.id, png(80, 100, c.cor)]))

// O "Google": atraso de rede e fila cheia quando passa do limite.
let emExecucao = 0
const google = { pedidos: 0, filaCheia: 0, picoSimultaneo: 0 }
async function googlePost(corpo) {
  google.pedidos++
  if (emExecucao >= LIMITE_GOOGLE) {
    google.filaCheia++
    await esperar(300)
    return { ok: false, ocupado: true, erro: 'Muita gente votando agora. Tente de novo em alguns segundos.' }
  }
  emExecucao++
  google.picoSimultaneo = Math.max(google.picoSimultaneo, emExecucao)
  try {
    await esperar(1000 + Math.random() * 2000)
    return backend.atender('POST', { corpo })
  } finally {
    emExecucao--
  }
}
async function googleGet(query) {
  await esperar(300 + Math.random() * 700)
  return backend.atender('GET', { query })
}

async function ligar(ctx) {
  await ctx.route('https://script.google.com/**', async (route) => {
    const req = route.request()
    const json = req.method() === 'GET'
      ? await googleGet(Object.fromEntries(new URL(req.url()).searchParams))
      : await googlePost(req.postData() || '')
    await route.fulfill({ json }).catch(() => {})
  })
  await ctx.route('https://drive.google.com/thumbnail**', (route) => {
    const id = new URL(route.request().url()).searchParams.get('id')
    return route.fulfill({ contentType: 'image/png', body: fotos[id] || fotos.R1 })
  })
}

// ------------------------------------------------------------ site local
const vite = spawn('npx', ['vite', '--port', String(PORTA), '--strictPort'], { stdio: 'ignore', detached: true })
const fecharVite = () => { try { process.kill(-vite.pid) } catch { /* já fechou */ } }
process.on('exit', fecharVite)
process.on('SIGINT', () => process.exit(130))
for (let i = 0; ; i++) {
  try { if ((await fetch(SITE)).ok) break } catch { /* subindo */ }
  if (i > 60) throw new Error('o site (vite) não subiu')
  await esperar(500)
}

// Celular na tela: tamanho de um celular, mas na escala do monitor.
const celular = { ...devices['Pixel 7'], viewport: { width: 300, height: 900 }, deviceScaleFactor: 1 }
async function janela({ x, y, w, h, slowMo = 0 }) {
  return chromium.launch({
    headless: false,
    slowMo,
    args: [`--window-position=${x},${y}`, `--window-size=${w},${h}`],
  })
}

async function legenda(page, texto) {
  await page.evaluate((t) => {
    let el = document.getElementById('legenda-teste')
    if (!el) {
      el = document.createElement('div')
      el.id = 'legenda-teste'
      el.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;padding:10px 12px;border-radius:12px;'
        + 'background:rgba(0,0,0,.85);color:#fff;font:600 14px/1.3 system-ui;text-align:center;pointer-events:none'
      document.body.appendChild(el)
    }
    el.textContent = t
  }, texto).catch(() => {})
}

const grade = (page, i) => page.locator('div.mt-14').nth(i)

// ===================================================== PARTE 1: uma pessoa
if (!('sem-demo' in op)) {
  console.log('Parte 1: uma pessoa votando devagar…')
  const nav = await janela({ x: 760, y: 0, w: 440, h: 1000, slowMo: 500 })
  const ctx = await nav.newContext({ ...celular, viewport: { width: 420, height: 880 } })
  await ligar(ctx)
  const page = await ctx.newPage()
  await page.goto(`${SITE}/votacao`)
  await page.getByRole('button', { name: 'Confirmar voto' }).waitFor()
  await legenda(page, '1/6 · A cédula abre: primeiro a seção 🤴 REI DO BAILE')
  await grade(page, 0).getByRole('heading').scrollIntoViewIfNeeded()
  await esperar(1800)
  await legenda(page, '2/6 · Toca num rei: o card ganha "Seu voto ✓"')
  await grade(page, 0).getByRole('button', { name: /Edu Rocha/ }).click()
  await esperar(1500)
  await legenda(page, '3/6 · Se tentar confirmar só com o rei…')
  await page.getByLabel('CPF').fill(gerarCpf('123456789'))
  await page.getByLabel('ID da inscrição').fill('DEMO-001')
  await page.getByRole('button', { name: 'Confirmar voto' }).click()
  await page.getByText('Escolha um rei e uma rainha.').waitFor()
  await legenda(page, '…o site recusa: "Escolha um rei e uma rainha."')
  await esperar(2500)
  await legenda(page, '4/6 · Desce até 👸 RAINHA DO BAILE e escolhe uma')
  await grade(page, 1).getByRole('heading').scrollIntoViewIfNeeded()
  await esperar(1200)
  await grade(page, 1).getByRole('button', { name: /Lia Costa/ }).click()
  await esperar(1500)
  await legenda(page, '5/6 · CPF e ID já preenchidos: confirma')
  await page.getByRole('button', { name: 'Confirmar voto' }).scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: 'Confirmar voto' }).click()
  await page.getByText('Voto registrado').waitFor({ timeout: 30000 })
  await legenda(page, '6/6 · Voto registrado: 1 rei + 1 rainha na mesma linha')
  const [v] = backend.linhas('Votos')
  console.log(`  planilha → rei: ${v.voto_rei} | rainha: ${v.voto_rainha}`)
  await esperar(4000)
  await nav.close()
}

// ===================================================== PARTE 2: o pico
console.log(`Parte 2: ${PESSOAS} pessoas votando no mesmo instante…`)
const pessoas = Array.from({ length: PESSOAS }, (_, i) => ({
  n: i + 1,
  id: idPessoa(i + 1),
  cpf: gerarCpf(),
  rei: sorteio(CANDIDATOS.filter((c) => c.categoria === 'rei')),
  rainha: sorteio(CANDIDATOS.filter((c) => c.categoria === 'rainha')),
  tipo: i < CELULARES ? 'tela' : i < NAVEGADORES ? 'navegador' : 'pedido',
  estado: 'aguardando',
  tentativas: 0,
}))

// Fraudes, disparadas no mesmo 3-2-1.
const livre = (k) => idPessoa(PESSOAS + 1 + k)
const cpfRepetido = gerarCpf()
const idRepetido = livre(2)
const fraudes = [
  { grupo: 'Mesmo CPF, 2 IDs', id: livre(0), cpf: cpfRepetido, espera: 1 },
  { grupo: 'Mesmo CPF, 2 IDs', id: livre(1), cpf: cpfRepetido, espera: 1 },
  { grupo: 'Mesmo ID, 2 CPFs', id: idRepetido, cpf: gerarCpf(), espera: 1 },
  { grupo: 'Mesmo ID, 2 CPFs', id: idRepetido, cpf: gerarCpf(), espera: 1 },
  { grupo: 'ID que não existe', id: 'ZJ-NAOEXISTE', cpf: gerarCpf(), espera: 0 },
].map((f, i) => ({ ...f, n: `F${i + 1}`, estado: 'aguardando', tentativas: 0,
  rei: CANDIDATOS[0], rainha: CANDIDATOS[3] }))

// --------------------------------------------------------------- painel
const navPainel = await janela({ x: 0, y: 0, w: 760, h: 1040 })
const painel = await (await navPainel.newContext({ viewport: { width: 760, height: 960 } })).newPage()
await painel.setContent(`<!doctype html><meta charset="utf-8"><title>Painel da votação</title>
<style>
  body{margin:0;padding:18px;background:#0f1020;color:#eee;font:14px/1.35 system-ui}
  h1{margin:0 0 4px;font-size:22px} .sub{color:#aab;margin-bottom:12px}
  #placar{font-size:44px;font-weight:800;text-align:center;margin:6px 0 12px;color:#ffd166}
  .grid{display:grid;grid-template-columns:repeat(20,1fr);gap:4px}
  .t{height:26px;border-radius:5px;background:#2a2c44;font-size:10px;display:grid;place-items:center;color:#0008;font-weight:700}
  .t.tela{outline:2px solid #fff}
  .abrindo{background:#4a6fa5}.pronto{background:#8d99ae}.enviando{background:#ffd166}
  .fila{background:#f8961e}.registrado{background:#43aa8b}.erro{background:#e63946;color:#fff}
  .leg{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0;color:#ccd;font-size:12px}
  .leg i{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-2px;margin-right:4px}
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px}
  .bloco{background:#1a1c30;border-radius:12px;padding:12px}
  .bloco h3{margin:0 0 8px;font-size:15px}
  .bar{display:flex;align-items:center;gap:8px;margin:5px 0}
  .bar span{width:92px;white-space:nowrap}.bar b{height:14px;border-radius:4px;background:#ffd166;display:block}
  table{width:100%;border-collapse:collapse;font-size:12px} td{padding:3px 4px;border-top:1px solid #2a2c44}
  .ok{color:#43aa8b;font-weight:700}.ruim{color:#e63946;font-weight:700}
</style>
<h1>👑 Rei e Rainha — pico de votos</h1>
<div class="sub" id="sub"></div>
<div id="placar"></div>
<div class="grid" id="grid"></div>
<div class="leg">
  <span><i style="background:#2a2c44"></i>aguardando</span><span><i class="abrindo"></i>abrindo cédula</span>
  <span><i class="pronto"></i>escolheu, esperando o 3-2-1</span><span><i class="enviando"></i>enviando</span>
  <span><i class="fila"></i>fila cheia, tentando de novo</span><span><i class="registrado"></i>registrado</span>
  <span><i class="erro"></i>erro</span><span><i style="background:#2a2c44;outline:2px solid #fff"></i>janela na tela</span>
</div>
<div class="cols">
  <div class="bloco"><h3>🤴 Rei (planilha)</h3><div id="rei"></div></div>
  <div class="bloco"><h3>👸 Rainha (planilha)</h3><div id="rainha"></div></div>
</div>
<div class="bloco" style="margin-top:14px"><h3>🚨 Tentativas de fraude (mesmo instante)</h3><table id="fraudes"></table></div>
<div class="bloco" style="margin-top:14px;display:none" id="checks"><h3>Conferência final</h3><table id="tchecks"></table></div>`)

function apuracao() {
  const votos = backend.linhas('Votos')
  const conta = (k) => votos.reduce((a, v) => ((a[v[k]] = (a[v[k]] || 0) + 1), a), {})
  return { votos, rei: conta('voto_rei'), rainha: conta('voto_rainha') }
}
async function desenhar(extra = {}) {
  const { votos, rei, rainha } = apuracao()
  const nomes = (cat) => CANDIDATOS.filter((c) => c.categoria === cat).map((c) => `${c.nome} ${c.sobrenome} (${c.id})`)
  await painel.evaluate((d) => {
    const $ = (id) => document.getElementById(id)
    $('sub').textContent = d.sub
    $('placar').textContent = d.placar
    $('grid').innerHTML = d.pessoas.map((p) => `<div class="t ${p.estado} ${p.tipo === 'tela' ? 'tela' : ''}" title="${p.id}">${p.n}</div>`).join('')
    const barras = (nomes, conta) => {
      const max = Math.max(1, ...nomes.map((n) => conta[n] || 0))
      return nomes.map((n) => `<div class="bar"><span>${n.replace(/ \(.*/, '')}</span><b style="width:${((conta[n] || 0) / max) * 150}px"></b>${conta[n] || 0}</div>`).join('')
    }
    $('rei').innerHTML = barras(d.nomesRei, d.rei)
    $('rainha').innerHTML = barras(d.nomesRainha, d.rainha)
    $('fraudes').innerHTML = d.fraudes.map((f) => `<tr><td>${f.n}</td><td>${f.grupo}</td><td>${f.id}</td><td class="${f.estado === 'registrado' ? 'ok' : f.estado === 'erro' ? 'ruim' : ''}">${f.resposta || f.estado}</td></tr>`).join('')
    if (d.checks) {
      $('checks').style.display = 'block'
      $('tchecks').innerHTML = d.checks.map(([t, ok]) => `<tr><td class="${ok ? 'ok' : 'ruim'}">${ok ? '✅' : '❌'}</td><td>${t}</td></tr>`).join('')
    }
  }, {
    sub: `${PESSOAS} pessoas: ${CELULARES} nas janelas ao lado, ${NAVEGADORES - CELULARES} em navegadores escondidos, ${PESSOAS - NAVEGADORES} pelo mesmo pedido que o site faz · Google: ${google.pedidos} pedidos, fila cheia ${google.filaCheia}×, pico ${google.picoSimultaneo} juntos`,
    placar: extra.placar ?? `${votos.length} votos na planilha`,
    pessoas: pessoas.map(({ n, id, estado, tipo }) => ({ n, id, estado, tipo })),
    fraudes: fraudes.map(({ n, grupo, id, estado, resposta }) => ({ n, grupo, id, estado, resposta })),
    nomesRei: nomes('rei'), nomesRainha: nomes('rainha'), rei, rainha, checks: extra.checks,
  }).catch(() => {})
}
let placarFixo
const loopPainel = setInterval(() => desenhar(placarFixo ? { placar: placarFixo } : {}), 300)

// ------------------------------------------------------- largada no 3-2-1
let largar
const largada = new Promise((r) => { largar = r })

// Pessoa pela tela (janela visível ou navegador escondido).
async function votarNaTela(nav, p) {
  const ctx = await nav.newContext(celular)
  await ligar(ctx)
  const page = await ctx.newPage()
  page.on('request', (req) => {
    if (req.method() !== 'POST' || !req.url().startsWith('https://script.google.com')) return
    p.tentativas++
    p.estado = p.tentativas > 1 ? 'fila' : 'enviando'
  })
  try {
    p.estado = 'abrindo'
    await page.goto(`${SITE}/votacao`, { timeout: 60000 })
    await page.getByRole('button', { name: 'Confirmar voto' }).waitFor({ timeout: 60000 })
    if (p.tipo === 'tela') await legenda(page, `Pessoa ${p.n} · ${p.id} · escolhendo…`)
    await grade(page, 0).getByRole('button', { name: new RegExp(p.rei.nome) }).click()
    await grade(page, 1).getByRole('button', { name: new RegExp(p.rainha.nome) }).click()
    await page.getByLabel('CPF').fill(p.cpf)
    await page.getByLabel('ID da inscrição').fill(p.id)
    await page.getByRole('button', { name: 'Confirmar voto' }).scrollIntoViewIfNeeded()
    p.estado = 'pronto'
    if (p.tipo === 'tela') await legenda(page, `Pessoa ${p.n} · rei ${p.rei.nome}, rainha ${p.rainha.nome} · esperando o 3-2-1`)
    await largada
    await page.getByRole('button', { name: 'Confirmar voto' }).click()
    if (p.tipo === 'tela') await legenda(page, `Pessoa ${p.n} · enviando…`)
    const ok = page.getByText('Voto registrado')
    const erro = page.locator('p.text-coral')
    await Promise.race([ok.waitFor({ timeout: 120000 }), erro.waitFor({ timeout: 120000 })])
    p.resposta = (await ok.isVisible()) ? 'registrado' : await erro.textContent()
    p.estado = p.resposta === 'registrado' ? 'registrado' : 'erro'
    if (p.tipo === 'tela') await legenda(page, `Pessoa ${p.n} · ${p.resposta} (${p.tentativas} envio(s))`)
  } catch (e) {
    p.estado = 'erro'
    p.resposta = `FALHOU: ${String(e.message).split('\n')[0]}`
  }
  return { ctx, page }
}

// Pessoa pelo pedido: o mesmo que o site faz (status, depois votar com as
// mesmas novas tentativas de src/data/reiRainha.js).
const ocupado = (r) => r && !r.ok && (r.ocupado || /^(Muita gente|Erro inesperado)/.test(r.erro || ''))
async function votarPorPedido(p) {
  try {
    p.estado = 'abrindo'
    await googleGet({ acao: 'status' })
    p.estado = 'pronto'
    await largada
    let r
    for (let t = 0; t < 5; t++) {
      if (t) await esperar(2000 * t)
      p.tentativas++
      p.estado = t ? 'fila' : 'enviando'
      r = await googlePost(JSON.stringify({ acao: 'votar', cpf: p.cpf, id: p.id, rei: p.rei.id, rainha: p.rainha.id }))
      if (!ocupado(r)) break
    }
    p.resposta = r.ok ? 'registrado' : r.erro
    p.estado = r.ok ? 'registrado' : 'erro'
  } catch (e) {
    p.estado = 'erro'
    p.resposta = `FALHOU: ${e.message}`
  }
}

// Janelas de celular lado a lado, à direita do painel.
const largura = Math.floor((1920 - 760) / Math.max(1, CELULARES))
const navsTela = await Promise.all(pessoas.filter((p) => p.tipo === 'tela')
  .map((p, i) => janela({ x: 760 + i * largura, y: 0, w: largura, h: 1040, slowMo: 120 })))
const navEscondido = await chromium.launch()

const inicio = Date.now()
const abertas = []
const trabalho = [
  ...pessoas.map(async (p, i) => {
    if (p.tipo === 'tela') abertas.push(await votarNaTela(navsTela[i], p))
    else if (p.tipo === 'navegador') { const { ctx } = await votarNaTela(navEscondido, p); await ctx.close() }
    else await votarPorPedido(p)
  }),
  ...fraudes.map((f) => votarPorPedido(f)),
]

// Espera todo mundo ficar pronto (com prazo) e faz a contagem.
for (let i = 0; i < 240; i++) {
  const prontos = [...pessoas, ...fraudes].filter((p) => p.estado !== 'aguardando' && p.estado !== 'abrindo').length
  placarFixo = `Preparando: ${prontos}/${pessoas.length + fraudes.length} com rei e rainha escolhidos`
  if (prontos === pessoas.length + fraudes.length) break
  await esperar(500)
}
for (const n of ['3', '2', '1']) { placarFixo = n; await esperar(1000) }
placarFixo = 'TODO MUNDO CONFIRMOU!'
const t0 = Date.now()
largar()
await esperar(1500)
placarFixo = undefined
await Promise.all(trabalho)
const duracao = ((Date.now() - t0) / 1000).toFixed(1)

// ---------------------------------------------------------- conferência
const { votos, rei, rainha } = apuracao()
const votosPico = votos.filter((v) => String(v.id_inscricao).startsWith('TESTE-'))
const registrados = pessoas.filter((p) => p.estado === 'registrado').length
const porGrupo = (g) => fraudes.filter((f) => f.grupo === g && f.estado === 'registrado').length
const unico = (k) => new Set(votos.map((v) => v[k])).size === votos.length
const soma = (o) => Object.values(o).reduce((a, b) => a + b, 0)
const esperadoLinhas = PESSOAS + 2 // + 1 do "mesmo CPF" e 1 do "mesmo ID"
const checks = [
  [`${registrados}/${PESSOAS} pessoas viram "Voto registrado"`, registrados === PESSOAS],
  [`Planilha com ${votosPico.length} votos do pico (esperado ${esperadoLinhas}: ${PESSOAS} + 1 de cada fraude que podia entrar)`, votosPico.length === esperadoLinhas],
  ['Todo voto tem um rei E uma rainha', votos.every((v) => v.voto_rei && v.voto_rainha)],
  [`Total do rei (${soma(rei)}) = total da rainha (${soma(rainha)}) = linhas (${votos.length})`, soma(rei) === votos.length && soma(rainha) === votos.length],
  ['Nenhum CPF votou duas vezes', unico('cpf_hash')],
  ['Nenhum ID votou duas vezes', unico('id_inscricao')],
  ['Cada voto foi para o candidato que a pessoa escolheu', pessoas.every((p) => votos.some((v) => v.id_inscricao === p.id
    && v.voto_rei === `${p.rei.nome} ${p.rei.sobrenome} (${p.rei.id})` && v.voto_rainha === `${p.rainha.nome} ${p.rainha.sobrenome} (${p.rainha.id})`))],
  [`Mesmo CPF com 2 IDs: entrou ${porGrupo('Mesmo CPF, 2 IDs')} (esperado 1)`, porGrupo('Mesmo CPF, 2 IDs') === 1],
  [`Mesmo ID com 2 CPFs: entrou ${porGrupo('Mesmo ID, 2 CPFs')} (esperado 1)`, porGrupo('Mesmo ID, 2 CPFs') === 1],
  [`ID que não existe: entrou ${porGrupo('ID que não existe')} (esperado 0)`, porGrupo('ID que não existe') === 0],
  [`Fila cheia ${google.filaCheia}× e o site tentou de novo sozinho`, true],
]
clearInterval(loopPainel)
await desenhar({ placar: `${votos.length} votos · ${duracao} s do 3-2-1 até o último`, checks })

console.log(`\n${PESSOAS} pessoas confirmaram juntas; o último voto entrou ${duracao} s depois.`)
console.log(`Google simulado: ${google.pedidos} pedidos, fila cheia ${google.filaCheia}×, até ${google.picoSimultaneo} execuções juntas.`)
const ruins = [...pessoas, ...fraudes].filter((p) => p.estado === 'erro')
if (ruins.length) console.table(ruins.map(({ n, id, tentativas, resposta }) => ({ n, id, tentativas, resposta })))
console.log('\nApuração:')
console.table([...Object.entries(rei).map(([k, v]) => ({ categoria: 'rei', candidato: k, votos: v })),
  ...Object.entries(rainha).map(([k, v]) => ({ categoria: 'rainha', candidato: k, votos: v }))])
checks.forEach(([t, ok]) => console.log(`${ok ? '✅' : '❌'} ${t}`))

console.log(`\nJanelas abertas por ${SEGURAR} s para você olhar…`)
await esperar(SEGURAR * 1000)
await Promise.all([navPainel, navEscondido, ...navsTela].map((n) => n.close().catch(() => {})))
process.exit(checks.every(([, ok]) => ok) ? 0 : 1)
