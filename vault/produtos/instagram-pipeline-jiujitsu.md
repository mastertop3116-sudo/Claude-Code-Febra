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

*Arquivo criado em 2026-05-26. Atualizar quando houver mudança na estrutura ou nos arquivos.*
