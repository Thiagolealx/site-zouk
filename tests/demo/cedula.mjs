/**
 * Mostra a cédula NA TELA, devagar: uma pessoa vota no rei e depois na rainha.
 *
 *   node tests/demo/cedula.mjs            (precisa do `npm run dev` ligado)
 *     --site=http://localhost:5173       outro endereço do site
 *     --pausa=3                          segundos parado em cada passo
 *
 * Não toca na planilha de verdade: o Codigo.gs roda aqui (tests/fake) com
 * candidatos de exemplo e a votação aberta.
 */
import { chromium, devices } from '@playwright/test'
import { criarBackend, sementePadrao, gerarCpf } from '../fake/appsScript.mjs'
import { png } from '../e2e/apoio.mjs'

const op = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const SITE = op.site || 'http://localhost:5173'
const PAUSA = Number(op.pausa || 3) * 1000
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))

const CANDIDATOS = [
  { id: 'R1', nome: 'Davi', sobrenome: 'Melo', categoria: 'rei', cor: [70, 130, 230] },
  { id: 'R2', nome: 'Edu', sobrenome: 'Rocha', categoria: 'rei', estado: 'SP', cor: [40, 170, 120] },
  { id: 'R3', nome: 'Caio', sobrenome: 'Nunes', categoria: 'rei', estado: 'RN', cor: [120, 90, 200] },
  { id: 'Q1', nome: 'Ana', sobrenome: 'Souza', categoria: 'rainha', cor: [240, 90, 140] },
  { id: 'Q2', nome: 'Bia', sobrenome: 'Lima', categoria: 'rainha', estado: 'PE', cor: [250, 150, 60] },
  { id: 'Q3', nome: 'Lia', sobrenome: 'Costa', categoria: 'rainha', estado: 'CE', cor: [230, 200, 60] },
]
const backend = criarBackend(sementePadrao({ ids: ['ZJ-DEMO22'], candidatos: CANDIDATOS }))
const fotos = Object.fromEntries(CANDIDATOS.map((c) => [c.id, png(240, 300, c.cor)]))

const nav = await chromium.launch({ headless: false, channel: op.chromium ? undefined : 'chrome', slowMo: 250,
  args: ['--window-size=460,1000'] })
const ctx = await nav.newContext({ ...devices['Pixel 7'], viewport: { width: 412, height: 860 } })
await ctx.route('https://script.google.com/**', async (route) => {
  const req = route.request()
  await esperar(500)
  const json = req.method() === 'GET'
    ? backend.atender('GET', { query: Object.fromEntries(new URL(req.url()).searchParams) })
    : backend.atender('POST', { corpo: req.postData() || '' })
  await route.fulfill({ json })
})
await ctx.route('https://drive.google.com/thumbnail**', (route) =>
  route.fulfill({ contentType: 'image/png', body: fotos[new URL(route.request().url()).searchParams.get('id')] || fotos.R1 }))

const page = await ctx.newPage()
async function passo(texto, ms = PAUSA) {
  console.log(texto)
  await page.evaluate((t) => {
    let el = document.getElementById('legenda-demo')
    if (!el) {
      el = document.createElement('div')
      el.id = 'legenda-demo'
      el.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;padding:12px;border-radius:12px;'
        + 'background:rgba(0,0,0,.88);color:#fff;font:600 15px/1.35 system-ui;text-align:center;pointer-events:none'
      document.body.appendChild(el)
    }
    el.textContent = t
  }, texto)
  await esperar(ms)
}
const secao = (titulo) => page.getByRole('heading', { name: titulo })
const rolarAte = (loc) => loc.evaluate((el) => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))

await page.goto(`${SITE}/votacao`)
await page.getByRole('button', { name: 'Confirmar voto' }).waitFor()
await passo('1 · A página de votação abre')

await rolarAte(secao(/Rei do baile/))
await passo('2 · Primeiro bloco: 🤴 REI DO BAILE, só os candidatos a rei')
await page.getByRole('button', { name: /Edu Rocha/ }).click()
await passo('3 · Toca no rei escolhido: o card fica marcado')

await rolarAte(secao(/Rainha do baile/))
await passo('4 · Logo abaixo, separado: 👸 RAINHA DO BAILE')
await page.getByRole('button', { name: /Lia Costa/ }).click()
await passo('5 · Toca na rainha escolhida')

await rolarAte(secao(/Confirme seu voto/))
await passo('6 · No fim: CPF e código recebido (ZJ-…)')
await page.getByLabel('CPF').pressSequentially(gerarCpf('123456789'), { delay: 60 })
await page.getByLabel('ID da inscrição').pressSequentially('ZJ-DEMO22', { delay: 80 })
await passo('7 · Confere e aperta Confirmar voto', 2000)
await page.getByRole('button', { name: 'Confirmar voto' }).click()
await page.getByText('Voto registrado').waitFor({ timeout: 30000 })
await page.getByText('Voto registrado').evaluate((el) => el.scrollIntoView({ block: 'center' }))
await passo('8 · Voto registrado: 1 rei + 1 rainha', PAUSA * 2)

const [v] = backend.linhas('Votos')
console.log(`planilha de teste → rei: ${v.voto_rei} | rainha: ${v.voto_rainha}`)
await nav.close()
