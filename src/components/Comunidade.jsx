export default function Comunidade() {
  return (
    <section className="bg-night px-6 py-20 md:py-28 text-center">
      <h2 className="font-display text-3xl md:text-5xl text-sand mb-4">
        ENTRE NO CLIMA
      </h2>
      <p className="font-body text-sand/70 mb-10 max-w-lg mx-auto">
        Entre no grupo oficial pra novidades em primeira mão e acompanhe os
        bastidores no Instagram.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href="https://chat.whatsapp.com/CvBc0OPPLE18nVarSyw0lk"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-sunset-gradient text-night font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform"
        >
          Entrar no grupo do WhatsApp
        </a>
        <a
          href="https://instagram.com/zoukjampa"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-sand/30 text-sand font-semibold px-8 py-3 rounded-full hover:border-coral/60 transition-colors"
        >
          @zoukjampa
        </a>
      </div>
    </section>
  )
}
