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

// Fotos extras que aparecem só na vitrine da home, junto dos modelos.
export const vitrineExtras = [
  {
    id: 'looks',
    src: '/assets/camisas/vitrine-looks.jpeg',
    titulo: 'Cropped no corpo',
    legenda: 'Inca e azul marinho',
    alt: 'Modelos vestindo as camisas cropped Zouk Jampa nas cores inca e azul marinho',
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
