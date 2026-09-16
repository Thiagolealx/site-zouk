// Catálogo de camisas. Para adicionar um modelo, inclua um objeto em `modelos`.
// Toda peça sai nas modelagens Oversized e Cropped (ver `precos`).

export const modelos = [
  {
    id: 'modelo-01',
    nome: 'Jampa Azul Marinho',
    descricao:
      'Estampa exclusiva do Cabo Branco nas costas e assinatura Jampa no peito.',
    cor: 'Azul marinho',
    capa: '/assets/camisas/modelo-01-casal.jpeg',
    imagens: [
      { src: '/assets/camisas/modelo-01-frente.jpeg', legenda: 'Oversized — frente', alt: 'Camisa Jampa azul marinho oversized — frente' },
      { src: '/assets/camisas/modelo-01-costas.jpeg', legenda: 'Oversized — costas', alt: 'Camisa Jampa azul marinho oversized — costas' },
      { src: '/assets/camisas/modelo-01-casal.jpeg', legenda: 'Oversized — no corpo', alt: 'Camisa Jampa azul marinho oversized vestida, frente e costas' },
      { src: '/assets/camisas/modelo-01-cropped.jpeg', legenda: 'Cropped — frente e costas', alt: 'Camisa Jampa azul marinho cropped — frente e costas' },
    ],
  },
  {
    id: 'modelo-02',
    nome: 'Zouk Inca',
    descricao:
      'Logo Zouk no peito e a paisagem do Cabo Branco nas costas.',
    cor: 'Inca',
    capa: '/assets/camisas/modelo-02-casal.jpeg',
    imagens: [
      { src: '/assets/camisas/modelo-02-frente.jpeg', legenda: 'Oversized — frente', alt: 'Camisa Zouk inca oversized — frente' },
      { src: '/assets/camisas/modelo-02-costas.jpeg', legenda: 'Oversized — costas', alt: 'Camisa Zouk inca oversized — costas' },
      { src: '/assets/camisas/modelo-02-casal.jpeg', legenda: 'Oversized — no corpo', alt: 'Camisa Zouk inca oversized vestida, frente e costas' },
      { src: '/assets/camisas/modelo-02-cropped.jpeg', legenda: 'Cropped — frente e costas', alt: 'Camisa Zouk inca cropped — frente e costas' },
    ],
  },
  {
    id: 'modelo-03',
    nome: 'Jampa Preta',
    descricao:
      'Estampa exclusiva do Cabo Branco nas costas e assinatura Jampa no peito.',
    cor: 'Preta',
    capa: '/assets/camisas/modelo-03-casal.jpeg',
    imagens: [
      { src: '/assets/camisas/modelo-03-frente.jpeg', legenda: 'Oversized — frente', alt: 'Camisa Jampa preta oversized — frente' },
      { src: '/assets/camisas/modelo-03-costas.jpeg', legenda: 'Oversized — costas', alt: 'Camisa Jampa preta oversized — costas' },
      { src: '/assets/camisas/modelo-03-casal.jpeg', legenda: 'Oversized — no corpo', alt: 'Camisa Jampa preta oversized vestida, frente e costas' },
      { src: '/assets/camisas/modelo-03-cropped.jpeg', legenda: 'Cropped — frente e costas', alt: 'Camisa Jampa preta cropped — frente e costas' },
    ],
  },
]

// Medidas da camiseta oversized masculina, em centímetros.
export const medidas = {
  titulo: 'Camiseta oversized masculina',
  colunas: ['Comprimento', 'Largura peito', 'Ombro a ombro', 'Manga'],
  linhas: [
    { tamanho: 'P',  valores: ['76,5 cm', '60 cm', '53 cm', '22 cm'] },
    { tamanho: 'M',  valores: ['78,5 cm', '62 cm', '54 cm', '23 cm'] },
    { tamanho: 'G',  valores: ['80,5 cm', '64 cm', '55 cm', '24,5 cm'] },
    { tamanho: 'GG', valores: ['82,5 cm', '66 cm', '56 cm', '26 cm'] },
  ],
  observacao: 'As medidas podem variar de 1 a 3 cm entre confecções.',
}

// Fotos extras que aparecem só na vitrine da home, junto dos modelos.
export const vitrineExtras = [
  {
    id: 'looks',
    src: '/assets/camisas/vitrine-looks.jpeg',
    titulo: 'Cropped no corpo',
    legenda: 'Inca, preta e azul marinho',
    alt: 'Modelos vestindo as camisas cropped Zouk Jampa nas cores inca, preta e azul marinho',
    // Recalibrado para a foto nova: mais alto cortava a cabeça das modelos,
    // mais baixo perdia a estampa das costas da camisa azul.
    pos: 'center 20%',
  },
]

// TODO: trocar pelos links reais criados no SumUp para cada modelagem.
export const precos = [
  {
    tipo: 'Oversized',
    valor: 'R$ 120,00',
    link: '',
  },
  {
    tipo: 'Cropped',
    valor: 'R$ 90,00',
    link: '',
  },
]

export const TECIDO = 'Suedine'
export const PIX_KEY = 'zouk.jampa.pb@gmail.com'
export const WHATSAPP = '5583998699329'
export const WHATSAPP_DISPLAY = '(83) 99869-9329'
export const TALLY_ID = 'D4OM5E'
