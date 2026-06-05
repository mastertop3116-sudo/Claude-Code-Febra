# Pipeline Instagram Automático — Jiu-Jitsu

> Sistema completo de posts automáticos para o Instagram do produto Dinâmicas de Jiu-Jitsu.

---

## O que faz

Publica posts automaticamente no Instagram todos os dias:

| Horário | Tipo | Descrição |
|---------|------|-----------|
| 09:00 | Carrossel (manhã) | Slides educativos gerados pelo Puppeteer |
| 19:00 | Post único (noite) | Imagem 3D cartoon com texto gerado pela IA |

---

## Arquitetura dos arquivos

Todos os arquivos ficam em:
`departments/creative/templates/aulas-desplugadas-ei/instagram-pipeline/`

| Arquivo | Função |
|---------|--------|
| `pipeline.js` | Orquestrador principal — chama tudo na ordem certa |
| `gerar-conteudo-ia.js` | Gera o texto do post via GPT-4o Mini |
| `gerar-post.js` | Renderiza a imagem 1080×1080 via Puppeteer |
| `gerar-bg-ia.js` | Pega o fundo 3D do cache e baixa do Cloudinary |
| `gerar-fundos-cache.js` | Pré-gera os 15 fundos 3D e salva no Cloudinary |
| `insights.js` | Coleta métricas dos posts e salva no Supabase |
| `instagram.js` | Publica na Graph API do Instagram |
| `upload.js` | Faz upload da imagem para o Cloudinary |
| `config.js` | Configurações (hashtags, conta, dryRun) |
| `fonts.js` | Gerencia fontes dos templates |
| `fundos-cache.json` | URLs dos 15 fundos gerados (gerado automaticamente) |

---

## Fundos 3D Cartoon

- **15 imagens** pré-geradas via GPT Image 1 (gpt-image-1)
- **5 por tipo**: motivacional / dica / engajamento
- Salvas no Cloudinary na pasta `jiujitsu-fundos`
- URLs salvas em `fundos-cache.json`
- O pipeline escolhe aleatoriamente uma imagem do tipo certo para o dia

### Como regenerar os fundos

Se quiser criar novos fundos (ex: após meses de uso ou para renovar):
1. Abra o Dashboard → Jiu-Jitsu
2. Clique em **🖼️ Regenerar Fundos 3D**
3. Aguarda ~10 minutos (roda em segundo plano no servidor)

---

## Métricas e Inteligência

O sistema coleta métricas dos posts via Instagram Graph API:
- Curtidas, comentários, alcance, salvamentos, impressões
- Calcula um **score de engajamento**: `(likes×1 + comments×2 + saves×3) / reach × 100`
- Salva tudo na tabela `ig_post_insights` no Supabase
- A IA usa os **top 5 posts** de melhor desempenho para gerar conteúdo mais parecido com o que funciona

### Tabela Supabase: `ig_post_insights`

```sql
post_id TEXT PRIMARY KEY
media_type TEXT
timestamp TIMESTAMPTZ
like_count INT
comments INT
reach INT
saved INT
impressions INT
follows INT
engagement_score NUMERIC(8,4)
tema TEXT
updated_at TIMESTAMPTZ
```

---

## Dashboard

O dashboard em `/dashboard` tem dois lugares com controles do Instagram:

### Tela Jiu-Jitsu (controle manual)
- 🌙 Postar Agora (Noite)
- ☀️ Postar Agora (Manhã)
- 📊 Coletar Métricas
- 🖼️ Regenerar Fundos 3D

### Tela Overview (página principal)
- Card "Instagram · Jiu-Jitsu" com total de posts, curtidas, alcance, engajamento médio e melhor post

---

## Endpoints do servidor

| Método | Endpoint | Função |
|--------|----------|--------|
| GET | `/instagram-test/noite` | Força post noturno agora |
| GET | `/instagram-test/manha` | Força carrossel agora |
| GET | `/instagram-insights` | Coleta e salva métricas |
| GET | `/instagram-metricas` | Retorna resumo para o dashboard |
| GET | `/instagram-gerar-fundos` | Regenera os 15 fundos 3D |

Todos exigem `?secret=83fd013af3383e7891bb95f4359a8a91`

---

## Variáveis de ambiente necessárias

```
OPENAI_API_KEY          — para gerar texto e fundos 3D
CLOUDINARY_CLOUD_NAME   — dpzqkzyj9
CLOUDINARY_API_KEY      — 416524232429621
CLOUDINARY_API_SECRET   — (privado)
INSTAGRAM_PAGE_ID       — ID da conta Instagram
INSTAGRAM_ACCESS_TOKEN  — token da Graph API
INSTAGRAM_APP_SECRET    — senha dos endpoints (83fd013af3383e7891bb95f4359a8a91)
SUPABASE_URL            — URL do projeto Supabase
SUPABASE_KEY            — chave do Supabase
```

---

## Problemas resolvidos

| Problema | Solução aplicada |
|----------|-----------------|
| Emojis apareciam como caixas | Adicionado Google Fonts Noto Color Emoji no HTML |
| Puppeteer travava (timeout 30s) | Mudado para `domcontentloaded` + 3s de espera |
| Geração da imagem demorava 6+ min | Sistema de cache com 15 fundos pré-gerados |
| Pipeline crashava sem Supabase | Carregamento lazy do módulo insights |
| Imagem 3D não aparecia no post | Fundo salvo em arquivo temporário e carregado via file:// |

---

## Histórico de funcionamento

- **2026-05-25**: Sistema completo instalado e funcionando
- 14 de 15 fundos gerados com sucesso (1 falhou por queda de conexão)
- Posts automáticos agendados: 09:00 e 19:00 (America/Sao_Paulo)
- Dashboard com controle visual sem precisar de URLs

---

## Atualização 2026-06-02 — 3 estilos + conteúdo variado + robô de comentário

Pedido do Rodrigo: os posts estavam sempre iguais (sempre Dark, sempre "5 dicas para...").

**1. Três estilos visuais revezando por dia** (`ESTILOS_POR_DIA` em `gerar-conteudo-ia.js`):
- **Dark** — preto #0a0a0f + laranja #f97316 (único que usa o fundo 3D cartoon).
- **Premium** — preto liso elegante, detalhes finos de laranja (`templates/premium/`).
- **Color** — **laranja quente da marca + card branco** (NÃO é mais azul/verde; reescrito pra respeitar a regra "nunca azul"). `templates/color/`.
- Criadas as peças de carrossel que faltavam: `templates/premium/slide.js` e `templates/color/slide.js` (antes só o Dark tinha `slide.js`).
- O fundo 3D só entra no Dark (`gerar-post.js`: `if (bgBase64 && estilo === 'dark')`).

**2. Conteúdo de verdade e variado** (`gerar-conteudo-ia.js`):
- Carrossel da manhã gira por **8 ângulos** (`ANGULOS_CARROSSEL`, por dia-do-ano): curiosidades, erros comuns, passo a passo, soluções de problemas, sugestões de brincadeiras, pedagogia, mito x verdade, benefícios.
- Carrossel mais cheio: **5–6 cards de conteúdo** (antes 3), texto específico (28–42 palavras) com exemplo do tatame. Numeração dos slides recalculada no código (robusto).
- Noite com foco rotativo (`FOCOS_DICA/MOTIV/ENGAJ`) e **post de produto 1x/semana** (`TIPOS_NOITE` inclui 'produto').

**3. Robô de comentário** (`responder-comentarios.js`):
- Responde comentários sozinho. Quem pergunta preço/link → resposta com CTA pro link da bio (Básico R$10 / Premium R$27). Demais → resposta simpática via GPT-4o Mini.
- Travas: não responde a si mesmo, não responde 2x (checa se já tem reply nosso), máx 20/rodada, só últimos 7 dias. Tem modo teste (`dryRun`) que mostra sem postar.
- Atalho: `/instagram-responder-comentarios?secret=...`. Cron a cada 30 min no `instagram-scheduler.js`.
- **DESLIGADO por padrão.** Liga com a variável de ambiente `IG_COMENTARIOS_AUTO=true` no Render (ou trocando o default no `instagram-scheduler.js`). Rodrigo pediu pra deixar pronto mas desligado em 2026-06-02.

**Status:** commitado e enviado pro GitHub (commit 344c2f8). Render reconstrói sozinho. Testado local em dry run (manhã = carrossel; noite = post único) com a IA real — OK, sem vazar texto.

**Ferramenta de prévia:** `preview-estilos.js` renderiza os 3 estilos sem postar nem chamar a IA.

---

*Arquivo criado em 2026-05-26. Atualizar quando houver mudança na estrutura ou nos arquivos.*
