# Rei e Rainha do Baile — backend na planilha

O site (`/rei-e-rainha` e `/votacao`) conversa com o script `Codigo.gs`, que
roda dentro da planilha **Rei e Rainha - Planilha Principal** (conta
thiago.lealx). Não compartilhe a planilha como editor: quem edita a
planilha consegue trocar o script.

## Instalar (uma vez)

1. Logado na conta do evento, crie uma planilha em branco (sheets.new) →
   **Extensões → Apps Script**.
2. Apague o conteúdo do `Código.gs` e cole o `Codigo.gs` deste repositório. Salve.
3. Escolha a função `configurar` no topo e clique **▶ Executar**. Autorize
   (Avançado → Acessar projeto). Ela monta as abas, cria a pasta
   **Rei e Rainha do Baile - Zouk Jampa 2026** com **Fotos dos Candidatos**
   dentro e move a planilha para lá.
4. **Implantar → Nova implantação → tipo: App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Copie o link que termina em `/exec` e cole em `API_URL`, em
   `src/data/reiRainha.js`.

Mudou o script depois? **Implantar → Gerenciar implantações → editar (lápis) →
Versão: Nova versão**. Assim o link continua o mesmo.

## Usar no dia a dia

- **Config**: `inscricoes_abertas` e `votacao_aberta` (SIM/NAO);
  `inscricoes_ate` (dd/mm/aaaa, vazio = sem prazo);
  `mostrar_no_menu` (SIM/NAO): se a aba "Rei & Rainha" aparece no menu do
  site. Com `NAO` (ou sem essa linha) ela some do menu, mas as páginas
  continuam abrindo pelo link direto (`/rei-e-rainha` e `/votacao`), para
  você mandar só para quem quiser. O menu do site pode levar até 5 minutos
  para refletir a mudança em quem já tinha aberto o site.
- **Candidatos**: quem se inscreve já entra com `SIM` e aparece na votação.
  Para tirar alguém da cédula, troque para `NAO`.
- **Eleitores**: menu **Rei e Rainha → 🔑 Gerar IDs** cria os códigos
  (ZJ-XXXXXX) com o CPF em branco. Entregue um ID por pessoa; quando ela vota,
  o CPF e a hora (`votou_em`) entram na linha. Um ID vale para um CPF só. Dá
  também para colar CPF + ID vindos do sistema: aí só aquele CPF usa o ID.
- **Menu Rei e Rainha**: abrir/fechar votação e inscrições, mostrar/esconder
  a aba no menu do site, sem editar célula.
- **Resultado**: contagem automática. Não aparece no site. Com muita gente
  votando junto ela pode ficar alguns segundos atrás; ao **■ Fechar votação**
  o placar é recontado com todos os votos.
- **🧪 Teste de carga** (submenu): *Criar IDs de teste* põe IDs `TESTE-001`,
  `TESTE-002`… em Eleitores para simular o público votando
  (`npm run test:pico -- <site>`). *Apagar tudo do teste* tira esses IDs, os
  votos feitos com eles, e reconta. Os IDs e votos de verdade ficam intactos.
