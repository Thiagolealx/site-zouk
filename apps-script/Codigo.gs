/**
 * Rei e Rainha do Baile — Zouk Jampa 2026
 *
 * Backend da inscrição e da votação. Roda dentro de uma planilha
 * (Extensões → Apps Script) e é publicado como App da Web. O site
 * conversa só com este script. Basta uma planilha em branco: configurar()
 * monta as abas e as pastas.
 *
 * GET  ?acao=status      → o que está aberto + candidatos aprovados
 * POST {acao:'inscrever'} → nova candidatura (já entra aprovada na cédula)
 * POST {acao:'votar'}     → um voto por CPF + ID do congresso
 */

// Aparece em ?acao=status: mostra qual versão do código está publicada.
// Troque a cada mudança no script.
const VERSAO_CODIGO = '2026-10-20.3'

const NOME_PASTA = 'Rei e Rainha do Baile - Zouk Jampa 2026'
const NOME_PLANILHA = 'Rei e Rainha - Planilha Principal'

const CATEGORIAS = ['rei', 'rainha']

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

const CABECALHOS = {
  Candidatos: ['id', 'data_inscricao', 'nome', 'sobrenome', 'cpf', 'estado', 'categoria', 'foto_url', 'aprovado'],
  Eleitores: ['cpf', 'id_inscricao', 'nome', 'votou_em'],
  Votos: ['data_voto', 'cpf_hash', 'id_inscricao', 'voto_rei', 'voto_rainha'],
}

/**
 * Rode UMA VEZ pelo editor (botão ▶ Executar) depois de colar o script.
 * Monta as abas, cria a pasta do evento com a subpasta de fotos, guarda a
 * planilha lá dentro e pede as autorizações. Rodar de novo não apaga dados.
 */
function configurar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  ss.rename(NOME_PLANILHA)

  const config = ss.getSheetByName('Config') || ss.insertSheet('Config')
  if (!config.getRange('A1').getValue()) {
    config.getRange(1, 1, 5, 3).setValues([
      ['chave', 'valor', 'explicacao'],
      ['inscricoes_abertas', 'SIM', 'SIM ou NAO'],
      ['inscricoes_ate', '', 'Data limite (dd/mm/aaaa). Vazio = sem limite'],
      ['votacao_aberta', 'NAO', 'SIM ou NAO'],
      ['mostrar_no_menu', 'NAO', 'SIM = aba "Rei & Rainha" no menu do site. NAO = só quem tem o link'],
    ])
    config.getRange('A1:C1').setFontWeight('bold')
  }

  Object.keys(CABECALHOS).forEach((nome) => {
    const aba = ss.getSheetByName(nome) || ss.insertSheet(nome)
    const cab = CABECALHOS[nome]
    aba.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold')
    aba.setFrozenRows(1)
  })

  // CPF e ID como texto puro, para o Sheets não comer zero à esquerda.
  ss.getSheetByName('Eleitores').getRange('A:B').setNumberFormat('@')
  ss.getSheetByName('Candidatos').getRange('E:E').setNumberFormat('@')

  atualizarResultado()

  // A aba que a planilha nova traz de fábrica ("Página1"), se ficou vazia.
  ss.getSheets().forEach((aba) => {
    if (!['Config', 'Resultado'].concat(Object.keys(CABECALHOS)).includes(aba.getName()) &&
        aba.getLastRow() === 0) ss.deleteSheet(aba)
  })

  const props = PropertiesService.getScriptProperties()
  // Sal do hash do CPF: gerado uma vez e guardado fora da planilha.
  if (!props.getProperty('SAL')) props.setProperty('SAL', Utilities.getUuid())

  if (!props.getProperty('PASTA_FOTOS')) {
    // Planilha que já mora na pasta do evento reaproveita ela e a de fotos.
    const arquivo = DriveApp.getFileById(ss.getId())
    const pais = arquivo.getParents()
    let pasta = null
    while (pais.hasNext()) {
      const p = pais.next()
      if (p.getName() === NOME_PASTA) pasta = p
    }
    if (!pasta) {
      pasta = DriveApp.createFolder(NOME_PASTA)
      arquivo.moveTo(pasta)
    }
    const fotos = pasta.getFoldersByName('Fotos dos Candidatos')
    props.setProperty('PASTA_FOTOS',
      (fotos.hasNext() ? fotos.next() : pasta.createFolder('Fotos dos Candidatos')).getId())
  }
}

/**
 * Reescreve a aba Resultado com a contagem atual. Roda sozinha depois dos
 * votos (recontar) e ao fechar a votação; pelo menu "Rei e Rainha" dá para rodar na mão (se apagar um voto, por
 * exemplo). Contagem feita aqui e não por fórmula: QUERY quebra conforme o
 * idioma da planilha.
 */
function atualizarResultado() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  // Linha em branco no meio (voto apagado à mão) não conta.
  const votos = linhasComo(aba_('Votos')).filter((v) => v.cpf_hash)
  const contar = (coluna) => {
    const n = {}
    votos.forEach((v) => { if (v[coluna]) n[v[coluna]] = (n[v[coluna]] || 0) + 1 })
    return Object.keys(n).map((k) => [k, n[k]]).sort((x, y) => y[1] - x[1])
  }

  const aba = ss.getSheetByName('Resultado') || ss.insertSheet('Resultado')
  aba.clear()
  const blocos = [['REI', contar('voto_rei'), 1], ['RAINHA', contar('voto_rainha'), 4]]
  blocos.forEach(([titulo, linhas, col]) => {
    aba.getRange(1, col, 1, 2).setValues([[titulo, 'votos']]).setFontWeight('bold')
    if (linhas.length) aba.getRange(2, col, linhas.length, 2).setValues(linhas)
  })
  aba.getRange(1, 7, 2, 1).setValues([['TOTAL DE VOTOS'], [votos.length]])
  aba.getRange(1, 7).setFontWeight('bold')
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Rei e Rainha')
    .addItem('▶ Abrir votação', 'abrirVotacao')
    .addItem('■ Fechar votação', 'fecharVotacao')
    .addSeparator()
    .addItem('▶ Abrir inscrições', 'abrirInscricoes')
    .addItem('■ Fechar inscrições', 'fecharInscricoes')
    .addSeparator()
    .addItem('👁 Mostrar no menu do site', 'mostrarNoMenu')
    .addItem('🙈 Esconder do menu do site', 'esconderDoMenu')
    .addSeparator()
    .addItem('🔑 Gerar IDs que faltam', 'gerarIds')
    .addItem('Atualizar resultado', 'atualizarResultado')
    .addSeparator()
    .addSubMenu(SpreadsheetApp.getUi().createMenu('🧪 Teste de carga')
      .addItem('Criar IDs de teste (TESTE-001…)', 'criarIdsDeTeste')
      .addItem('Apagar tudo do teste', 'apagarTeste'))
    .addToUi()
}

// Funções declaradas (não const): o menu só acha função global de verdade.
function abrirVotacao() { mudarConfig('votacao_aberta', 'SIM', 'Votação aberta.') }
function fecharVotacao() {
  mudarConfig('votacao_aberta', 'NAO', 'Votação fechada.')
  // Garante o placar final com todos os votos, mesmo se alguma recontagem
  // do último minuto ficou para trás.
  atualizarResultado()
}
function abrirInscricoes() { mudarConfig('inscricoes_abertas', 'SIM', 'Inscrições abertas.') }
function fecharInscricoes() { mudarConfig('inscricoes_abertas', 'NAO', 'Inscrições fechadas.') }
function mostrarNoMenu() { mudarConfig('mostrar_no_menu', 'SIM', 'Aba "Rei & Rainha" aparece no menu do site.') }
function esconderDoMenu() { mudarConfig('mostrar_no_menu', 'NAO', 'Aba "Rei & Rainha" escondida do menu do site.') }

// Sem O/0, I/1/L: o ID é digitado no celular e não pode dar margem a erro.
const ALFABETO_ID = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * Acrescenta IDs novos na aba Eleitores, com o CPF em branco: você entrega
 * o ID à pessoa e o CPF dela entra na linha quando ela vota. Pergunta a
 * quantidade e nunca repete um ID que já existe.
 */
function gerarIds() {
  const ui = SpreadsheetApp.getUi()
  const r = ui.prompt('Gerar IDs', 'Quantos IDs novos?', ui.ButtonSet.OK_CANCEL)
  if (r.getSelectedButton() !== ui.Button.OK) return
  const qtd = parseInt(r.getResponseText(), 10)
  if (!(qtd >= 1 && qtd <= 2000)) return ui.alert('Digite um número de 1 a 2000.')

  const aba = aba_('Eleitores')
  const cab = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0].map((c) => String(c).trim())
  const iId = cab.indexOf('id_inscricao')
  const usados = new Set(linhasComo(aba).map((l) => String(l.id_inscricao).trim().toUpperCase()))

  const novas = []
  while (novas.length < qtd) {
    const id = 'ZJ-' + Array.from({ length: 6 }, () =>
      ALFABETO_ID[Math.floor(Math.random() * ALFABETO_ID.length)]).join('')
    if (usados.has(id)) continue
    usados.add(id)
    const linha = cab.map(() => '')
    linha[iId] = id
    novas.push(linha)
  }
  aba.getRange(aba.getLastRow() + 1, 1, qtd, cab.length).setValues(novas)
  SpreadsheetApp.getActive().toast(`${qtd} ID(s) gerado(s).`, 'Rei e Rainha')
}

// ------------------------------------------------------------ teste de carga
// IDs TESTE-001, TESTE-002… para simular o público votando no site de
// verdade. "Apagar tudo do teste" tira esses IDs e os votos feitos com eles
// e reconta: a planilha volta a ficar como antes.
const PREFIXO_TESTE = 'TESTE-'

function criarIdsDeTeste() {
  const ui = SpreadsheetApp.getUi()
  const r = ui.prompt('Teste de carga', 'Quantos IDs de teste?', ui.ButtonSet.OK_CANCEL)
  if (r.getSelectedButton() !== ui.Button.OK) return
  const qtd = parseInt(r.getResponseText(), 10)
  if (!(qtd >= 1 && qtd <= 999)) return ui.alert('Digite um número de 1 a 999.')
  apagarLinhasDeTeste('Eleitores')
  const aba = aba_('Eleitores')
  const cab = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0].map((c) => String(c).trim())
  const iId = cab.indexOf('id_inscricao')
  const novas = Array.from({ length: qtd }, (_, i) => {
    const linha = cab.map(() => '')
    linha[iId] = PREFIXO_TESTE + String(i + 1).padStart(3, '0')
    return linha
  })
  aba.getRange(aba.getLastRow() + 1, 1, qtd, cab.length).setValues(novas)
  SpreadsheetApp.getActive().toast(`${qtd} ID(s) de teste criados.`, 'Rei e Rainha')
}

function apagarTeste() {
  const n = apagarLinhasDeTeste('Votos')
  PropertiesService.getScriptProperties().deleteProperty('linhaVotos')
  apagarLinhasDeTeste('Eleitores')
  atualizarResultado()
  limparCache()
  SpreadsheetApp.getActive().toast(`Teste apagado (${n} voto(s) de teste).`, 'Rei e Rainha')
}

// Apaga, de baixo para cima, as linhas cujo id_inscricao começa com TESTE-.
function apagarLinhasDeTeste(nome) {
  const aba = aba_(nome)
  const valores = aba.getDataRange().getValues()
  const iId = valores[0].map((c) => String(c).trim()).indexOf('id_inscricao')
  let apagadas = 0
  for (let i = valores.length - 1; i > 0; i--) {
    if (String(valores[i][iId]).toUpperCase().indexOf(PREFIXO_TESTE) !== 0) continue
    let inicio = i
    while (inicio - 1 > 0 && String(valores[inicio - 1][iId]).toUpperCase().indexOf(PREFIXO_TESTE) === 0) inicio--
    aba.deleteRows(inicio + 1, i - inicio + 1)
    apagadas += i - inicio + 1
    i = inicio
  }
  return apagadas
}

// Os botões do menu só escrevem na aba Config; o site lê de lá na hora.
function mudarConfig(chave, valor, aviso) {
  const aba = aba_('Config')
  const linhas = aba.getDataRange().getValues()
  const i = linhas.findIndex((l) => String(l[0]).trim() === chave)
  if (i < 0) aba.appendRow([chave, valor])
  else aba.getRange(i + 1, 2).setValue(valor)
  limparCache()
  SpreadsheetApp.getActive().toast(aviso, 'Rei e Rainha')
}

function pastaFotos() {
  const id = PropertiesService.getScriptProperties().getProperty('PASTA_FOTOS')
  if (!id) throw new Error('Pasta de fotos não configurada. Rode configurar().')
  return DriveApp.getFolderById(id)
}

function doGet(e) {
  const acao = (e && e.parameter && e.parameter.acao) || 'status'
  if (acao !== 'status') return responder({ ok: false, erro: 'Ação desconhecida.' })
  const st = status()
  return responder({ ...st, versao: VERSAO_CODIGO, candidatos: st.votacaoAberta ? st.candidatos : [] })
}

// ------------------------------------------------------------------- cache
// Cada visita lia Config e Candidatos inteiros (~2 s no Google). O status
// fica guardado alguns segundos; qualquer edição na planilha (onEdit) ou
// botão do menu limpa na hora, então aprovar/abrir/fechar vale imediatamente.
const CACHE_SEGUNDOS = 20

function status() {
  const cache = CacheService.getScriptCache()
  const guardado = cache.get('status')
  if (guardado) return JSON.parse(guardado)
  const config = lerConfig()
  const st = {
    ok: true,
    inscricoesAbertas: inscricoesAbertas(config),
    votacaoAberta: sim(config.votacao_aberta),
    // Sem a linha na Config fica escondido: só divulga quando você mandar.
    mostrarNoMenu: sim(config.mostrar_no_menu),
    candidatos: candidatosAprovados(),
  }
  cache.put('status', JSON.stringify(st), CACHE_SEGUNDOS)
  return st
}

function limparCache() {
  CacheService.getScriptCache().remove('status')
}

// Gatilho simples do Sheets: roda sozinho quando alguém edita uma célula à mão.
// Mexeu na Config (fechou a votação na célula, por exemplo): reconta também.
function onEdit(e) {
  limparCache()
  if (e && e.range && e.range.getSheet().getName() === 'Config') atualizarResultado()
}

function doPost(e) {
  let dados
  try {
    dados = JSON.parse(e.postData.contents)
  } catch (err) {
    return responder({ ok: false, erro: 'Requisição inválida.' })
  }
  try {
    if (dados.acao === 'votar') {
      const r = votar(dados)
      if (r.ok) recontar()
      return responder(r)
    }
    if (dados.acao === 'inscrever') return responder(naFila(() => inscrever(dados), 25000))
    return responder({ ok: false, erro: 'Ação desconhecida.' })
  } catch (err) {
    console.error(err)
    return responder({ ok: false, erro: 'Erro inesperado. Tente de novo.' })
  }
}

const OCUPADO = { ok: false, ocupado: true, erro: 'Muita gente votando agora. Tente de novo em alguns segundos.' }

// Uma execução por vez dentro de `fn`. Grava tudo antes de soltar a trava:
// o próximo da fila precisa enxergar o que este escreveu.
function naFila(fn, esperaMs) {
  const lock = LockService.getScriptLock()
  if (!lock.tryLock(esperaMs)) return OCUPADO
  try {
    const r = fn()
    SpreadsheetApp.flush()
    return r
  } finally {
    lock.releaseLock()
  }
}

/**
 * Atualiza a aba Resultado depois dos votos, no máximo a cada 15 s e uma
 * recontagem por vez: com o público todo votando junto, recontar a cada
 * voto deixava a planilha lenta para todo mundo. Os votos dos últimos
 * segundos entram na recontagem seguinte, e ■ Fechar votação reconta tudo.
 */
function recontar() {
  const cache = CacheService.getScriptCache()
  if (cache.get('recontado')) return
  const lock = LockService.getDocumentLock()
  if (!lock.tryLock(0)) return
  try {
    cache.put('recontado', '1', 15)
    atualizarResultado()
  } catch (err) {
    console.error(err)
  } finally {
    lock.releaseLock()
  }
}

// ---------------------------------------------------------------- inscrição

function inscrever(d) {
  if (!inscricoesAbertas(lerConfig())) return { ok: false, erro: 'As inscrições estão encerradas.' }

  const nome = texto(d.nome, 60)
  const sobrenome = texto(d.sobrenome, 80)
  const cpf = soDigitos(d.cpf)
  const estado = String(d.estado || '').toUpperCase()
  const categoria = String(d.categoria || '').toLowerCase()

  if (!nome || !sobrenome) return { ok: false, erro: 'Informe nome e sobrenome.' }
  if (!cpfValido(cpf)) return { ok: false, erro: 'CPF inválido.' }
  if (UFS.indexOf(estado) < 0) return { ok: false, erro: 'Escolha o estado.' }
  if (CATEGORIAS.indexOf(categoria) < 0) return { ok: false, erro: 'Escolha rei ou rainha.' }

  const foto = String(d.foto || '')
  const m = foto.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/)
  if (!m) return { ok: false, erro: 'Envie uma foto.' }
  const bytes = Utilities.base64Decode(m[2])
  if (bytes.length > 5 * 1024 * 1024) return { ok: false, erro: 'Foto muito grande (máx. 5 MB).' }

  const aba = aba_('Candidatos')
  const linhas = linhasComo(aba)
  const anterior = linhas.find((l) => cpfDaCelula(l.cpf) === cpf)
  if (anterior) {
    // Reenvio da mesma candidatura (resposta anterior perdida): confirma.
    const repetido = String(anterior.nome) === nome && String(anterior.sobrenome) === sobrenome &&
      String(anterior.categoria) === categoria
    if (repetido) return { ok: true }
    return { ok: false, erro: 'Já existe uma candidatura com este CPF.' }
  }

  const id = 'C' + Utilities.getUuid().slice(0, 8).toUpperCase()
  const ext = m[1].split('/')[1].replace('jpeg', 'jpg')
  const arquivo = pastaFotos()
    .createFile(Utilities.newBlob(bytes, m[1], `${id} - ${nome} ${sobrenome}.${ext}`))
  arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
  const fotoUrl = `https://drive.google.com/thumbnail?id=${arquivo.getId()}&sz=w800`

  // O apóstrofo segura o CPF como texto: sem ele o Sheets vira número e
  // come o zero da frente.
  // Entra aprovada: aparece na votação na hora. Para tirar alguém da cédula,
  // troque SIM por NAO na coluna aprovado.
  aba.appendRow([id, new Date(), nome, sobrenome, "'" + cpf, estado, categoria, fotoUrl, 'SIM'])
  // Escrita do script não dispara onEdit: limpa o cache aqui para a nova
  // candidatura não esperar os 20 s.
  limparCache()
  return { ok: true }
}

// ------------------------------------------------------------------ votação

function votar(d) {
  const st = status()
  if (!st.votacaoAberta) return { ok: false, erro: 'A votação não está aberta.' }

  const cpf = soDigitos(d.cpf)
  const idInscricao = String(d.id || '').trim().toUpperCase()
  if (!cpfValido(cpf) || !idInscricao) return { ok: false, erro: 'Informe CPF e ID da inscrição.' }

  // O ID vem da lista que a organização gerou. Linha sem CPF = ID ainda não
  // usado: o CPF de quem votar com ele entra ali. Linha com CPF (lista vinda
  // do sistema, ou ID já usado) só aceita aquele CPF.
  const eleitores = aba_('Eleitores')
  const valores = eleitores.getDataRange().getValues()
  const cab = valores[0].map((c) => String(c).trim())
  const iCpf = cab.indexOf('cpf')
  const iId = cab.indexOf('id_inscricao')
  const iVotou = cab.indexOf('votou_em')
  const n = valores.findIndex((l, i) => i > 0 && String(l[iId]).trim().toUpperCase() === idInscricao)
  if (n < 0) return { ok: false, erro: 'ID não encontrado. Confira o código que você recebeu.' }
  const cpfDaLinha = soDigitos(valores[n][iCpf]) ? cpfDaCelula(valores[n][iCpf]) : ''
  if (cpfDaLinha && cpfDaLinha !== cpf) return { ok: false, erro: 'Este ID já foi usado por outro CPF.' }

  const aprovados = st.candidatos
  const rei = aprovados.find((c) => c.id === d.rei && c.categoria === 'rei')
  const rainha = aprovados.find((c) => c.id === d.rainha && c.categoria === 'rainha')
  const rotulo = (c) => `${c.nome} ${c.sobrenome} (${c.id})`
  const voto = rei && rainha ? `${rotulo(rei)}|${rotulo(rainha)}` : ''

  const hash = hashCpf(cpf)
  const votos = aba_('Votos')
  const linhasVotos = linhasComo(votos)
  const anterior = linhasVotos.find((l) => l.cpf_hash === hash)
  if (anterior) {
    // O mesmo voto chegando de novo é o site repetindo o envio porque a
    // resposta do primeiro se perdeu (4G fraco): confirma sem gravar.
    const repetido = String(anterior.id_inscricao).toUpperCase() === idInscricao &&
      `${anterior.voto_rei}|${anterior.voto_rainha}` === voto
    if (repetido) return { ok: true }
    return { ok: false, erro: 'Este CPF já votou. Cada pessoa vota uma vez só.' }
  }
  if (linhasVotos.some((l) => String(l.id_inscricao).toUpperCase() === idInscricao)) {
    return { ok: false, erro: 'Este ID já foi usado por outro CPF.' }
  }
  if (!voto) return { ok: false, erro: 'Escolha um rei e uma rainha.' }

  // Até aqui só leitura, cada um no seu tempo. Na fila fica só a reserva do
  // CPF e do ID (décimos de segundo), para dois envios simultâneos não
  // passarem os dois. A gravação na planilha vem depois, fora da fila.
  const reserva = naFila(() => reservar(hash, idInscricao, voto, votos), 20000)
  if (!reserva.ok || reserva.jaGravando) return reserva.ok ? { ok: true } : reserva

  const agora = new Date()
  if (!cpfDaLinha) eleitores.getRange(n + 1, iCpf + 1).setValue("'" + cpf)
  if (iVotou >= 0) eleitores.getRange(n + 1, iVotou + 1).setValue(agora)
  // Linha reservada na fila, e não appendRow: dois appendRow ao mesmo tempo
  // às vezes caem na mesma linha e um voto apaga o outro (aconteceu no
  // teste com 100 pessoas no mesmo segundo).
  votos.getRange(reserva.linha, 1, 1, 5).setValues([[agora, hash, idInscricao, rotulo(rei), rotulo(rainha)]])
  return { ok: true }
}

// Reserva vale 2 min: tempo de sobra para a gravação na planilha. Depois
// disso quem manda é a planilha (se a organização apagar um voto à mão, a
// pessoa pode votar de novo).
const RESERVA_MS = 2 * 60 * 1000

function reservar(hash, id, voto, votos) {
  const props = PropertiesService.getScriptProperties()
  const agora = Date.now()
  const ler = (chave) => {
    try {
      const r = JSON.parse(props.getProperty(chave))
      return r && agora - r.em < RESERVA_MS ? r : null
    } catch (err) {
      return null
    }
  }
  const doCpf = ler('voto:' + hash)
  if (doCpf) {
    // Mesmo envio repetido enquanto o primeiro ainda grava: confirma.
    if (doCpf.id === id && doCpf.voto === voto) return { ok: true, jaGravando: true }
    return { ok: false, erro: 'Este CPF já votou. Cada pessoa vota uma vez só.' }
  }
  const doId = ler('id:' + id)
  if (doId && doId.hash !== hash) return { ok: false, erro: 'Este ID já foi usado por outro CPF.' }
  // Próxima linha livre da aba Votos: a contada aqui ou a última da
  // planilha, o que for maior (alguém pode ter colado linhas à mão).
  const linha = Math.max(Number(props.getProperty('linhaVotos')) || 0, votos.getLastRow()) + 1
  props.setProperties({
    ['voto:' + hash]: JSON.stringify({ id, voto, em: agora }),
    ['id:' + id]: JSON.stringify({ hash, em: agora }),
    linhaVotos: String(linha),
  })
  limparReservasVelhas(props, agora)
  return { ok: true, linha }
}

// De vez em quando tira as reservas vencidas, para não acumular.
function limparReservasVelhas(props, agora) {
  if (Math.random() > 0.05) return
  const todas = props.getProperties()
  Object.keys(todas).forEach((k) => {
    if (k.indexOf('voto:') !== 0 && k.indexOf('id:') !== 0) return
    try {
      if (agora - JSON.parse(todas[k]).em > RESERVA_MS) props.deleteProperty(k)
    } catch (err) {
      props.deleteProperty(k)
    }
  })
}

// ------------------------------------------------------------------ apoio

function candidatosAprovados() {
  return linhasComo(aba_('Candidatos'))
    .filter((l) => sim(l.aprovado))
    .map((l) => ({
      id: String(l.id),
      nome: String(l.nome),
      sobrenome: String(l.sobrenome),
      estado: String(l.estado),
      categoria: String(l.categoria).toLowerCase(),
      foto: String(l.foto_url),
    }))
}

function lerConfig() {
  const config = {}
  aba_('Config').getDataRange().getValues().slice(1).forEach((l) => {
    if (l[0]) config[String(l[0]).trim()] = l[1]
  })
  return config
}

function inscricoesAbertas(config) {
  if (!sim(config.inscricoes_abertas)) return false
  const ate = dataLimite(config.inscricoes_ate)
  return !ate || new Date() <= ate
}

// Aceita a célula como data do Sheets ou como texto dd/mm/aaaa.
// Vale até o fim do dia informado.
function dataLimite(valor) {
  if (!valor) return null
  let d = valor instanceof Date ? new Date(valor) : null
  if (!d) {
    const m = String(valor).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (!m) return null
    d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  }
  d.setHours(23, 59, 59, 999)
  return d
}

function linhasComo(aba) {
  const valores = aba.getDataRange().getValues()
  const cab = valores.shift().map((c) => String(c).trim())
  return valores.map((l) => Object.fromEntries(cab.map((c, i) => [c, l[i]])))
}

function aba_(nome) {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nome)
  if (!aba) throw new Error(`Aba "${nome}" não existe. Rode configurar().`)
  return aba
}

function hashCpf(cpf) {
  const sal = PropertiesService.getScriptProperties().getProperty('SAL') || ''
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, sal + cpf)
    .map((b) => ((b + 256) % 256).toString(16).padStart(2, '0'))
    .join('')
}

function cpfValido(cpf) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false
  const dv = (n) => {
    let soma = 0
    for (let i = 0; i < n; i++) soma += Number(cpf[i]) * (n + 1 - i)
    const r = (soma * 10) % 11
    return r === 10 ? 0 : r
  }
  return dv(9) === Number(cpf[9]) && dv(10) === Number(cpf[10])
}

const soDigitos = (v) => String(v == null ? '' : v).replace(/\D/g, '')
// CPF colado ou salvo como número perde o zero da frente; aqui ele volta.
const cpfDaCelula = (v) => soDigitos(v).padStart(11, '0')
const sim = (v) => String(v || '').trim().toUpperCase() === 'SIM'
const texto = (v, max) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, max)

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
