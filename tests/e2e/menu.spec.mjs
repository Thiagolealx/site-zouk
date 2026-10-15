import { test, expect } from '@playwright/test'
import { ligarBackend, sementePadrao } from './apoio.mjs'

// No celular o menu fica atrás do ☰.
async function abrirMenu(page) {
  const botao = page.getByRole('button', { name: 'Abrir menu' })
  if (await botao.isVisible()) await botao.click()
}

test('mostrar_no_menu = SIM: aba Rei & Rainha aparece no menu', async ({ page }) => {
  await ligarBackend(page, sementePadrao({ menu: 'SIM' }))
  await page.goto('/')
  await abrirMenu(page)
  await expect(page.getByRole('link', { name: 'Rei & Rainha' }).first()).toBeVisible()
})

test('mostrar_no_menu = NAO: aba some do menu, mas o link direto funciona', async ({ page }) => {
  await ligarBackend(page, sementePadrao({ menu: 'NAO', votacao: 'NAO' }))
  await page.goto('/')
  await abrirMenu(page)
  await expect(page.getByRole('link', { name: 'Camisas' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Rei & Rainha' })).toHaveCount(0)

  await page.goto('/rei-e-rainha')
  await expect(page.getByRole('button', { name: 'Enviar candidatura' })).toBeVisible()
})

test('planilha sem a linha mostrar_no_menu: fica escondido', async ({ page }) => {
  const semente = sementePadrao()
  semente.abas.Config = semente.abas.Config.filter((l) => l[0] !== 'mostrar_no_menu')
  await ligarBackend(page, semente)
  await page.goto('/')
  await abrirMenu(page)
  await expect(page.getByRole('link', { name: 'Camisas' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Rei & Rainha' })).toHaveCount(0)
})
