import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SPA de entrada única: o router de src/router.jsx resolve /ingressos,
// /inscricao e /camisas no cliente. Em produção o rewrite do vercel.json
// devolve o index.html para qualquer rota; no dev o fallback é do Vite.
export default defineConfig({
  plugins: [react()],
  appType: 'spa',
})
