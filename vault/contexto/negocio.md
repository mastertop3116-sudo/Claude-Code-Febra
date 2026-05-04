# Negócio — Modelo e Estratégia

## Modelo
- **Nicho:** infoprodutos digitais low-ticket (R$17–R$97)
- **Canal principal:** Meta Ads (Facebook/Instagram)
- **Funil:** Tráfego → LP → Checkout GG → Upsell/Bump
- **Escala:** volume alto, CAC baixo, LTV via bump/upsell

## Estratégia de produto
- Criar infoprodutos em massa com IA (Nexus Forge)
- Templates prontos → personalização rápida por nicho
- Entrega automática via bot Telegram

## Métricas-chave
- CAC por campanha (via UTMify)
- LTV por produto (bump + upsell)
- ROAS mínimo alvo: 3×

## Produtos ativos
| Produto | UTMify ID | Meta CA |
|---------|-----------|---------|
| BIDCAP (Jiu-Jitsu infantil) | 682e5acce4e4e7748bb669ae | CA01: 944536140536242 |
| TESTE BM (Ballet) | 69685cb9af5f797b4a89f7db | CA05: 926582643329275 |
| 5D (Pack Bíblico) | 69c1e3332cc7808546f6e544 | CA04 TESTE: 1331300275504489 |

## Decisões estratégicas (Conselho — 2026-04-22)
1. Nexus Core Agent: orquestrador que trata Claude/Gemini como módulos
2. Eliminar sync manual UTMify → integração direta com API key
3. Guardrails: agente só promete o que pode entregar
4. Módulo DISC: classificar perfil do lead, adaptar comunicação
5. Data warehouse: CAC/LTV por campanha em tempo real
