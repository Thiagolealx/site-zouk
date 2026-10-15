import zlib from 'node:zlib'
import { criarBackend, sementePadrao } from '../fake/appsScript.mjs'

export { sementePadrao }
export { gerarCpf } from '../fake/appsScript.mjs'

export const CANDIDATOS = [
  { id: 'R1', nome: 'Davi', sobrenome: 'Melo', categoria: 'rei' },
  { id: 'R2', nome: 'Edu', sobrenome: 'Rocha', categoria: 'rei', estado: 'SP' },
  { id: 'Q1', nome: 'Ana', sobrenome: 'Souza', categoria: 'rainha' },
  { id: 'Q2', nome: 'Bia', sobrenome: 'Lima', categoria: 'rainha', estado: 'PE' },
]

/**
 * Liga a página ao simulador: toda chamada ao script.google.com cai no
 * Codigo.gs rodando em memória, e as fotos do Drive viram um PNG local.
 * `perderPrimeiraResposta`: o script grava, mas a resposta não chega —
 * o 4G fraco do evento.
 */
export async function ligarBackend(page, semente, { perderPrimeiraResposta = false, falharGets = 0, atrasoGetMs = 0 } = {}) {
  const backend = criarBackend(semente)
  let perder = perderPrimeiraResposta
  let falhas = falharGets
  const postsRecebidos = []
  const getsRecebidos = []

  await page.route('https://script.google.com/**', async (route) => {
    const req = route.request()
    if (req.method() === 'GET') {
      getsRecebidos.push(req.url())
      // O que o teste de carga pegou no Google: página HTML 404 no lugar do JSON.
      if (falhas > 0) {
        falhas--
        return route.fulfill({ status: 404, contentType: 'text/html', body: '<title>Página não encontrada</title>' })
      }
      if (atrasoGetMs) await new Promise((r) => setTimeout(r, atrasoGetMs))
      const query = Object.fromEntries(new URL(req.url()).searchParams)
      return route.fulfill({ json: backend.atender('GET', { query }) }).catch(() => {})
    }
    const corpo = req.postData() || ''
    postsRecebidos.push(JSON.parse(corpo))
    const resposta = backend.atender('POST', { corpo })
    if (perder) {
      perder = false
      return route.abort('connectionreset')
    }
    return route.fulfill({ json: resposta })
  })
  await page.route('https://drive.google.com/thumbnail**', (route) =>
    route.fulfill({ contentType: 'image/png', body: png(80, 100, [251, 106, 85]) }))

  return { backend, postsRecebidos, getsRecebidos }
}

/** PNG de uma cor só, para a foto da candidatura. */
export function png(w, h, [r, g, b]) {
  const linha = Buffer.concat([Buffer.from([0]), Buffer.from(Array(w).fill([r, g, b]).flat())])
  const cru = Buffer.concat(Array(h).fill(linha))
  const bloco = (tipo, dados) => {
    const t = Buffer.from(tipo)
    const len = Buffer.alloc(4); len.writeUInt32BE(dados.length)
    const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(Buffer.concat([t, dados])) >>> 0)
    return Buffer.concat([len, t, dados, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloco('IHDR', ihdr), bloco('IDAT', zlib.deflateSync(cru)), bloco('IEND', Buffer.alloc(0)),
  ])
}
