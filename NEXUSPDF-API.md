# NexusPDF — API de Integração

Motor de geração de PDFs personalizados. Chame a partir de qualquer stack.

---

## Autenticação

Todas as rotas exigem a chave de API no header:

```
x-api-key: SUA_CHAVE_AQUI
```

Ou via Bearer token:

```
Authorization: Bearer SUA_CHAVE_AQUI
```

> A chave é definida na variável de ambiente `NEXUS_API_KEY` do servidor.

---

## Base URL

```
https://SEU_DOMINIO_RAILWAY.up.railway.app
```

---

## Endpoints

### 1. Listar templates disponíveis

```
GET /api/nexuspdf/templates
```

**Resposta:**
```json
[
  {
    "id": "kit-worksheet",
    "nome": "Kit Worksheet — Atividades de Alfabetização",
    "nicho": "Educação / Alfabetização",
    "icon": "📝",
    "paginas": 20,
    "vars": [
      { "id": "escola", "label": "Nome da Escola" },
      { "id": "professor", "label": "Nome do Professor(a)" },
      { "id": "ano", "label": "Ano / Turma" }
    ]
  }
]
```

---

### 2. Gerar PDF

```
POST /api/nexuspdf/gerar
Content-Type: application/json
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

**Headers de resposta:**
- `Content-Disposition: attachment; filename="nexus-kit-worksheet-123456.pdf"`
- `X-Template-Name: Kit Worksheet — Atividades de Alfabetização`

---

## Exemplo — JavaScript / Fetch (client-side)

```js
const res = await fetch("https://SEU_DOMINIO.up.railway.app/api/nexuspdf/gerar", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "SUA_CHAVE_AQUI"
  },
  body: JSON.stringify({
    templateId: "kit-worksheet",
    vars: { escola: "Escola X", professor: "Prof. Ana", ano: "1º Ano" }
  })
});

const blob = await res.blob();
const url = URL.createObjectURL(blob);
window.open(url); // abre o PDF no browser
```

---

## Exemplo — Node.js / server-side (Next.js API Route)

```js
// pages/api/gerar-pdf.js
export default async function handler(req, res) {
  const pdfRes = await fetch("https://SEU_DOMINIO.up.railway.app/api/nexuspdf/gerar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXUS_API_KEY
    },
    body: JSON.stringify(req.body)
  });

  const buffer = await pdfRes.arrayBuffer();
  res.setHeader("Content-Type", "application/pdf");
  res.send(Buffer.from(buffer));
}
```

---

## Templates disponíveis

| ID | Nome | Vars |
|---|---|---|
| `kit-worksheet` | Kit Worksheet — Alfabetização | escola, professor, ano |
| `cert-corp` | Certificado Corporativo | nome, curso, data, empresa |
| `ficha-treino` | Ficha de Treino Fitness | nome, objetivo, semana |
| `planner-nutri` | Planner Nutricional Semanal | nome, objetivo, semana |
| `ficha-sessao-psi` | Ficha de Sessão Psicológica | paciente, terapeuta, data |
| `ficha-receita` | Ficha Técnica de Receita | receita, chef, porcoes |

---

## Erros comuns

| Código | Motivo |
|---|---|
| `401` | Chave de API inválida ou ausente |
| `400` | `templateId` não informado |
| `404` | Template não encontrado |
| `500` | Erro interno (Puppeteer / template) |
