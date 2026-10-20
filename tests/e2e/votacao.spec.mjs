import { test, expect } from '@playwright/test'
import { ligarBackend, sementePadrao, gerarCpf, png, CANDIDATOS } from './apoio.mjs'

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

test('fila cheia no último minuto: o site espera, tenta de novo e o voto entra', async ({ page }) => {
  const { backend, postsRecebidos } = await ligarBackend(page, semente(), { filaCheia: 3 })
  await page.goto('/votacao')
  await votar(page, { cpf: gerarCpf(), id: IDS[0] })
  await expect(page.getByText('Seu voto está na fila')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('Voto registrado')).toBeVisible({ timeout: 20000 })
  expect(postsRecebidos).toHaveLength(4)
  expect(backend.linhas('Votos')).toHaveLength(1)
})

test('candidato tirado da cédula (NAO/PENDENTE) não aparece', async ({ page }) => {
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

test('foto do Drive que falha na primeira vez: o site pede de novo e ela aparece', async ({ page }) => {
  await ligarBackend(page, semente())
  const pedidos = {}
  // Registrada depois, tem prioridade sobre a rota de fotos do apoio.
  await page.route('https://drive.google.com/thumbnail**', (route) => {
    const id = new URL(route.request().url()).searchParams.get('id')
    pedidos[id] = (pedidos[id] || 0) + 1
    if (pedidos[id] === 1) return route.abort('connectionreset')
    return route.fulfill({ contentType: 'image/png', body: png(80, 100, [251, 106, 85]) })
  })
  await page.goto('/votacao')
  const fotos = page.locator('button[aria-pressed] img')
  await expect(fotos).toHaveCount(4)
  for (let i = 0; i < 4; i++) await fotos.nth(i).scrollIntoViewIfNeeded()
  await expect.poll(() => fotos.evaluateAll((imgs) => imgs.filter((i) => i.naturalWidth > 0).length)).toBe(4)
})
