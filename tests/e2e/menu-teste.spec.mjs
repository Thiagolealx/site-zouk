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
  expect(b.abas.Resultado.dados[1]).toEqual(expect.arrayContaining(['Davi Melo (R1)', 5]))

  b.menu('apagarTeste')
  expect(b.linhas('Eleitores').map((l) => l.id_inscricao)).toEqual(['ZJ-REAL22', 'ZJ-REAL33'])
  expect(b.linhas('Votos').map((l) => l.id_inscricao)).toEqual(['ZJ-REAL22', 'ZJ-REAL33'])
  expect(b.abas.Resultado.dados[1]).toEqual(expect.arrayContaining(['Davi Melo (R1)', 2]))
})

test('cada voto grava (flush) antes de soltar a trava', () => {
  const b = criarBackend(sementePadrao({ ids: ['ZJ-AAAA22'], candidatos: [
    { id: 'R1', nome: 'Davi', sobrenome: 'Melo', categoria: 'rei' },
    { id: 'Q1', nome: 'Ana', sobrenome: 'Souza', categoria: 'rainha' },
  ] }))
  b.atender('POST', { corpo: JSON.stringify({ acao: 'votar', cpf: gerarCpf(), id: 'ZJ-AAAA22', rei: 'R1', rainha: 'Q1' }) })
  expect(b.stats.flushes).toBeGreaterThan(0)
})
