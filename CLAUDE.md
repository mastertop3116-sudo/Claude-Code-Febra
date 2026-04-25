# CLAUDE.md — Instruções permanentes para o agente

## Git — Fluxo obrigatório após qualquer mudança

Após cada commit, sempre executar na ordem:

```bash
# 1. Push na branch de desenvolvimento
git remote set-url origin https://<PAT>@github.com/mastertop3116-sudo/Claude-Code-Febra.git
git push -u origin claude/add-system-status-rDb9J

# 2. Merge no main (dispara deploy automático no Render)
git checkout main
git merge claude/add-system-status-rDb9J
git push origin main

# 3. Voltar para a branch de desenvolvimento
git checkout claude/add-system-status-rDb9J

# 4. Restaurar remote original
git remote set-url origin http://127.0.0.1:33995/git/mastertop3116-sudo/Claude-Code-Febra/
```

## Referências

| Item | Valor |
|------|-------|
| Branch de desenvolvimento | `claude/add-system-status-rDb9J` |
| Render (deploy automático via main) | https://claude-code-febra.onrender.com |
| Supabase projeto | `vzuaglghjbowhkogqlfk` |
| Schema SQL | `supabase/schema.sql` |
