import { test, expect } from '@playwright/test'
import { ligarBackend, sementePadrao, gerarCpf, CANDIDATOS } from './apoio.mjs'

const IDS = ['ZJ-AAAA22', 'ZJ-BBBB33', 'ZJ-CCCC44']
const semente = (extra = {}) => sementePadrao({ ids: IDS, candidatos: CANDIDATOS, ...extra })

async function votar(page, { rei = 'Davi Melo', rainha = 'Ana Souza', cpf, id }) {
  await page.getByRole('button', { name: new RegExp(rei) }).click()
  await page.getByRole('button', { name: new RegExp(rainha) }).click()
  await page.getByLabel('CPF').fill(cpf)
  await page.getByLabel('ID da inscrição').fill(id)
  await page.getByRole('button', { name: 'Confirmar voto' }).click()
}

test('voto completo: grava o voto, o CPF no ID e conta no resultado', async ({ page }) => {
  const { backend } = await ligarBackend(page, semente())
  await page.goto('/votacao')

  await expect(page.getByRole('button', { name: /Davi Melo/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Bia Lima/ })).toBeVisible()

  const cpf = gerarCpf('098765432')
  // ID em minúscula: a pessoa digita como quiser.
  await votar(page, { cpf, id: IDS[0].toLowerCase() })
  await expect(page.getByText('Voto registrado')).toBeVisible()

  const [voto] = backend.linhas('Votos')
  expect(voto).toMatchObject({ id_inscricao: IDS[0], voto_rei: 'Davi Melo (R1)', voto_rainha: 'Ana Souza (Q1)' })
  expect(voto.cpf_hash).not.toContain(cpf)

  const eleitor = backend.linhas('Eleitores').find((l) => l.id_inscricao === IDS[0])
  expect(String(eleitor.cpf)).toBe(cpf)
  expect(eleitor.votou_em).toBeTruthy()
  expect(backend.abas.Resultado.dados[1]).toEqual(expect.arrayContaining(['Davi Melo (R1)', 1, 'Ana Souza (Q1)']))
})

test('mesmo CPF não vota duas vezes, nem trocando de ID', async ({ page }) => {
  const { backend } = await ligarBackend(page, semente())
  const cpf = gerarCpf()
  await page.goto('/votacao')
  await votar(page, { cpf, id: IDS[0] })
  await expect(page.getByText('Voto registrado')).toBeVisible()

  await page.reload()
  await votar(page, { cpf, id: IDS[1], rei: 'Edu Rocha' })
  await expect(page.getByText('Este CPF já votou. Cada pessoa vota uma vez só.')).toBeVisible()
  expect(backend.linhas('Votos')).toHaveLength(1)
})

test('ID usado por um CPF não serve para outro', async ({ page }) => {
  const { backend } = await ligarBackend(page, semente())
  await page.goto('/votacao')
  await votar(page, { cpf: gerarCpf(), id: IDS[0] })
  await expect(page.getByText('Voto registrado')).toBeVisible()

  await page.reload()
  await votar(page, { cpf: gerarCpf(), id: IDS[0] })
  await expect(page.getByText('Este ID já foi usado por outro CPF.')).toBeVisible()
  expect(backend.linhas('Votos')).toHaveLength(1)
})

test('ID que não existe é recusado', async ({ page }) => {
  const { backend } = await ligarBackend(page, semente())
  await page.goto('/votacao')
  await votar(page, { cpf: gerarCpf(), id: 'ZJ-INVENT' })
  await expect(page.getByText('ID não encontrado. Confira o código que você recebeu.')).toBeVisible()
  expect(backend.linhas('Votos')).toHaveLength(0)
})

test('sem escolher rei e rainha não envia', async ({ page }) => {
  const { postsRecebidos } = await ligarBackend(page, semente())
  await page.goto('/votacao')
  await page.getByRole('button', { name: /Davi Melo/ }).click()
  await page.getByLabel('CPF').fill(gerarCpf())
  await page.getByLabel('ID da inscrição').fill(IDS[0])
  await page.getByRole('button', { name: 'Confirmar voto' }).click()
  await expect(page.getByText('Escolha um rei e uma rainha.')).toBeVisible()
  expect(postsRecebidos).toHaveLength(0)
})

test('resposta perdida no voto (4G fraco): site reenvia, mostra sucesso e não duplica', async ({ page }) => {
  const { backend, postsRecebidos } = await ligarBackend(page, semente(), { perderPrimeiraResposta: true })
  await page.goto('/votacao')
  await votar(page, { cpf: gerarCpf(), id: IDS[0] })
  await expect(page.getByText('Voto registrado')).toBeVisible()
  expect(postsRecebidos).toHaveLength(2)
  expect(backend.linhas('Votos')).toHaveLength(1)
})

test('candidato pendente não aparece na cédula', async ({ page }) => {
  await ligarBackend(page, sementePadrao({
    ids: IDS,
    candidatos: [...CANDIDATOS, { id: 'R9', nome: 'Pendente', sobrenome: 'Silva', categoria: 'rei', aprovado: 'PENDENTE' }],
  }))
  await page.goto('/votacao')
  await expect(page.getByRole('button', { name: /Davi Melo/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Pendente Silva/ })).toHaveCount(0)
})

test('votação fechada: sem cédula', async ({ page }) => {
  await ligarBackend(page, semente({ votacao: 'NAO' }))
  await page.goto('/votacao')
  await expect(page.getByText('A votação ainda não está aberta.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmar voto' })).toHaveCount(0)
})

test('com a votação aberta, a página de candidatura leva para a votação', async ({ page }) => {
  await ligarBackend(page, semente())
  await page.goto('/rei-e-rainha')
  await page.getByRole('link', { name: 'Votar agora' }).click()
  await expect(page).toHaveURL(/\/votacao$/)
  await expect(page.getByRole('button', { name: 'Confirmar voto' })).toBeVisible()
})
