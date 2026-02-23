/* ════════════════════════════════════════════════════════════
   Mundi Wiki — Full-Text Search Engine
   ════════════════════════════════════════════════════════════ */
'use strict';

const SearchEngine = (() => {

  /* ── Tokenize ─────────────────────────────────────────────── */
  function tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 0);
  }

  /* ── Score relevance ──────────────────────────────────────── */
  function score(article, queryTokens) {
    let s = 0;
    const titleTokens = tokenize(article.title);
    const summaryTokens = tokenize(article.summary || '');
    const contentTokens = tokenize(article.content || '');
    const tagTokens = (article.tags || []).flatMap(t => tokenize(t));

    queryTokens.forEach(q => {
      // Exact title match (highest weight)
      if (article.title.toLowerCase().includes(q)) s += 20;
      // Title token match
      if (titleTokens.some(t => t.startsWith(q))) s += 10;
      // Tag match
      if (tagTokens.some(t => t.startsWith(q))) s += 8;
      // Summary match
      const summaryMatches = summaryTokens.filter(t => t.includes(q)).length;
      s += summaryMatches * 3;
      // Content match
      const contentMatches = contentTokens.filter(t => t.includes(q)).length;
      s += Math.min(contentMatches, 20) * 1;
    });

    return s;
  }

  /* ── Excerpt generator ────────────────────────────────────── */
  function excerpt(text, queryTokens, maxLen = 200) {
    // Strip markdown
    const plain = text
      .replace(/{{[^}]+}}/g, '')
      .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, t, d) => d || t)
      .replace(/[*_`#>~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim();

    // Find best window around first match
    let start = 0;
    for (const q of queryTokens) {
      const idx = plain.toLowerCase().indexOf(q);
      if (idx !== -1) { start = Math.max(0, idx - 40); break; }
    }
    let snip = plain.slice(start, start + maxLen);
    if (start > 0) snip = '…' + snip;
    if (start + maxLen < plain.length) snip += '…';

    // Highlight matches
    queryTokens.forEach(q => {
      const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      snip = snip.replace(re, '<mark>$1</mark>');
    });

    return snip;
  }

  /* ── Search ───────────────────────────────────────────────── */
  function search(query, limit = 20) {
    if (!query || query.trim().length < 1) return [];
    const queryTokens = tokenize(query.trim());
    if (!queryTokens.length) return [];

    const all = window.Storage.getAll();
    const results = all
      .map(a => ({ article: a, score: score(a, queryTokens) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => ({
        ...r.article,
        _score: r.score,
        _excerpt: excerpt(r.article.content || '', queryTokens),
        _summaryHighlighted: excerpt(r.article.summary || '', queryTokens, 120),
      }));

    return results;
  }

  /* ── Quick search (for dropdown, max 6 results) ──────────── */
  function quickSearch(query) {
    return search(query, 6);
  }

  return { search, quickSearch, tokenize };
})();

window.SearchEngine = SearchEngine;
