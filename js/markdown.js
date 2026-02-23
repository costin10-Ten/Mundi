/* ════════════════════════════════════════════════════════════
   Mundi Wiki — Markdown Parser with Wiki Extensions
   Supports: headings, bold, italic, links, wikilinks, lists,
   blockquotes, code, tables, hr, infoboxes, images
   ════════════════════════════════════════════════════════════ */
'use strict';

const MarkdownParser = (() => {

  /* ── Utility ──────────────────────────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function articleExists(title) {
    if (!window.Storage) return false;
    const all = window.Storage.getAll();
    const t = title.toLowerCase();
    return all.some(a => a.title.toLowerCase() === t || a.id === t);
  }

  function articleId(title) {
    if (!window.Storage) return '';
    const all = window.Storage.getAll();
    const t = title.toLowerCase();
    const found = all.find(a => a.title.toLowerCase() === t || a.id === t);
    return found ? found.id : window.Storage.slugify(title);
  }

  /* ── Infobox Parser ───────────────────────────────────────── */
  // Syntax: {{infobox|標題=名稱|emoji|key=value|…}}
  function parseInfobox(raw) {
    const parts = raw.split('|');
    if (!parts[0] || parts[0].trim().toLowerCase() !== 'infobox') return raw;

    const title = parts[1] ? esc(parts[1].trim()) : '';
    const emoji = parts[2] && !parts[2].includes('=') ? parts[2].trim() : '';
    const startIdx = emoji ? 3 : 2;

    const rows = [];
    for (let i = startIdx; i < parts.length; i++) {
      const eqPos = parts[i].indexOf('=');
      if (eqPos === -1) continue;
      const key = esc(parts[i].slice(0, eqPos).trim());
      const val = esc(parts[i].slice(eqPos + 1).trim());
      rows.push(`<tr><th>${key}</th><td>${val}</td></tr>`);
    }

    return `<div class="infobox">
  <div class="infobox-title">${title}</div>
  ${emoji ? `<div class="infobox-image">${emoji}</div>` : ''}
  <table>${rows.join('')}</table>
</div>`;
  }

  /* ── Block-level transformations ─────────────────────────── */
  function parseBlocks(text) {
    const lines = text.split('\n');
    const out = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // ── Fenced code block ──────────────────────
      if (line.trimStart().startsWith('```')) {
        const lang = line.replace(/^```/, '').trim();
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
          codeLines.push(esc(lines[i]));
          i++;
        }
        out.push(`<pre><code class="lang-${esc(lang)}">${codeLines.join('\n')}</code></pre>`);
        i++;
        continue;
      }

      // ── Infobox / template {{…}} ────────────────
      if (line.trimStart().startsWith('{{')) {
        const end = line.indexOf('}}');
        if (end !== -1) {
          const inner = line.slice(line.indexOf('{{') + 2, end);
          out.push(parseInfobox(inner));
          i++;
          continue;
        }
      }

      // ── ATX Headings ──────────────────────────
      const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (hMatch) {
        const level = hMatch[1].length;
        const content = parseInline(hMatch[2]);
        const anchor = esc(hMatch[2].toLowerCase().replace(/\s+/g, '-').replace(/[^\w-\u4e00-\u9fff]/g, ''));
        out.push(`<h${level} id="${anchor}">${content}</h${level}>`);
        i++;
        continue;
      }

      // ── Blockquote ────────────────────────────
      if (line.startsWith('>')) {
        const qLines = [];
        while (i < lines.length && lines[i].startsWith('>')) {
          qLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        out.push(`<blockquote>${parseBlocks(qLines.join('\n'))}</blockquote>`);
        continue;
      }

      // ── Unordered list ───────────────────────
      if (/^[-*+]\s/.test(line)) {
        const items = [];
        while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
          items.push(`<li>${parseInline(lines[i].replace(/^[-*+]\s/, ''))}</li>`);
          i++;
        }
        out.push(`<ul>${items.join('')}</ul>`);
        continue;
      }

      // ── Ordered list ─────────────────────────
      if (/^\d+\.\s/.test(line)) {
        const items = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          items.push(`<li>${parseInline(lines[i].replace(/^\d+\.\s/, ''))}</li>`);
          i++;
        }
        out.push(`<ol>${items.join('')}</ol>`);
        continue;
      }

      // ── Table ────────────────────────────────
      if (line.includes('|') && i + 1 < lines.length && lines[i + 1].match(/^[\s|:-]+$/)) {
        const headerCells = line.split('|').filter((_, ci, arr) => ci > 0 && ci < arr.length - 1 || (arr.length === 1));
        const alignRow = lines[i + 1].split('|').filter((_, ci, arr) => ci > 0 && ci < arr.length - 1 || (arr.length === 1));
        const aligns = alignRow.map(c => {
          const t = c.trim();
          if (t.startsWith(':') && t.endsWith(':')) return 'center';
          if (t.endsWith(':')) return 'right';
          return 'left';
        });

        const headers = headerCells.map((c, ci) =>
          `<th style="text-align:${aligns[ci] || 'left'}">${parseInline(c.trim())}</th>`).join('');

        i += 2; // skip header + separator
        const rows = [];
        while (i < lines.length && lines[i].includes('|')) {
          const cells = lines[i].split('|').filter((_, ci, arr) => ci > 0 && ci < arr.length - 1 || (arr.length === 1));
          const tds = cells.map((c, ci) =>
            `<td style="text-align:${aligns[ci] || 'left'}">${parseInline(c.trim())}</td>`).join('');
          rows.push(`<tr>${tds}</tr>`);
          i++;
        }
        out.push(`<table><thead><tr>${headers}</tr></thead><tbody>${rows.join('')}</tbody></table>`);
        continue;
      }

      // ── Horizontal rule ──────────────────────
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
        out.push('<hr>');
        i++;
        continue;
      }

      // ── Blank line ───────────────────────────
      if (line.trim() === '') {
        i++;
        continue;
      }

      // ── Paragraph ───────────────────────────
      const pLines = [];
      while (i < lines.length && lines[i].trim() !== '' &&
             !lines[i].startsWith('#') && !lines[i].startsWith('>') &&
             !/^[-*+]\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i]) &&
             !lines[i].trimStart().startsWith('```') &&
             !lines[i].trimStart().startsWith('{{') &&
             !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())) {
        pLines.push(lines[i]);
        i++;
      }
      if (pLines.length) {
        out.push(`<p>${parseInline(pLines.join(' '))}</p>`);
      }
    }

    return out.join('\n');
  }

  /* ── Inline transformations ──────────────────────────────── */
  function parseInline(text) {
    // Escape HTML first
    let s = text;

    // Bold + Italic combined
    s = s.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>');
    s = s.replace(/_{3}(.+?)_{3}/g, '<strong><em>$1</em></strong>');

    // Bold
    s = s.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>');
    s = s.replace(/_{2}(.+?)_{2}/g, '<strong>$1</strong>');

    // Italic
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    s = s.replace(/_([^_]+?)_/g, '<em>$1</em>');

    // Inline code
    s = s.replace(/`(.+?)`/g, '<code>$1</code>');

    // Images before links: ![alt](src)
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
      `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`);

    // External links: [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) =>
      `<a href="${esc(url)}" target="_blank" rel="noopener">${parseInline(text)}</a>`);

    // Wiki links: [[Article Title|display text]] or [[Article Title]]
    s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, display) => {
      const label = display || target;
      const exists = articleExists(target.trim());
      const id = articleId(target.trim());
      const cls = exists ? 'wiki-link' : 'wiki-link-missing';
      const title = exists ? '' : ` title="此文章尚未建立"`;
      return `<a href="#/article/${encodeURIComponent(id)}" class="${cls}"${title}>${esc(label)}</a>`;
    });

    // Strikethrough
    s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');

    return s;
  }

  /* ── Public API ───────────────────────────────────────────── */
  function render(markdown) {
    if (!markdown) return '';
    try {
      return parseBlocks(markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n'));
    } catch (e) {
      console.error('Markdown parse error:', e);
      return `<p>${esc(markdown)}</p>`;
    }
  }

  function renderPreview(markdown) {
    return render(markdown);
  }

  return { render, renderPreview };
})();

window.MarkdownParser = MarkdownParser;
