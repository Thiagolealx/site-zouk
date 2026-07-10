export default function Footer() {
  return (
    <footer className="bg-night-deep px-6 py-10 text-center">
      <img
        src="/assets/logo-joya.png"
        alt="Joya"
        className="w-16 mx-auto mb-4 opacity-80"
      />
      <p className="text-sand/50 text-sm">
        Zouk Jampa 2026 · 26 a 29 de novembro · João Pessoa — PB
      </p>
      <p className="text-sand/30 text-xs mt-2">
        © {new Date().getFullYear()} Zouk Jampa. Todos os direitos reservados.
      </p>
    </footer>
  )
}
