# Zouk Jampa 2026 — Landing Page

Landing page do evento Zouk Jampa 2026 (26 a 29 de novembro, João Pessoa - PB).
React + Vite + TailwindCSS, com formulário de inscrição do Tally embutido
(mantém a sincronização já existente com o sistema) e botões de pagamento
via cartão (SumUp).

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Estrutura

- `src/components/Hero.jsx` — abertura com pôster dos artistas e CTA
- `src/components/Highlights.jsx` — destaques do evento
- `src/components/Lotes.jsx` — cards de ingresso com links do SumUp
- `src/components/Pagamento.jsx` — link de pagamento SumUp + WhatsApp
- `src/components/Inscricao.jsx` — formulário Tally embutido
- `src/components/Comunidade.jsx` — grupo do WhatsApp + Instagram

## Editar conteúdo

- **Lotes/preços/links do SumUp**: `src/components/Lotes.jsx`, array `lotes`
- **Link de pagamento / WhatsApp de contato**: `src/components/Pagamento.jsx`, topo do arquivo
- **Destaques do evento**: `src/components/Highlights.jsx`, array `highlights`
- **Link do grupo do WhatsApp**: `src/components/Comunidade.jsx`

## Deploy (GitHub + Vercel)

1. Crie um repositório novo no GitHub e suba este projeto:
   ```bash
   git init
   git add .
   git commit -m "Landing page Zouk Jampa 2026"
   git branch -M main
   git remote add origin <URL_DO_SEU_REPO>
   git push -u origin main
   ```
2. No [vercel.com](https://vercel.com), clique em **Add New → Project**.
3. Selecione o repositório recém-criado.
4. O Vercel detecta automaticamente que é um projeto Vite (Framework Preset:
   *Vite*, Build Command: `npm run build`, Output Directory: `dist`). Não
   precisa mudar nada — só clicar em **Deploy**.
5. Pronto: a partir daí, todo `git push` na branch `main` gera um novo deploy
   automático.
