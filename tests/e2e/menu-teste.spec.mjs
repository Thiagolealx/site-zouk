import { test, expect } from '@playwright/test'
import { criarBackend, sementePadrao, gerarCpf } from '../fake/appsScript.mjs'

// Menu "🧪 Teste de carga" da planilha: cria IDs TESTE-, e o "apagar" tira
// só o que é do teste, sem mexer nos IDs e votos de verdade.
test('teste de carga: cria IDs TESTE-, apaga só eles e os votos deles', () => {
  const b = criarBackend(sementePadrao({ ids: ['ZJ-REAL22', 'ZJ-REAL33'], candidatos: [
    { id: 'R1', nome: 'Davi', sobrenome: 'Melo', categoria: 'rei' },
    { id: 'Q1', nome: 'Ana', sobrenome: 'Souza', categoria: 'rainha' },
  ] }))
  const votar = (id) => b.atender('POST', { corpo: JSON.stringify({ acao: 'votar', cpf: gerarCpf(), id, rei: 'R1', rainha: 'Q1' }) })

  expect(votar('ZJ-REAL22').ok).toBe(true)
  b.menu('criarIdsDeTeste', 5)
  expect(b.linhas('Eleitores').map((l) => l.id_inscricao)).toEqual(
    ['ZJ-REAL22', 'ZJ-REAL33', 'TESTE-001', 'TESTE-002', 'TESTE-003', 'TESTE-004', 'TESTE-005'])
  ;['TESTE-001', 'TESTE-003', 'TESTE-005'].forEach((id) => expect(votar(id).ok).toBe(true))
  expect(votar('ZJ-REAL33').ok).toBe(true)
  b.menu('atualizarResultado')
  expect(b.abas.Resultado.dados[1]).toEqual(expect.arrayContaining(['Davi Melo (R1)', 5]))

  b.menu('apagarTeste')
  expect(b.linhas('Eleitores').map((l) => l.id_inscricao)).toEqual(['ZJ-REAL22', 'ZJ-REAL33'])
  expect(b.linhas('Votos').map((l) => l.id_inscricao)).toEqual(['ZJ-REAL22', 'ZJ-REAL33'])
  expect(b.abas.Resultado.dados[1]).toEqual(expect.arrayContaining(['Davi Melo (R1)', 2]))
})

test('voto grava fora da fila: a fila só guarda a reserva do CPF e do ID', () => {
  const b = criarBackend(sementePadrao({ ids: ['ZJ-AAAA22'], candidatos: [
    { id: 'R1', nome: 'Davi', sobrenome: 'Melo', categoria: 'rei' },
    { id: 'Q1', nome: 'Ana', sobrenome: 'Souza', categoria: 'rainha' },
  ] }))
  b.atender('POST', { corpo: JSON.stringify({ acao: 'votar', cpf: gerarCpf(), id: 'ZJ-AAAA22', rei: 'R1', rainha: 'Q1' }) })
  const props = Object.fromEntries(b.props)
  expect(Object.keys(props).some((k) => k.startsWith('voto:'))).toBe(true)
  expect(JSON.parse(props['id:ZJ-AAAA22']).hash).toBeTruthy()
  expect(b.linhas('Votos')).toHaveLength(1)
})

// Dois celulares mandando no mesmo instante: no Google os dois leem a
// planilha antes de qualquer um gravar. Aqui a gravação na planilha fica
// guardada até o fim, para imitar isso; quem barra é a reserva.
test('envios simultâneos: reserva barra mesmo CPF em 2 IDs e mesmo ID com 2 CPFs', () => {
  const b = criarBackend(sementePadrao({ ids: ['ZJ-AAAA22', 'ZJ-BBBB33'], candidatos: [
    { id: 'R1', nome: 'Davi', sobrenome: 'Melo', categoria: 'rei' },
    { id: 'Q1', nome: 'Ana', sobrenome: 'Souza', categoria: 'rainha' },
  ] }))
  const depois = []
  for (const nome of ['Votos', 'Eleitores']) {
    const aba = b.abas[nome]
    const { appendRow, getRange } = aba
    aba.appendRow = (l) => depois.push(() => appendRow(l))
    aba.getRange = (...a) => ({
      setValue: (v) => depois.push(() => getRange(...a).setValue(v)),
      setValues: (v) => depois.push(() => getRange(...a).setValues(v)),
    })
  }
  const votar = (cpf, id) => b.atender('POST', { corpo: JSON.stringify({ acao: 'votar', cpf, id, rei: 'R1', rainha: 'Q1' }) })

  const cpf = gerarCpf()
  const r1 = votar(cpf, 'ZJ-AAAA22')
  const r2 = votar(cpf, 'ZJ-BBBB33')        // mesmo CPF, outro ID
  const r3 = votar(gerarCpf(), 'ZJ-AAAA22') // mesmo ID, outro CPF
  const r4 = votar(cpf, 'ZJ-AAAA22')        // reenvio do mesmo voto
  const r5 = votar(gerarCpf(), 'ZJ-BBBB33') // outra pessoa, junto: linha própria
  depois.forEach((f) => f())

  expect(r1.ok).toBe(true)
  expect(r2.erro).toBe('Este CPF já votou. Cada pessoa vota uma vez só.')
  expect(r3.erro).toBe('Este ID já foi usado por outro CPF.')
  expect(r4.ok).toBe(true)
  expect(r5.ok).toBe(true)
  expect(b.linhas('Votos').map((v) => v.id_inscricao)).toEqual(['ZJ-AAAA22', 'ZJ-BBBB33'])
})
