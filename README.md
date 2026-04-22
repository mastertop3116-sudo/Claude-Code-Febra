# Nexus Digital Holding 🏛️

> Ecossistema de IA Autônomo para escala bilionária em infoprodutos Low Ticket.

## Arquitetura

```
MAX (Central Brain)
├── Conselho de Titãs (Elon · Bezos · Hang · Paulo Vieira)
├── Growth          → Funis, Copy, Tráfego
├── Criativos       → Design, VSLs, Branding
├── Tecnologia      → Código, APIs, LPs
├── Financeiro      → NF, Tributário, Split
└── Pesquisa        → Dados, PDFs, YouTube
```

## Stack

| Camada | Tecnologia |
|---|---|
| IA Trabalho Bruto | Google Gemini Flash |
| IA Revisão Crítica | Claude (Anthropic) |
| Interface | Telegram Bot |
| Banco de Dados | Supabase |
| Deploy | Vercel / Railway |
| Design | Canva API |

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Preencha o .env com suas chaves

# 3. Iniciar o sistema
npm start
```

## Motores de IA

- **Gemini Flash** → trabalho bruto (geração em massa, rascunhos, pesquisa)
- **Gemini Pro** → Conselho de Titãs e análises estratégicas
- **Claude** → revisão final do MAX e decisões críticas

## Comandos Telegram

| Comando | Ação |
|---|---|
| `/start` | Iniciar MAX |
| `/paulo` | Acionar Paulo Vieira (análise DISC) |
| `/conselho [decisão]` | Convocar o Conselho de Titãs |
| `/report` | Gerar Stark Report |
| `/status` | Status dos departamentos |
