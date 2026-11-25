/**
 * Códigos de votação (Rei & Rainha) a partir do relatório de inscrições.
 *
 *   node tools/codigos-eleitores.mjs "<relatorio.pdf>"
 *
 * - Cada pessoa ganha um código aleatório ZJ-XXXXXX uma única vez. O código
 *   fica salvo em eleitores/codigos.json e nunca muda nem é reaproveitado,
 *   mesmo que a pessoa saia de um relatório novo.
 * - Rodar de novo com um relatório atualizado só cria código para quem é novo.
 * - Saídas (em eleitores/, fora do git: tem dado pessoal):
 *     lista.csv   todo mundo do relatório atual, em ordem alfabética
 *     novos-<data>.csv  só quem ganhou código nesta rodada, já no formato da
 *                 aba Eleitores (cpf, id_inscricao, nome, votou_em). Cole
 *                 só esses na planilha: colar a lista toda de novo apagaria
 *                 o CPF e o votou_em de quem já votou.
 *
 * A pessoa é reconhecida pelo nome (o relatório não traz CPF), ignorando
 * acento, maiúscula e espaço sobrando.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// Mesmo alfabeto do Apps Script: sem 0/O, 1/I/L, que confundem no celular.
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const PASTA = path.join(path.dirname(fileURLToPath(import.meta.url)), '../eleitores')
const REGISTRO = path.join(PASTA, 'codigos.json')

const pdf = process.argv[2]
if (!pdf || !fs.existsSync(pdf)) {
  console.error('Uso: node tools/codigos-eleitores.mjs "<relatorio.pdf>"')
  process.exit(1)
}

const chave = (nome) =>
  nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

// Nome com cada palavra capitalizada só para exibir (o relatório mistura caixa).
const ordenar = (a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })

function lerRelatorio(arquivo) {
  const texto = execFileSync('pdftotext', ['-layout', arquivo, '-'], { encoding: 'utf8' })
  const pessoas = []
  for (const linha of texto.split('\n')) {
    // Linha de pessoa começa na coluna 0; continuação de célula quebrada
    // começa com espaço. Cabeçalhos ficam de fora.
    if (!linha || linha[0] === ' ' || linha[0] === '\f') continue
    // Nome comprido encosta na situação com um espaço só ("... Souza Pago"),
    // então a situação é achada pelo valor, não pela largura da coluna.
    const m = linha.match(/^(.+?)\s+(Pago|Pendente|Parcial|Cancelad[oa]|-)(?:\s{2,}(.*))?$/)
    if (!m || /^(Nome|Gerado em|Total|Relatório)\b/.test(m[1])) continue
    const resto = (m[3] || '').trim().split(/\s{2,}/).filter(Boolean)
    const uf = /^([A-Z]{2}|-)$/.test(resto.at(-1) || '') ? resto.at(-1) : ''
    pessoas.push({ nome: m[1].replace(/\s+/g, ' ').trim(), situacao: m[2], categoria: resto[0] || '', uf })
  }
  return pessoas
}

function novoCodigo(usados) {
  for (;;) {
    const id = 'ZJ-' + Array.from({ length: 6 }, () => ALFABETO[crypto.randomInt(ALFABETO.length)]).join('')
    if (!usados.has(id)) return id
  }
}

const csv = (linhas) =>
  linhas.map((l) => l.map((v) => (/[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v)).join(',')).join('\n') + '\n'

fs.mkdirSync(PASTA, { recursive: true })
const registro = fs.existsSync(REGISTRO) ? JSON.parse(fs.readFileSync(REGISTRO, 'utf8')) : {}
const usados = new Set(Object.values(registro).map((r) => r.id))

const pessoas = lerRelatorio(pdf)
const vistos = new Set()
const repetidos = []
const novos = []
const agora = new Date().toISOString()

for (const p of pessoas) {
  const k = chave(p.nome)
  if (vistos.has(k)) { repetidos.push(p.nome); continue }
  vistos.add(k)
  if (!registro[k]) {
    const id = novoCodigo(usados)
    usados.add(id)
    registro[k] = { nome: p.nome, id, criado_em: agora }
    novos.push({ nome: p.nome, id })
  }
  p.id = registro[k].id
}

// Grava o registro primeiro: é ele que garante que o código não muda.
fs.writeFileSync(REGISTRO, JSON.stringify(registro, null, 2) + '\n')

const atuais = pessoas.filter((p) => p.id).sort(ordenar)
fs.writeFileSync(path.join(PASTA, 'lista.csv'), csv([
  ['nome', 'codigo', 'situacao', 'categoria', 'uf'],
  ...atuais.map((p) => [p.nome, p.id, p.situacao, p.categoria, p.uf]),
]))
// Para a aba Eleitores. Um arquivo por rodada com gente nova, para uma rodada
// vazia não apagar a lista anterior que ainda não foi colada.
const paraPlanilha = (lista) => csv([
  ['cpf', 'id_inscricao', 'nome', 'votou_em'],
  ...lista.slice().sort(ordenar).map((p) => ['', p.id, p.nome, '']),
])
let arquivoNovos = ''
if (novos.length) {
  arquivoNovos = `novos-${agora.slice(0, 19).replace(/[T:]/g, '-')}.csv`
  fs.writeFileSync(path.join(PASTA, arquivoNovos), paraPlanilha(novos))
}

const sumiram = Object.entries(registro).filter(([k]) => !vistos.has(k)).map(([, r]) => r.nome)
console.log(`Relatório: ${pessoas.length} linhas, ${atuais.length} pessoas`)
console.log(`Códigos novos nesta rodada: ${novos.length}${arquivoNovos ? ` → ${arquivoNovos}` : ''}`)
console.log(`Total no registro: ${Object.keys(registro).length}`)
if (repetidos.length) console.log(`Nome repetido no relatório (um código só): ${repetidos.join('; ')}`)
if (sumiram.length) console.log(`Têm código mas não estão neste relatório: ${sumiram.join('; ')}`)
console.log(`Arquivos em ${PASTA}`)
