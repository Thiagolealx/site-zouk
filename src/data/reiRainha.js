// Link do App da Web do Apps Script (apps-script/Codigo.gs), publicado a
// partir da planilha "Rei e Rainha - Planilha Principal" no Drive.
// Computador e site oficial usam o mesmo link.
export const API_URL =
  'https://script.google.com/macros/s/AKfycbzX4fLMdoWqwwqF-ACDRRWOmvzDrFTa8xLkaH5d-IaUyzPyBOvVYAmZY0uDeuBCbrNCcQ/exec'

export const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

export const soDigitos = (v) => String(v || '').replace(/\D/g, '')

export function mascaraCpf(v) {
  const d = soDigitos(v).slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

// Mesma conta do script: aqui só para avisar antes de enviar.
export function cpfValido(v) {
  const cpf = soDigitos(v)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  const dv = (n) => {
    let soma = 0
    for (let i = 0; i < n; i++) soma += Number(cpf[i]) * (n + 1 - i)
    const r = (soma * 10) % 11
    return r === 10 ? 0 : r
  }
  return dv(9) === Number(cpf[9]) && dv(10) === Number(cpf[10])
}

// Teste de carga: o Google às vezes demora 30 s+ ou devolve 404 em vez de
// responder. Corta a espera e tenta de novo, em vez de deixar a página
// travada em "Carregando…".
async function comPrazo(url, opcoes, ms) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), ms)
  try {
    const res = await fetch(url, { ...opcoes, signal: ctl.signal })
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

const CHAVE_STATUS = 'reiRainha:status'

/** Último status que este aparelho viu: a página abre na hora com ele. */
export function statusGuardado() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_STATUS))
  } catch {
    return null
  }
}

// Menu e página pedem o status ao mesmo tempo: um pedido só serve os dois.
let pedindo = null

export function buscarStatus() {
  pedindo ||= pedirStatus().finally(() => { pedindo = null })
  return pedindo
}

async function pedirStatus() {
  let erro
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    try {
      const st = await comPrazo(`${API_URL}?acao=status`, {}, 12000)
      try {
        localStorage.setItem(CHAVE_STATUS, JSON.stringify({ ...st, vistoEm: Date.now() }))
      } catch {
        // Sem armazenamento (aba anônima): só não guarda.
      }
      return st
    } catch (e) {
      erro = e
    }
  }
  throw erro
}

/**
 * A aba "Rei & Rainha" aparece no menu? Quem manda é `mostrar_no_menu` na
 * planilha. O menu está em todas as páginas: para não encher o Apps Script
 * de pedidos (e atrasar os votos), só pergunta de novo a cada 5 minutos.
 */
export async function mostrarNoMenu() {
  const guardado = statusGuardado()
  if (guardado && Date.now() - (guardado.vistoEm || 0) < 5 * 60 * 1000) return !!guardado.mostrarNoMenu
  return !!(await buscarStatus()).mostrarNoMenu
}

// Sem Content-Type de propósito: vai como text/plain, que o navegador manda
// sem preflight — o Apps Script não responde a OPTIONS.
// Prazo largo: com fila de votos o script pode segurar o pedido ~25 s.
const post = (dados) => comPrazo(API_URL, { method: 'POST', body: JSON.stringify(dados) }, 45000)

// Fila cheia no script (muita gente votando no último minuto).
const ocupado = (r) => r && !r.ok && (r.ocupado || /^Muita gente/.test(r.erro || ''))

// No 4G do evento a resposta às vezes se perde depois de o script já ter
// gravado, e no último minuto a fila do script pode encher. Tentar de novo é
// seguro: o script reconhece o mesmo envio e confirma sem gravar de novo.
export async function enviar(dados) {
  let ultimo
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    if (tentativa) await new Promise((r) => setTimeout(r, 2000 * tentativa))
    try {
      const r = await post(dados)
      if (!ocupado(r)) return r
      ultimo = r
    } catch (e) {
      ultimo = e
    }
  }
  if (ultimo instanceof Error) throw ultimo
  return ultimo
}

/**
 * Reduz a foto no próprio celular antes de subir: foto de câmera passa
 * fácil de 5 MB, e a cédula só precisa de ~800px.
 */
export function reduzirFoto(arquivo, lado = 1000) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo)
    const img = new Image()
    img.onload = () => {
      const escala = Math.min(1, lado / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * escala)
      canvas.height = Math.round(img.height * escala)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não deu para ler essa imagem.'))
    }
    img.src = url
  })
}
