export default function Footer() {
  return (
    <footer className="px-6 py-11 border-t border-rule text-center">
      <p className="font-display text-lg tracking-[0.08em] uppercase text-sand">
        Zouk Jampa 2026
      </p>
      <p className="mt-2 text-[14.5px] text-haze">
        26 a 29 de novembro · João Pessoa — PB
      </p>

      {/* Links que antes viviam na seção "Entre no clima" da home. */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
        <a
          href="https://chat.whatsapp.com/CvBc0OPPLE18nVarSyw0lk"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2.5 rounded-full text-sm font-semibold text-sand border border-line hover:border-coral hover:text-sand transition-colors"
        >
          Grupo do WhatsApp
        </a>
        <a
          href="https://instagram.com/zoukjampa"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2.5 rounded-full text-sm font-semibold text-sand border border-line hover:border-coral hover:text-sand transition-colors"
        >
          @zoukjampa
        </a>
      </div>

      <img
        src="/assets/logo-joya.png"
        alt="Joya"
        className="w-16 mx-auto mt-8 opacity-70"
      />
      <p className="mt-3 text-xs text-haze/70">
        © {new Date().getFullYear()} Zouk Jampa. Todos os direitos reservados.
      </p>
    </footer>
  )
}
