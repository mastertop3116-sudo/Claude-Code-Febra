// ============================================================
// Sistema de Aprendizados — salva automaticamente no Supabase
// e no Obsidian Vault toda vez que algo significativo é resolvido
// ============================================================

'use strict';

const fs   = require('fs');
const path = require('path');

const OBSIDIAN_PATH = 'C:/Users/Rodrigo Cruz/Documents/Obsidian Vault/tecnologia/aprendizados.md';

const CATEGORIAS = ['bug_fix', 'melhoria', 'padrao', 'prompt', 'template'];

/**
 * Salva um aprendizado no Supabase e no Obsidian.
 *
 * @param {object} dados
 * @param {string} dados.titulo      - Título curto descritivo
 * @param {string} dados.categoria   - bug_fix | melhoria | padrao | prompt | template
 * @param {string} [dados.problema]  - O que estava errado / o desafio
 * @param {string} dados.solucao     - O que foi feito para resolver
 * @param {object} [dados.contexto]  - Dados extras (arquivo, tipo, etc.)
 * @param {string[]} [dados.tags]    - Tags para busca futura
 * @param {string} [dados.fonte]     - engine | template | server | manual
 */
async function salvar(dados) {
  const { titulo, categoria, problema, solucao, contexto, tags = [], fonte = 'engine' } = dados;

  if (!titulo || !solucao) return;
  if (!CATEGORIAS.includes(categoria)) return;

  // ── 1. Salva no Supabase ────────────────────────────────
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    await supa.from('aprendizados').insert({
      titulo, categoria, problema, solucao,
      contexto: contexto || null,
      tags: tags.length ? tags : null,
      fonte,
    });
  } catch (e) {
    // Silencioso — não quebra o fluxo principal
  }

  // ── 2. Salva no Obsidian ────────────────────────────────
  try {
    const data   = new Date().toISOString().slice(0, 10);
    const hora   = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const emoji  = { bug_fix:'🐛', melhoria:'✨', padrao:'🔧', prompt:'💬', template:'📄' }[categoria] || '📝';
    const tagsStr = tags.length ? tags.map(t=>`\`${t}\``).join(' ') : '';

    const bloco = [
      `\n---\n`,
      `## ${emoji} ${titulo}`,
      `**Data:** ${data} ${hora} · **Categoria:** ${categoria} · **Fonte:** ${fonte}`,
      tagsStr ? `**Tags:** ${tagsStr}` : '',
      problema ? `\n**Problema:**\n${problema}` : '',
      `\n**Solução:**\n${solucao}`,
      contexto ? `\n**Contexto:** \`${JSON.stringify(contexto)}\`` : '',
    ].filter(Boolean).join('\n');

    // Garante que o arquivo existe com cabeçalho
    if (!fs.existsSync(OBSIDIAN_PATH)) {
      fs.writeFileSync(OBSIDIAN_PATH, '# Aprendizados Técnicos — MAX\n\n> Gerado automaticamente pelo sistema. Não editar manualmente.\n', 'utf8');
    }

    fs.appendFileSync(OBSIDIAN_PATH, bloco + '\n', 'utf8');
  } catch (e) {
    // Silencioso
  }
}

module.exports = { salvar };
