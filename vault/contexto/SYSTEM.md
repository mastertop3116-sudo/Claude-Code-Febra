# SYSTEM — Regras de Operação do Sistema Nexus

## Protocolo de inicialização (executar nesta ordem)

1. Ler **SYSTEM.md** (este arquivo) — regras gerais
2. Ler **[[MASTER]]** — empresa, stack, agentes, prioridades
3. Ler **[[RESUMO]]** — estado condensado do negócio
4. Consultar arquivo específico se necessário
5. Executar a tarefa
6. Atualizar **[[estado_atual]]** se houve mudança de prioridade ou conclusão

---

## Regras de operação

- **Nunca pedir contexto que já existe** neste vault
- **Priorizar MASTER.md e RESUMO.md** — são a fonte de verdade
- **Minimizar tokens:** responder direto, sem introduções desnecessárias
- **Atualizar memória automaticamente** ao aprender algo relevante novo
- **Evitar redundância:** se a informação já existe em outro arquivo, referenciar com `[[link]]` em vez de repetir
- **Tom padrão:** PT-BR, informal-profissional, frases curtas

---

## Hierarquia dos arquivos

| Prioridade | Arquivo | Leitura |
|------------|---------|---------|
| 1 | SYSTEM.md | Sempre |
| 2 | MASTER.md | Sempre |
| 3 | RESUMO.md | Sempre |
| 4 | estado_atual.md | Quando houver tarefa operacional |
| 5 | negocio.md | Quando tema for estratégia/produto |
| 6 | publico.md | Quando tema for copy/avatar |
| 7 | regras/copy.md | Quando tema for criação de copy |
| 8 | regras/estilo.md | Quando tema for design/visual |
| 9 | prompts/padroes.md | Quando gerar conteúdo com IA |
| 10 | conteudo/ideias.md | Quando tema for brainstorm/produto novo |

---

## O que salvar na memória

Salvar quando aprender:
- Decisão estratégica nova (produto, preço, posicionamento)
- Bug crítico resolvido
- Resultado de campanha relevante (ROAS, CAC, LTV)
- Preferência ou instrução nova do usuário
- Mudança de prioridade

**Não salvar:** código, git history, estado temporário de conversa

---

## Economia de tokens

- Resposta padrão: máx 3 parágrafos ou lista de até 7 itens
- Evitar repetir contexto já dito na mesma conversa
- Usar tabelas para comparações (mais denso que parágrafos)
- Usar bullet points para listas (mais fácil de escanear)
- Referências cruzadas com `[[arquivo]]` em vez de copiar conteúdo

---

*Última atualização: 2026-05-04*
