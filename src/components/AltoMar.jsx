import { useState } from 'react'

const roteiro = [
  { parada: 'Areia Vermelha', detalhe: 'Banco de areia que só aparece na maré baixa' },
  { parada: 'Ilha da Restinga', detalhe: 'Mangue e água calma' },
  { parada: 'Encontro do Rio Paraíba com o Atlântico', detalhe: 'Duas águas, duas cores' },
  { parada: 'Pôr do sol na Praia do Jacaré', detalhe: 'O fim de tarde mais famoso da Paraíba', emoji: '🌅' },
]

const bordo = [
  { icone: '🎧', texto: 'DJs a bordo' },
  { icone: '🌊', texto: 'Paradas para banho e contemplação' },
]

const fotos = [
  { src: '/assets/alto-mar/foto-01.jpg', alt: 'Grupo reunido no deck do catamarã em mar turquesa' },
  { src: '/assets/alto-mar/foto-02.jpg', alt: 'Participantes no catamarã durante o pôr do sol' },
  { src: '/assets/alto-mar/foto-03.jpg', alt: 'Cinco participantes posando no catamarã' },
  { src: '/assets/alto-mar/foto-04.jpg', alt: 'Quatro participantes no deck ao entardecer' },
  { src: '/assets/alto-mar/foto-05.jpg', alt: 'Grupo na parada da praia' },
  { src: '/assets/alto-mar/foto-06.jpg', alt: 'Casal no deck do catamarã' },
  { src: '/assets/alto-mar/foto-07.jpg', alt: 'Participantes no banco de areia da Areia Vermelha' },
]

// O vídeo tem ~14 MB, então só carrega quando a pessoa pede pra ver.
// Antes disso fica a foto de capa, que pesa 170 KB.
function Video() {
  const [tocando, setTocando] = useState(false)

  if (tocando) {
    return (
      <video
        src="/assets/alto-mar/baile-alto-mar.mp4"
        poster="/assets/alto-mar/capa-grupo.jpg"
        controls
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTocando(true)}
      className="group relative w-full h-full"
      aria-label="Assistir ao vídeo do baile em alto mar"
    >
      <img
        src="/assets/alto-mar/capa-grupo.jpg"
        alt="Todos os participantes reunidos no catamarã do Zouk Jampa"
        className="w-full h-full object-cover"
      />
      <span className="absolute inset-0 bg-night/35 group-hover:bg-night/20 transition-colors" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-center justify-center w-20 h-20 rounded-full bg-sunset-gradient text-night text-3xl pl-1 shadow-xl group-hover:scale-110 transition-transform">
          ▶
        </span>
      </span>
      <span className="absolute bottom-4 left-0 right-0 font-body text-sand text-sm tracking-wide">
        Assistir ao vídeo
      </span>
    </button>
  )
}

export default function AltoMar() {
  return (
    <section id="alto-mar" className="bg-night-light/40 px-6 py-20 md:py-28">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h2 className="font-display text-3xl md:text-5xl text-sand mb-4">
          BAILE EM ALTO MAR ⛵
        </h2>
        <p className="font-body text-sand/70 max-w-2xl mx-auto">
          Um domingo inteiro de Zouk, música e algumas das paisagens mais
          lindas do litoral paraibano.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="rounded-3xl overflow-hidden border border-sand/10 aspect-[4/3] bg-night">
          <Video />
        </div>

        <div>
          <div className="space-y-3 mb-10">
            {bordo.map((item) => (
              <div
                key={item.texto}
                className="flex items-center gap-4 bg-night/60 border border-sand/10 rounded-2xl px-5 py-4"
              >
                <span className="text-2xl">{item.icone}</span>
                <span className="font-body text-sand/90">{item.texto}</span>
              </div>
            ))}
          </div>

          <h3 className="font-display text-xl text-sand/40 tracking-widest mb-5">
            ROTEIRO
          </h3>
          <ol className="relative border-l border-sun-orange/30 pl-6 space-y-6">
            {roteiro.map((item) => (
              <li key={item.parada} className="relative">
                <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-sun-yellow" />
                <p className="font-body text-sand font-semibold">
                  {item.parada} {item.emoji}
                </p>
                <p className="font-body text-sand/50 text-sm">{item.detalhe}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* object-position mantém o sol e os barcos no enquadramento em telas largas,
          onde o recorte da foto (retrato) é mais agressivo. */}
      <div className="max-w-5xl mx-auto mt-14 mb-8 relative rounded-3xl overflow-hidden border border-sand/10 h-[300px] md:h-[420px]">
        <img
          src="/assets/alto-mar/por-do-sol.jpg"
          alt="Catamarã e jangada ao pôr do sol no encontro do rio com o mar"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 38%' }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-night/30" />
        <p className="absolute inset-x-0 bottom-8 px-6 font-script text-2xl md:text-4xl text-sand text-center drop-shadow-lg">
          uma experiência para viver João Pessoa por outro ângulo
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
        {fotos.map((foto) => (
          <div
            key={foto.src}
            className="aspect-square rounded-xl overflow-hidden border border-sand/10"
          >
            <img
              src={foto.src}
              alt={foto.alt}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto text-center mt-12">
        <a
          href="#lotes"
          className="inline-block bg-sunset-gradient text-night font-bold px-10 py-4 rounded-full shadow-lg shadow-sun-orange/30 hover:scale-105 transition-transform"
        >
          Quero o Full Pass com catamarã
        </a>
      </div>
    </section>
  )
}
