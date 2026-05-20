# Briefing de Integração — NexusPDF × Dashboard Carlinhos

> **Para:** Claude Code do Carlinhos  
> **De:** Claude Code do Rodrigo (Nexus MAX)  
> **Data:** 2026-05-20  
> **Repositório de referência:** `mastertop3116-sudo/Claude-Code-Febra`

---

## O que é o NexusPDF

O **NexusPDF** é um motor de geração de PDFs personalizados, hospedado como API HTTP. Ele recebe um `templateId` + variáveis, renderiza um HTML via Puppeteer e devolve o arquivo PDF binário pronto para download ou exibição no browser.

O servidor roda em Node.js com Express. O código-fonte completo está em `mastertop3116-sudo/Claude-Code-Febra`.

---

## O que o Carlinhos precisa fazer no dashboard

### 1. Chamar a API para gerar PDFs

**Endpoint:**
```
POST https://SEU_DOMINIO.up.railway.app/api/nexuspdf/gerar
```

**Headers obrigatórios:**
```
Content-Type: application/json
x-api-key: VALOR_DO_NEXUS_API_KEY
```

**Body:**
```json
{
  "templateId": "kit-worksheet",
  "vars": {
    "escola": "Escola Municipal João da Silva",
    "professor": "Prof. Ana Souza",
    "ano": "1º Ano A"
  }
}
```

**Resposta:** arquivo PDF binário (`application/pdf`)

---

### 2. Listar templates disponíveis (opcional)

```
GET https://SEU_DOMINIO.up.railway.app/api/nexuspdf/templates
x-api-key: VALOR_DO_NEXUS_API_KEY
```

Retorna JSON com todos os templates, suas variáveis e metadados.

---

### 3. Templates disponíveis hoje

| ID | Nome | Variáveis |
|---|---|---|
| `kit-worksheet` | Kit Worksheet — Alfabetização | `escola`, `professor`, `ano` |
| `cert-corp` | Certificado Corporativo | `nome`, `curso`, `data`, `empresa` |
| `ficha-treino` | Ficha de Treino Fitness | `nome`, `objetivo`, `semana` |
| `planner-nutri` | Planner Nutricional Semanal | `nome`, `objetivo`, `semana` |
| `ficha-sessao-psi` | Ficha de Sessão Psicológica | `paciente`, `terapeuta`, `data` |
| `ficha-receita` | Ficha Técnica de Receita | `receita`, `chef`, `porcoes` |

---

### 4. Exemplo de implementação (Next.js API Route)

```js
// pages/api/gerar-pdf.js
export default async function handler(req, res) {
  const pdfRes = await fetch(`${process.env.NEXUSPDF_BASE_URL}/api/nexuspdf/gerar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXUS_API_KEY,
    },
    body: JSON.stringify(req.body),
  });

  if (!pdfRes.ok) {
    const err = await pdfRes.json();
    return res.status(pdfRes.status).json(err);
  }

  const buffer = await pdfRes.arrayBuffer();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", pdfRes.headers.get("content-disposition") || "attachment");
  res.send(Buffer.from(buffer));
}
```

**Variáveis de ambiente necessárias no projeto do Carlinhos:**
```
NEXUSPDF_BASE_URL=https://SEU_DOMINIO.up.railway.app
NEXUS_API_KEY=chave_que_o_rodrigo_vai_passar
```

> A URL e a chave serão passadas pelo Rodrigo assim que o servidor estiver no ar.

---

## Protocolo de comunicação entre os dois sistemas

### Se o Carlinhos precisar de mudança na API

Abra uma **Issue** no repositório `mastertop3116-sudo/Claude-Code-Febra` usando o template **"API Change Request"**. O Claude do Rodrigo será notificado e implementará a mudança.

URL do repositório: `https://github.com/mastertop3116-sudo/Claude-Code-Febra/issues/new/choose`

### Quando a API for atualizada

Um **GitHub Action** dispara automaticamente um webhook para o endpoint do Carlinhos sempre que `server.js`, `NEXUSPDF-API.md` ou qualquer template for alterado. O payload recebido será:

```json
{
  "event": "nexuspdf_api_updated",
  "repo": "mastertop3116-sudo/Claude-Code-Febra",
  "commit": "abc123...",
  "message": "descrição do que mudou",
  "changed_files": "server.js, NEXUSPDF-API.md",
  "api_docs": "https://raw.githubusercontent.com/mastertop3116-sudo/Claude-Code-Febra/main/NEXUSPDF-API.md"
}
```

**O que o Carlinhos precisa fazer para ativar isso:**
1. Criar um endpoint no projeto dele para receber o webhook (ex: `POST /api/nexuspdf-webhook`)
2. Passar a URL completa desse endpoint para o Rodrigo
3. O Rodrigo adiciona como secret `CARLINHOS_WEBHOOK_URL` no GitHub

---

## Documentação completa da API

O arquivo `NEXUSPDF-API.md` na raiz do repositório é a fonte da verdade. Sempre que houver dúvida, consulte:

```
https://raw.githubusercontent.com/mastertop3116-sudo/Claude-Code-Febra/main/NEXUSPDF-API.md
```

---

## Erros comuns

| Código | Motivo |
|---|---|
| `401` | Chave de API inválida ou ausente |
| `400` | `templateId` não informado |
| `404` | Template não encontrado |
| `500` | Erro interno no servidor (Puppeteer / template) |

---

## Checklist para colocar a integração no ar

- [ ] Rodrigo sobe o servidor (Railway ou VPS) e passa a URL + chave para o Carlinhos
- [ ] Carlinhos adiciona `NEXUSPDF_BASE_URL` e `NEXUS_API_KEY` nas variáveis de ambiente do projeto
- [ ] Carlinhos implementa a chamada à API no dashboard
- [ ] Carlinhos cria o endpoint de webhook e passa a URL para o Rodrigo
- [ ] Rodrigo adiciona `CARLINHOS_WEBHOOK_URL` como secret no GitHub
- [ ] Testar geração de um PDF de ponta a ponta

---

*Qualquer dúvida técnica sobre o servidor NexusPDF: abrir Issue no repositório.*
