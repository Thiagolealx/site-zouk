/**
 * N pessoas de verdade (navegadores de celular) abrindo a votação e votando
 * ao mesmo tempo, contra o Apps Script e as fotos do Drive reais.
 *
 *   node tests/carga/real.mjs <url-do-site> <ids.txt>
 *
 * ids.txt: um ID livre por linha. Linhas extras "FRAUDE:<id>" tentam votar
 * com um ID já usado ou inexistente (tem que ser recusado).
 * Grava votos de verdade na planilha: apague depois do teste.
 */
import fs from 'node:fs'
import { chromium, devices } from '@playwright/test'
import { gerarCpf } from '../fake/appsScript.mjs'

const [site, arquivoIds] = process.argv.slice(2)
if (!site || !arquivoIds) {
  console.error('uso: node tests/carga/real.mjs <url-do-site> <ids.txt>')
  process.exit(1)
}
const linhas = fs.readFileSync(arquivoIds, 'utf8').split(/\s+/).filter(Boolean)
const s = (ms) => (ms / 1000).toFixed(1)

async function pessoa(navegador, linha, n) {
  const fraude = linha.startsWith('FRAUDE:')
  const id = fraude ? linha.slice(7) : linha
  const ctx = await navegador.newContext({ ...devices['Pixel 7'] })
  const page = await ctx.newPage()
  const r = { n, id, fraude }
  try {
    const t0 = Date.now()
    await page.goto(`${site}/votacao`)
    await page.getByRole('button', { name: 'Confirmar voto' }).waitFor({ timeout: 90000 })
    r.cedula = Date.now() - t0

    // Rola até cada foto (são lazy) e espera carregar.
    const fotos = page.locator('button[aria-pressed] img')
    r.fotos = await fotos.count()
    const t1 = Date.now()
    for (let i = 0; i < r.fotos; i++) await fotos.nth(i).scrollIntoViewIfNeeded()
    await page.waitForFunction(() => [...document.querySelectorAll('button[aria-pressed] img')]
      .every((img) => img.complete), null, { timeout: 60000 }).catch(() => {})
    r.fotosOk = await page.evaluate(() => [...document.querySelectorAll('button[aria-pressed] img')]
      .filter((img) => img.complete && img.naturalWidth > 0).length)
    r.tempoFotos = Date.now() - t1

    // Escolhe um rei e uma rainha ao acaso (as grades vêm na ordem rei, rainha).
    const grades = page.locator('div.mt-14')
    for (const g of [0, 1]) {
      const cards = grades.nth(g).locator('button[aria-pressed]')
      const k = await cards.count()
      await cards.nth(Math.floor(Math.random() * k)).click()
    }
    await page.getByLabel('CPF').fill(gerarCpf())
    await page.getByLabel('ID da inscrição').fill(id)
    if (n === 0) await page.screenshot({ path: 'tests/carga/cedula.png', fullPage: true })

    const t2 = Date.now()
    await page.getByRole('button', { name: 'Confirmar voto' }).click()
    const ok = page.getByText('Voto registrado')
    const erro = page.locator('p.text-coral')
    await Promise.race([ok.waitFor({ timeout: 90000 }), erro.waitFor({ timeout: 90000 })])
    r.voto = Date.now() - t2
    r.resultado = (await ok.isVisible()) ? 'registrado' : await erro.textContent()
  } catch (e) {
    r.resultado = `FALHOU: ${e.message.split('\n')[0]}`
  } finally {
    await ctx.close()
  }
  return r
}

const navegador = await chromium.launch()
const inicio = Date.now()
const rs = await Promise.all(linhas.map((l, n) => pessoa(navegador, l, n)))
await navegador.close()

console.table(rs.map((r) => ({
  pessoa: r.n + 1,
  id: r.id + (r.fraude ? ' (fraude)' : ''),
  'cédula (s)': r.cedula != null ? s(r.cedula) : '-',
  fotos: r.fotos != null ? `${r.fotosOk}/${r.fotos}` : '-',
  'fotos (s)': r.tempoFotos != null ? s(r.tempoFotos) : '-',
  'voto (s)': r.voto != null ? s(r.voto) : '-',
  resultado: r.resultado,
})))
const honestos = rs.filter((r) => !r.fraude)
const fraudes = rs.filter((r) => r.fraude)
const max = (k) => s(Math.max(...rs.filter((r) => r[k] != null).map((r) => r[k])))
console.log(`Tudo em ${s(Date.now() - inicio)} s`)
console.log(`Votos registrados: ${honestos.filter((r) => r.resultado === 'registrado').length}/${honestos.length}`)
console.log(`Fraudes barradas: ${fraudes.filter((r) => r.resultado !== 'registrado' && !String(r.resultado).startsWith('FALHOU')).length}/${fraudes.length}`)
console.log(`Pior tempo: cédula ${max('cedula')} s, fotos ${max('tempoFotos')} s, voto ${max('voto')} s`)
console.log(`Fotos quebradas: ${rs.reduce((a, r) => a + ((r.fotos || 0) - (r.fotosOk || 0)), 0)}`)
