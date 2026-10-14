// Link do App da Web do Apps Script (apps-script/Codigo.gs), publicado a
// partir da planilha "Rei e Rainha - Planilha Principal" no Drive.
// Vazio = as páginas mostram "em breve".
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

export async function buscarStatus() {
  const res = await fetch(`${API_URL}?acao=status`)
  return res.json()
}

// Sem Content-Type de propósito: vai como text/plain, que o navegador manda
// sem preflight — o Apps Script não responde a OPTIONS.
async function post(dados) {
  const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(dados) })
  return res.json()
}

// No 4G do evento a resposta às vezes se perde depois de o script já ter
// gravado. Uma segunda tentativa é segura: o script reconhece o mesmo envio
// e confirma sem gravar de novo.
export async function enviar(dados) {
  try {
    return await post(dados)
  } catch {
    await new Promise((r) => setTimeout(r, 2000))
    return post(dados)
  }
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
