// Catálogo de camisas. Para adicionar um modelo, inclua um objeto em `modelos`.
// Toda peça sai nas modelagens Oversized e Cropped (ver `precos`).
//
// `fora: true` marca a cor que saiu de produção. Ela continua no catálogo em
// vez de ser apagada: muita gente viu essa cor no Instagram e vem procurar, e
// um card dizendo "fora de produção" responde melhor que o silêncio. Quem
// renderiza é que separa — ver `emLinha` e `foraDeLinha` no fim do arquivo.
//
// `capa` e `capaCropped` são as duas fotos que a vitrine da home usa, uma por
// modelagem. São campos próprios, e não a primeira foto de `imagens`, para a
// vitrine não mudar sozinha quando alguém reordena a galeria da /camisas.

export const modelos = [
  {
    id: 'modelo-01',
    nome: 'Jampa Azul Marinho',
    descricao:
      'Estampa exclusiva do Cabo Branco nas costas e assinatura Jampa no peito.',
    cor: 'Azul marinho',
    capa: '/assets/camisas/modelo-01-casal.jpeg',
    capaCropped: '/assets/camisas/modelo-01-cropped.jpeg',
    imagens: [
      { src: '/assets/camisas/modelo-01-frente.jpeg', legenda: 'Oversized — frente', alt: 'Camisa Jampa azul marinho oversized — frente' },
      { src: '/assets/camisas/modelo-01-costas.jpeg', legenda: 'Oversized — costas', alt: 'Camisa Jampa azul marinho oversized — costas' },
      { src: '/assets/camisas/modelo-01-casal.jpeg', legenda: 'Oversized — no corpo', alt: 'Camisa Jampa azul marinho oversized vestida, frente e costas' },
      { src: '/assets/camisas/modelo-01-cropped.jpeg', legenda: 'Cropped — frente e costas', alt: 'Camisa Jampa azul marinho cropped — frente e costas' },
    ],
  },
  {
    id: 'modelo-04',
    nome: 'Zouk New Wood',
    descricao:
      'A cor nova da linha: marrom lavado, logo Zouk no peito e a paisagem do Cabo Branco nas costas.',
    cor: 'New Wood (marrom)',
    capa: '/assets/camisas/modelo-04-casal.jpeg',
    capaCropped: '/assets/camisas/modelo-04-cropped.jpeg',
    imagens: [
      { src: '/assets/camisas/modelo-04-frente.jpeg', legenda: 'Oversized — frente', alt: 'Camisa Zouk New Wood marrom oversized — frente' },
      { src: '/assets/camisas/modelo-04-costas.jpeg', legenda: 'Oversized — costas', alt: 'Camisa Zouk New Wood marrom oversized — costas' },
      { src: '/assets/camisas/modelo-04-casal.jpeg', legenda: 'Oversized — no corpo', alt: 'Camisa Zouk New Wood marrom oversized vestida, frente e costas' },
      { src: '/assets/camisas/modelo-04-cropped.jpeg', legenda: 'Cropped — frente e costas', alt: 'Camisa Zouk New Wood marrom cropped — frente e costas' },
    ],
  },
  {
    id: 'modelo-03',
    nome: 'Jampa Preta',
    descricao:
      'Estampa exclusiva do Cabo Branco nas costas e assinatura Jampa no peito.',
    cor: 'Preta',
    capa: '/assets/camisas/modelo-03-casal.jpeg',
    capaCropped: '/assets/camisas/modelo-03-cropped.jpeg',
    imagens: [
      { src: '/assets/camisas/modelo-03-frente.jpeg', legenda: 'Oversized — frente', alt: 'Camisa Jampa preta oversized — frente' },
      { src: '/assets/camisas/modelo-03-costas.jpeg', legenda: 'Oversized — costas', alt: 'Camisa Jampa preta oversized — costas' },
      { src: '/assets/camisas/modelo-03-casal.jpeg', legenda: 'Oversized — no corpo', alt: 'Camisa Jampa preta oversized vestida, frente e costas' },
      { src: '/assets/camisas/modelo-03-cropped.jpeg', legenda: 'Cropped — frente e costas', alt: 'Camisa Jampa preta cropped — frente e costas' },
    ],
  },
  {
    id: 'modelo-02',
    nome: 'Zouk Inca',
    descricao:
      'Logo Zouk no peito e a paisagem do Cabo Branco nas costas.',
    cor: 'Inca',
    fora: true,
    aviso: 'O tecido inca acabou no fornecedor e a cor saiu de produção. Em vez dela entrou a New Wood.',
    capa: '/assets/camisas/modelo-02-casal.jpeg',
    capaCropped: '/assets/camisas/modelo-02-cropped.jpeg',
    imagens: [
      { src: '/assets/camisas/modelo-02-frente.jpeg', legenda: 'Oversized — frente', alt: 'Camisa Zouk inca oversized — frente' },
      { src: '/assets/camisas/modelo-02-costas.jpeg', legenda: 'Oversized — costas', alt: 'Camisa Zouk inca oversized — costas' },
      { src: '/assets/camisas/modelo-02-casal.jpeg', legenda: 'Oversized — no corpo', alt: 'Camisa Zouk inca oversized vestida, frente e costas' },
      { src: '/assets/camisas/modelo-02-cropped.jpeg', legenda: 'Cropped — frente e costas', alt: 'Camisa Zouk inca cropped — frente e costas' },
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

// Quem está à venda vem primeiro; o que saiu de produção fica no rodapé da
// página de camisas e nem aparece na vitrine da home.
export const emLinha = modelos.filter((modelo) => !modelo.fora)
export const foraDeLinha = modelos.filter((modelo) => modelo.fora)

export const TECIDO = 'Suedine'
export const PIX_KEY = 'zouk.jampa.pb@gmail.com'
export const WHATSAPP = '5583998699329'
export const WHATSAPP_DISPLAY = '(83) 99869-9329'
export const TALLY_ID = 'D4OM5E'
