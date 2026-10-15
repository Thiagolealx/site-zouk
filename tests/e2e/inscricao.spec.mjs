import { test, expect } from '@playwright/test'
import { ligarBackend, sementePadrao, gerarCpf, png } from './apoio.mjs'

const FOTO = { name: 'eu.png', mimeType: 'image/png', buffer: png(1600, 2000, [40, 120, 200]) }

async function preencher(page, { nome = 'Maria', sobrenome = 'Silva', cpf, estado = 'PB', categoria = 'Rainha' }) {
  await page.getByRole('button', { name: new RegExp(`${categoria} do baile`) }).click()
  await page.getByLabel('Nome', { exact: true }).fill(nome)
  await page.getByLabel('Sobrenome').fill(sobrenome)
  await page.getByLabel('CPF').fill(cpf)
  await page.getByLabel('Estado').selectOption(estado)
  await page.locator('input[type=file]').setInputFiles(FOTO)
  await expect(page.getByAltText('Sua foto')).toBeVisible()
}

test('candidatura completa cai na planilha como PENDENTE, com o CPF intacto', async ({ page }) => {
  const { backend } = await ligarBackend(page, sementePadrao({ votacao: 'NAO' }))
  await page.goto('/rei-e-rainha')

  // CPF começando com zero: é o caso que o Sheets estragava.
  const cpf = gerarCpf('012345678')
  await preencher(page, { cpf })
  await page.getByRole('button', { name: 'Enviar candidatura' }).click()
  await expect(page.getByText('Candidatura enviada')).toBeVisible()

  const [linha] = backend.linhas('Candidatos')
  expect(linha).toMatchObject({ nome: 'Maria', sobrenome: 'Silva', estado: 'PB', categoria: 'rainha', aprovado: 'PENDENTE' })
  expect(String(linha.cpf)).toBe(cpf)
  expect(backend.arquivos.size).toBe(1)

  // A foto chega reduzida (1600x2000 vira no máximo 1000px), não os MB da câmera.
  const [foto] = backend.arquivos.values()
  expect(foto.tipo).toBe('image/jpeg')
  expect(foto.bytes.length).toBeLessThan(300_000)
})

test('mesmo CPF não se candidata duas vezes', async ({ page }) => {
  await ligarBackend(page, sementePadrao({ votacao: 'NAO' }))
  const cpf = gerarCpf()

  await page.goto('/rei-e-rainha')
  await preencher(page, { cpf })
  await page.getByRole('button', { name: 'Enviar candidatura' }).click()
  await expect(page.getByText('Candidatura enviada')).toBeVisible()

  await page.reload()
  await preencher(page, { cpf, nome: 'Outra', categoria: 'Rei' })
  await page.getByRole('button', { name: 'Enviar candidatura' }).click()
  await expect(page.getByText('Já existe uma candidatura com este CPF.')).toBeVisible()
})

test('CPF inválido é barrado antes de enviar', async ({ page }) => {
  const { postsRecebidos } = await ligarBackend(page, sementePadrao({ votacao: 'NAO' }))
  await page.goto('/rei-e-rainha')
  await preencher(page, { cpf: '123.456.789-00' })
  await page.getByRole('button', { name: 'Enviar candidatura' }).click()
  await expect(page.getByText('Confira o CPF.')).toBeVisible()
  expect(postsRecebidos).toHaveLength(0)
})

test('sem foto não envia', async ({ page }) => {
  const { postsRecebidos } = await ligarBackend(page, sementePadrao({ votacao: 'NAO' }))
  await page.goto('/rei-e-rainha')
  await page.getByRole('button', { name: /Rei do baile/ }).click()
  await page.getByLabel('Nome', { exact: true }).fill('João')
  await page.getByLabel('Sobrenome').fill('Lima')
  await page.getByLabel('CPF').fill(gerarCpf())
  await page.getByLabel('Estado').selectOption('RN')
  await page.getByRole('button', { name: 'Enviar candidatura' }).click()
  await expect(page.getByText('Envie uma foto.')).toBeVisible()
  expect(postsRecebidos).toHaveLength(0)
})

test('resposta perdida na candidatura: o site reenvia e não duplica', async ({ page }) => {
  const { backend, postsRecebidos } = await ligarBackend(page, sementePadrao({ votacao: 'NAO' }), { perderPrimeiraResposta: true })
  await page.goto('/rei-e-rainha')
  await preencher(page, { cpf: gerarCpf() })
  await page.getByRole('button', { name: 'Enviar candidatura' }).click()
  await expect(page.getByText('Candidatura enviada')).toBeVisible()
  expect(postsRecebidos).toHaveLength(2)
  expect(backend.linhas('Candidatos')).toHaveLength(1)
})

test('inscrições fechadas escondem o formulário', async ({ page }) => {
  await ligarBackend(page, sementePadrao({ inscricoes: 'NAO', votacao: 'NAO' }))
  await page.goto('/rei-e-rainha')
  await expect(page.getByText('As inscrições estão encerradas.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enviar candidatura' })).toHaveCount(0)
})
