import { test, expect } from '@playwright/test'
import { ligarBackend, sementePadrao, CANDIDATOS } from './apoio.mjs'

const semente = () => sementePadrao({ ids: ['ZJ-AAAA22'], candidatos: CANDIDATOS })

test('Google devolve 404 duas vezes: a página tenta de novo e carrega a cédula', async ({ page }) => {
  const { getsRecebidos } = await ligarBackend(page, semente(), { falharGets: 2 })
  await page.goto('/votacao')
  await expect(page.getByRole('button', { name: /Davi Melo/ })).toBeVisible()
  // Duas falhas + a tentativa que deu certo (o React de dev pode somar uma).
  expect(getsRecebidos.length).toBeGreaterThanOrEqual(3)
})

test('com o Google lento, quem já abriu antes vê a cédula na hora', async ({ page }) => {
  await ligarBackend(page, semente())
  await page.goto('/votacao')
  await expect(page.getByRole('button', { name: /Davi Melo/ })).toBeVisible()

  // Segunda visita com o script levando 8 s para responder.
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await ligarBackend(page, semente(), { atrasoGetMs: 8000 })
  const t0 = Date.now()
  await page.reload()
  await expect(page.getByRole('button', { name: /Davi Melo/ })).toBeVisible()
  expect(Date.now() - t0).toBeLessThan(4000)
})
