/**
 * Simulador do Google Apps Script para testes.
 *
 * Roda o apps-script/Codigo.gs de verdade dentro de um contexto Node com
 * uma planilha em memória. Imita o que o Sheets faz e já deu bug aqui:
 * texto só de dígitos vira número (o CPF perde o zero da frente), a não
 * ser que venha com apóstrofo.
 */
import fs from 'node:fs'
import vm from 'node:vm'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.dirname(fileURLToPath(import.meta.url))
const CODIGO = fs.readFileSync(path.join(raiz, '../../apps-script/Codigo.gs'), 'utf8')

// O que o Sheets faz com um valor escrito numa célula.
function comoSheets(v) {
  if (typeof v !== 'string') return v
  if (v.startsWith("'")) return v.slice(1)
  if (/^\d+$/.test(v)) return Number(v)
  return v
}

function criarAba(nome, linhas = []) {
  const d = linhas.map((l) => l.slice())
  const largura = () => Math.max(0, ...d.map((l) => l.length))
  const garantir = (r) => { while (d.length < r) d.push([]) }
  const faixa = (r, c, nr = 1, nc = 1) => ({
    getValues: () => Array.from({ length: nr }, (_, i) =>
      Array.from({ length: nc }, (_, j) => (d[r - 1 + i] || [])[c - 1 + j] ?? '')),
    getValue: () => (d[r - 1] || [])[c - 1] ?? '',
    setValue(v) { garantir(r); d[r - 1][c - 1] = comoSheets(v); return this },
    setValues(vs) {
      vs.forEach((linha, i) => linha.forEach((v, j) => {
        garantir(r + i); d[r - 1 + i][c - 1 + j] = comoSheets(v)
      }))
      return this
    },
    setFontWeight() { return this },
    setNumberFormat() { return this },
  })
  return {
    dados: d,
    getName: () => nome,
    getDataRange: () => faixa(1, 1, d.length, largura()),
    getRange: (a, c, nr, nc) => (typeof a === 'string' ? faixa(1, 1) : faixa(a, c, nr, nc)),
    appendRow(linha) { d.push(linha.map(comoSheets)) },
    deleteRows(inicio, qtd) { d.splice(inicio - 1, qtd) },
    clear() { d.length = 0 },
    getLastRow: () => d.length,
    getLastColumn: () => largura(),
    setFrozenRows() {},
  }
}

/**
 * Cria uma instância isolada: planilha, Drive e script próprios.
 * `semente` = { abas: { Nome: [[...linhas]] } }
 */
export function criarBackend(semente = {}) {
  const abas = {}
  for (const [nome, linhas] of Object.entries(semente.abas || {})) abas[nome] = criarAba(nome, linhas)
  const arquivos = new Map()
  const props = new Map([['PASTA_FOTOS', 'pasta-fotos'], ['SAL', 'sal-de-teste']])
  const stats = { execucoes: 0 }
  const cache = new Map()
  // Menu da planilha: `respostas` são o que a pessoa digitaria nos prompts.
  const respostas = []
  const ui = {
    Button: { OK: 'ok' },
    ButtonSet: { OK_CANCEL: 'okc' },
    prompt: () => ({ getSelectedButton: () => 'ok', getResponseText: () => String(respostas.shift()) }),
    alert() {},
  }

  const planilha = {
    getSheetByName: (n) => abas[n] || null,
    insertSheet: (n) => (abas[n] = criarAba(n)),
    getSheets: () => Object.values(abas),
    deleteSheet: (a) => delete abas[a.getName()],
    getId: () => 'planilha',
    rename() {},
    toast() {},
  }

  const contexto = vm.createContext({
    console,
    SpreadsheetApp: {
      getActiveSpreadsheet: () => planilha,
      getActive: () => planilha,
      flush() { stats.flushes = (stats.flushes || 0) + 1 },
      getUi: () => ui,
    },
    DriveApp: {
      Access: { ANYONE_WITH_LINK: 'link' },
      Permission: { VIEW: 'view' },
      getFolderById: () => ({
        createFile(blob) {
          const id = 'foto-' + crypto.randomUUID().slice(0, 8)
          arquivos.set(id, blob)
          return { getId: () => id, setSharing() {} }
        },
      }),
    },
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      base64Decode: (s) => [...Buffer.from(s, 'base64')],
      newBlob: (bytes, tipo, nome) => ({ bytes, tipo, nome }),
      DigestAlgorithm: { SHA_256: 'sha256' },
      computeDigest: (_, s) => [...crypto.createHash('sha256').update(s).digest()].map((b) => (b > 127 ? b - 256 : b)),
    },
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: (k) => props.get(k) ?? null, setProperty: (k, v) => props.set(k, v) }),
    },
    // Node roda uma chamada por vez: o lock sempre pega. Concorrência real
    // (limite de execuções simultâneas do Google) só no teste contra o Google.
    CacheService: {
      getScriptCache: () => ({ get: (k) => cache.get(k) ?? null, put: (k, v) => cache.set(k, v), remove: (k) => cache.delete(k) }),
    },
    LockService: {
      getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }),
      getDocumentLock: () => ({ tryLock: () => true, releaseLock() {} }),
    },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (s) => ({ conteudo: s, setMimeType() { return this } }),
    },
  })
  vm.runInContext(CODIGO, contexto, { filename: 'Codigo.gs' })

  return {
    abas,
    arquivos,
    stats,
    /** Mesmo contrato do App da Web: GET ?acao=… ou POST com corpo JSON. */
    atender(metodo, { query = {}, corpo = '' } = {}) {
      stats.execucoes++
      const saida = metodo === 'GET'
        ? contexto.doGet({ parameter: query })
        : contexto.doPost({ postData: { contents: corpo } })
      return JSON.parse(saida.conteudo)
    },
    /** Clica num item do menu "Rei e Rainha" (`digitar` = resposta do prompt). */
    menu(funcao, ...digitar) {
      respostas.push(...digitar)
      contexto[funcao]()
    },
    /** Edição à mão na planilha: no Google o onEdit limpa o cache. */
    editouAMao() { contexto.onEdit() },
    linhas(nome) {
      const [cab, ...resto] = abas[nome].dados
      return resto.map((l) => Object.fromEntries(cab.map((c, i) => [c, l[i] ?? ''])))
    },
  }
}

/** Planilha pronta para testar: config, candidatos aprovados e IDs livres. */
export function sementePadrao({ inscricoes = 'SIM', votacao = 'SIM', menu = 'SIM', ids = [], candidatos = [] } = {}) {
  return {
    abas: {
      Config: [
        ['chave', 'valor', 'explicacao'],
        ['inscricoes_abertas', inscricoes, ''],
        ['inscricoes_ate', '', ''],
        ['votacao_aberta', votacao, ''],
        ['mostrar_no_menu', menu, ''],
      ],
      Candidatos: [
        ['id', 'data_inscricao', 'nome', 'sobrenome', 'cpf', 'estado', 'categoria', 'foto_url', 'aprovado'],
        ...candidatos.map((c) => [c.id, '', c.nome, c.sobrenome, '', c.estado || 'PB', c.categoria,
          `https://drive.google.com/thumbnail?id=${c.id}`, c.aprovado || 'SIM']),
      ],
      Eleitores: [['cpf', 'id_inscricao', 'nome', 'votou_em'], ...ids.map((id) => ['', id, '', ''])],
      Votos: [['data_voto', 'cpf_hash', 'id_inscricao', 'voto_rei', 'voto_rainha']],
      Resultado: [[]],
    },
  }
}

/** CPF válido aleatório (ou a partir de 9 dígitos dados). */
export function gerarCpf(base) {
  const n = (base || String(Math.floor(Math.random() * 1e9)).padStart(9, '0')).split('').map(Number)
  const dv = (arr) => {
    const s = arr.reduce((acc, d, i) => acc + d * (arr.length + 1 - i), 0)
    const r = (s * 10) % 11
    return r === 10 ? 0 : r
  }
  n.push(dv(n))
  n.push(dv(n))
  return n.join('')
}
