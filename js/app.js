/* ════════════════════════════════════════════════════════════
   Mundi Wiki — Main Application
   ════════════════════════════════════════════════════════════ */
'use strict';

/* ── Helpers ─────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};
const CATS = window.MUNDI_CATEGORY_META;

function catBadge(cat) {
  const m = CATS[cat] || CATS.general;
  return `<span class="card-cat ${m.color}">${m.icon} ${m.label}</span>`;
}

function fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtDateTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ── Toast ───────────────────────────────────────────────────── */
function toast(msg, type = 'info') {
  const container = $('toast-container');
  const t = el('div', `toast toast-${type}`, msg);
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add('removing');
    setTimeout(() => t.remove(), 250);
  }, 3000);
}

/* ── Sidebar population ──────────────────────────────────────── */
function populateSidebar() {
  const stats = Storage.getStats();

  // Categories nav
  const catsNav = $('categories-nav');
  catsNav.innerHTML = '';
  Object.entries(CATS).forEach(([key, meta]) => {
    const count = stats.byCategory[key] || 0;
    if (!count) return;
    const li = document.createElement('li');
    li.innerHTML = `<a href="#/category/${key}">${meta.icon} ${meta.label} <small style="color:var(--text3)">${count}</small></a>`;
    catsNav.appendChild(li);
  });

  // Tag cloud
  const tagCloud = $('tag-cloud');
  tagCloud.innerHTML = '';
  const sortedTags = Object.entries(stats.byTag).sort((a, b) => b[1] - a[1]).slice(0, 20);
  sortedTags.forEach(([tag]) => {
    const chip = el('span', 'tag-chip', tag);
    chip.onclick = () => Router.navigate(`#/tag/${encodeURIComponent(tag)}`);
    tagCloud.appendChild(chip);
  });

  // Recent nav
  const recentNav = $('recent-nav');
  recentNav.innerHTML = '';
  Storage.getRecent(6).forEach(a => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#/article/${a.id}" title="${a.title}">${a.title.length > 22 ? a.title.slice(0, 22) + '…' : a.title}</a>`;
    recentNav.appendChild(li);
  });
}

/* ── Views ───────────────────────────────────────────────────── */
function setContent(html) {
  $('main-content').innerHTML = html;
}

// ── Home ──────────────────────────────────────────────────────
function renderHome() {
  const stats = Storage.getStats();
  const featured = Storage.getFeatured();
  const recent = Storage.getRecent(8);

  const featuredCards = featured.map(a => articleCard(a)).join('');
  const recentCards = recent.map(a => articleCard(a, true)).join('');

  const catCards = Object.entries(CATS).map(([key, meta]) => {
    const count = stats.byCategory[key] || 0;
    return `
      <div class="category-card" onclick="Router.navigate('#/category/${key}')">
        <div class="cat-icon">${meta.icon}</div>
        <div class="cat-name">${meta.label}</div>
        <div class="cat-count">${count} 篇文章</div>
      </div>`;
  }).join('');

  setContent(`
    <div class="home-banner">
      <h1>&#9876; Mundi 世界百科全書</h1>
      <p>歡迎來到 Mundi 的知識寶庫。在這裡，您可以探索這個充滿共鳴魔法的幻想世界的每一個角落——從宏偉的帝國首都到神秘的地底城市，從古老的歷史到當代的政治衝突。</p>
      <div class="wiki-stats">
        <div class="stat-item"><span class="stat-num">${stats.total}</span><span class="stat-lbl">文章</span></div>
        <div class="stat-item"><span class="stat-num">${Object.keys(stats.byCategory).filter(k => stats.byCategory[k] > 0).length}</span><span class="stat-lbl">分類</span></div>
        <div class="stat-item"><span class="stat-num">${Object.keys(stats.byTag).length}</span><span class="stat-lbl">標籤</span></div>
      </div>
    </div>

    ${featured.length ? `
    <div class="section-header">
      <h2>&#11088; 精選文章</h2>
      <a href="#/recent" style="font-size:.85rem;color:var(--text3)">查看全部 →</a>
    </div>
    <div class="article-grid">${featuredCards}</div>` : ''}

    <div class="section-header"><h2>&#127968; 瀏覽分類</h2></div>
    <div class="category-grid">${catCards}</div>

    <div class="section-header">
      <h2>&#8987; 最近更新</h2>
      <a href="#/recent" style="font-size:.85rem;color:var(--text3)">查看全部 →</a>
    </div>
    <div class="article-grid">${recentCards}</div>
  `);
}

function articleCard(a, compact = false) {
  const tags = (a.tags || []).slice(0, 3).map(t =>
    `<span class="card-tag">${t}</span>`).join('');
  return `
    <div class="article-card" onclick="Router.navigate('#/article/${a.id}')">
      ${catBadge(a.category)}
      <div class="card-title">${a.title}</div>
      ${!compact && a.summary ? `<div class="card-excerpt">${a.summary}</div>` : ''}
      <div class="card-tags">${tags}</div>
      <div class="card-meta">
        <span>${fmtDate(a.updatedAt)}</span>
        ${a.revisions && a.revisions.length ? `<span>${a.revisions.length} 次修訂</span>` : ''}
      </div>
    </div>`;
}

// ── Article View ──────────────────────────────────────────────
function renderArticle(id) {
  const a = Storage.getById(id);
  if (!a) {
    setContent(`
      <div class="empty-state">
        <div class="empty-icon">&#128269;</div>
        <h3>找不到文章</h3>
        <p>ID「${id}」的文章不存在，可能已被刪除或連結有誤。</p>
        <button class="btn btn-primary" onclick="Router.navigate('#/')">返回首頁</button>
        <button class="btn btn-outline" style="margin-left:8px"
          onclick="App.openEditor(null,'${id}')">建立此文章</button>
      </div>`);
    return;
  }

  const catMeta = CATS[a.category] || CATS.general;
  const tags = (a.tags || []).map(t =>
    `<a href="#/tag/${encodeURIComponent(t)}" class="card-tag" style="font-size:.82rem">${t}</a>`).join('');

  // Related: same category, exclude self
  const related = Storage.getByCategory(a.category)
    .filter(r => r.id !== a.id)
    .slice(0, 5);
  const relatedLinks = related.map(r =>
    `<a href="#/article/${r.id}" class="related-link">${r.title}</a>`).join('');

  const html = MarkdownParser.render(a.content || '');

  setContent(`
    <div class="article-page">
      <div class="article-meta-bar">
        <div class="breadcrumb">
          <a href="#/">首頁</a><span>›</span>
          <a href="#/category/${a.category}">${catMeta.icon} ${catMeta.label}</a><span>›</span>
          <span>${a.title}</span>
        </div>
        <div class="article-actions">
          <button class="btn btn-outline btn-sm" onclick="App.openEditor('${a.id}')">&#9998; 編輯</button>
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('#/history/${a.id}')">&#128214; 歷史</button>
          <button class="btn btn-outline btn-sm" onclick="App.confirmDelete('${a.id}')" style="color:var(--danger);border-color:var(--danger)">&#128465; 刪除</button>
        </div>
      </div>

      <div class="article-header">
        <h1>${a.title}</h1>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px">
          ${catBadge(a.category)}
          <span style="font-size:.8rem;color:var(--text3)">最後更新：${fmtDateTime(a.updatedAt)}</span>
          <span style="font-size:.8rem;color:var(--text3)">建立：${fmtDate(a.createdAt)}</span>
        </div>
        <div class="article-tags-row">${tags}</div>
      </div>

      <div class="wiki-content">${html}</div>

      <div class="article-footer">
        ${related.length ? `
        <div class="related-articles" style="flex:1">
          <h3>同分類文章</h3>
          <div class="related-list">${relatedLinks}</div>
        </div>` : ''}
      </div>
    </div>`);
}

// ── Article History ───────────────────────────────────────────
function renderHistory(id) {
  const a = Storage.getById(id);
  if (!a) { Router.navigate('#/'); return; }

  const revs = [...(a.revisions || [])].reverse();
  const items = revs.length
    ? revs.map((r, i) => `
        <div class="history-item">
          <span class="history-date">${fmtDateTime(r.savedAt)}</span>
          <span class="history-summary">${r.summary || '（無摘要）'}</span>
        </div>`)
    : ['<p style="color:var(--text3);padding:12px">此文章目前沒有修訂記錄。</p>'];

  setContent(`
    <div class="breadcrumb" style="margin-bottom:20px">
      <a href="#/">首頁</a><span>›</span>
      <a href="#/article/${a.id}">${a.title}</a><span>›</span>
      <span>修訂歷史</span>
    </div>
    <h1 class="page-title">修訂歷史</h1>
    <p class="page-subtitle">「${a.title}」共 ${revs.length} 次修訂</p>
    <div class="history-list">${items.join('')}</div>
    <div style="margin-top:20px">
      <button class="btn btn-outline" onclick="Router.navigate('#/article/${a.id}')">← 返回文章</button>
    </div>`);
}

// ── Search ────────────────────────────────────────────────────
function renderSearch(query) {
  if (!query) { renderHome(); return; }
  const results = SearchEngine.search(query);

  const items = results.length
    ? results.map(r => `
        <div class="search-result" onclick="Router.navigate('#/article/${r.id}')">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            ${catBadge(r.category)}
            <h3 style="margin:0">${r.title}</h3>
          </div>
          <div class="excerpt">${r._excerpt || r._summaryHighlighted || ''}</div>
        </div>`)
    : [`<div class="empty-state"><div class="empty-icon">&#128269;</div><h3>沒有找到相關文章</h3><p>請嘗試不同的關鍵字</p></div>`];

  setContent(`
    <div class="search-header">
      <h1>搜尋結果</h1>
      <div class="count">「${query}」共找到 ${results.length} 篇文章</div>
    </div>
    ${items.join('')}`);
}

// ── Category ──────────────────────────────────────────────────
function renderCategory(cat) {
  const meta = CATS[cat] || CATS.general;
  const articles = Storage.getByCategory(cat);

  const cards = articles.length
    ? `<div class="article-grid">${articles.map(a => articleCard(a)).join('')}</div>`
    : `<div class="empty-state"><div class="empty-icon">${meta.icon}</div><h3>此分類尚無文章</h3>
       <button class="btn btn-primary" onclick="App.openEditor(null,null,'${cat}')">建立第一篇</button></div>`;

  setContent(`
    <div class="breadcrumb" style="margin-bottom:16px">
      <a href="#/">首頁</a><span>›</span><span>${meta.icon} ${meta.label}</span>
    </div>
    <h1 class="page-title">${meta.icon} ${meta.label}</h1>
    <p class="page-subtitle">${articles.length} 篇文章</p>
    ${cards}`);
}

// ── Tag ───────────────────────────────────────────────────────
function renderTag(tag) {
  const articles = Storage.getByTag(tag);

  const cards = articles.length
    ? `<div class="article-grid">${articles.map(a => articleCard(a)).join('')}</div>`
    : `<div class="empty-state"><div class="empty-icon">&#127991;</div><h3>此標籤尚無文章</h3></div>`;

  setContent(`
    <div class="breadcrumb" style="margin-bottom:16px">
      <a href="#/">首頁</a><span>›</span><span>標籤：${tag}</span>
    </div>
    <h1 class="page-title">&#127991; ${tag}</h1>
    <p class="page-subtitle">${articles.length} 篇文章包含此標籤</p>
    ${cards}`);
}

// ── Recent ────────────────────────────────────────────────────
function renderRecent() {
  const articles = Storage.getAll();

  const items = articles.map(a => `
    <div class="recent-item" onclick="Router.navigate('#/article/${a.id}')">
      ${catBadge(a.category)}
      <span class="ri-title">${a.title}</span>
      <span class="ri-summary">${a.summary ? a.summary.slice(0, 60) + '…' : ''}</span>
      <span class="ri-meta">${fmtDate(a.updatedAt)}</span>
    </div>`).join('');

  setContent(`
    <h1 class="page-title">&#8987; 最近更新</h1>
    <p class="page-subtitle">依更新時間排序，共 ${articles.length} 篇</p>
    <div class="recent-list">${items}</div>`);
}

// ── Map ───────────────────────────────────────────────────────
function renderMap() {
  const regions = window.MUNDI_MAP_REGIONS || [];
  let scale = 1;

  const svgRegions = regions.map(r => `
    <g class="map-region" data-id="${r.id}" data-article="${r.article}"
       onclick="Router.navigate('#/article/${r.article}')"
       transform="translate(${r.x},${r.y})">
      <rect width="${r.w}" height="${r.h}" rx="8"
            fill="${r.color}" fill-opacity="0.75"
            stroke="${r.color}" stroke-width="2" stroke-opacity="0.9"/>
      <text x="${r.w/2}" y="${r.h/2 - 10}" text-anchor="middle"
            font-size="22" dominant-baseline="middle">${r.emoji}</text>
      <text x="${r.w/2}" y="${r.h/2 + 16}" text-anchor="middle"
            font-size="11" fill="#fff" font-weight="700"
            dominant-baseline="middle">${r.name}</text>
    </g>`).join('');

  setContent(`
    <h1 class="page-title">&#128506; 世界地圖</h1>
    <p class="page-subtitle" style="margin-bottom:18px">點擊地區卡片可前往對應文章</p>
    <div class="map-container">
      <div class="map-controls">
        <button id="map-zoom-in" title="放大">＋</button>
        <button id="map-zoom-out" title="縮小">－</button>
        <button id="map-reset" title="重設">⌂</button>
      </div>
      <div class="map-tooltip" id="map-tooltip"></div>
      <div class="map-svg-wrapper" id="map-wrapper">
        <svg id="world-map-svg" viewBox="0 0 800 520" width="800" height="520"
             xmlns="http://www.w3.org/2000/svg">
          <!-- Ocean background -->
          <rect width="800" height="520" fill="#0a1628" rx="4"/>
          <!-- Grid lines -->
          <g stroke="#1a2a40" stroke-width="1" opacity="0.5">
            ${Array.from({length:16},(_,i)=>`<line x1="${i*50}" y1="0" x2="${i*50}" y2="520"/>`).join('')}
            ${Array.from({length:11},(_,i)=>`<line x1="0" y1="${i*52}" x2="800" y2="${i*52}"/>`).join('')}
          </g>
          <!-- Main continent silhouette -->
          <ellipse cx="390" cy="270" rx="320" ry="200"
                   fill="#1a2e1a" fill-opacity="0.6" stroke="#2a4a2a" stroke-width="1"/>
          <!-- Regions -->
          ${svgRegions}
          <!-- Compass rose -->
          <g transform="translate(740,460)">
            <circle r="22" fill="#0d1a2e" stroke="#2a3a50" stroke-width="1.5"/>
            <text x="0" y="-10" text-anchor="middle" font-size="10" fill="#d4a84b" font-weight="bold">N</text>
            <text x="0" y="14"  text-anchor="middle" font-size="10" fill="#8a9ab0">S</text>
            <text x="-14" y="4" text-anchor="middle" font-size="10" fill="#8a9ab0">W</text>
            <text x="14"  y="4" text-anchor="middle" font-size="10" fill="#8a9ab0">E</text>
            <polygon points="0,-8 2,0 0,8 -2,0" fill="#d4a84b"/>
          </g>
          <!-- Title -->
          <text x="20" y="30" font-size="16" fill="#d4a84b" font-weight="800" font-family="serif">MUNDI</text>
          <text x="20" y="46" font-size="9" fill="#5a6a8a" letter-spacing="2">WORLD MAP</text>
        </svg>
      </div>
      <div class="map-legend">
        ${regions.map(r => `<div class="legend-item"><div class="legend-dot" style="background:${r.color}"></div><span style="color:var(--text2);font-size:.8rem">${r.name}</span></div>`).join('')}
      </div>
    </div>`);

  // Map controls
  const wrapper = $('map-wrapper');
  const svg = $('world-map-svg');
  const tooltip = $('map-tooltip');

  $('map-zoom-in').onclick = () => { scale = Math.min(scale + 0.25, 3); svg.style.transform = `scale(${scale})`; };
  $('map-zoom-out').onclick = () => { scale = Math.max(scale - 0.25, 0.5); svg.style.transform = `scale(${scale})`; };
  $('map-reset').onclick = () => { scale = 1; svg.style.transform = 'scale(1)'; wrapper.scrollTo(0,0); };

  // Tooltip
  svg.querySelectorAll('.map-region').forEach(g => {
    const id = g.dataset.id;
    const region = regions.find(r => r.id === id);
    if (!region) return;
    g.addEventListener('mouseenter', e => {
      tooltip.innerHTML = `<strong>${region.name}</strong><br><span style="color:var(--text3);font-size:.8rem">${region.desc}</span>`;
      tooltip.classList.add('visible');
    });
    g.addEventListener('mousemove', e => {
      const rect = $('map-container') ? document.querySelector('.map-container').getBoundingClientRect() : {left:0,top:0};
      tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
      tooltip.style.top  = (e.clientY - rect.top  - 10) + 'px';
    });
    g.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
  });
}

// ── Timeline ──────────────────────────────────────────────────
function renderTimeline() {
  const eras = window.MUNDI_TIMELINE || [];

  const content = eras.map(era => `
    <div class="timeline-era">
      <div class="timeline-era-heading">&#9654; ${era.era}</div>
      ${era.events.map(ev => `
        <div class="timeline-event">
          <div class="te-date">&#128197; ${ev.date}</div>
          <div class="te-title">${ev.title}</div>
          <div class="te-desc">${ev.desc}</div>
        </div>`).join('')}
    </div>`).join('');

  setContent(`
    <h1 class="page-title">&#128214; 歷史年表</h1>
    <p class="page-subtitle" style="margin-bottom:24px">BF = 大裂變前 (Before Fracture)，AF = 大裂變後 (After Fracture)</p>
    <div class="timeline">${content}</div>`);
}

/* ── Editor ──────────────────────────────────────────────────── */
const App = (() => {
  let _deleteTargetId = null;

  function openEditor(id = null, suggestedId = null, suggestedCat = null) {
    const modal = $('edit-modal');
    const form  = $('article-form');
    form.reset();

    $('article-id').value = '';
    $('article-preview').hidden = true;
    $('article-content').style.display = '';

    const editorTab  = $('editor-tab');
    const previewTab = $('preview-tab');
    editorTab.classList.add('active');
    previewTab.classList.remove('active');

    if (id) {
      const a = Storage.getById(id);
      if (!a) return;
      $('modal-heading').textContent = '編輯文章';
      $('article-id').value = a.id;
      $('article-title').value = a.title;
      $('article-category').value = a.category;
      $('article-tags').value = (a.tags || []).join(', ');
      $('article-content').value = a.content || '';
    } else {
      $('modal-heading').textContent = '新增文章';
      if (suggestedCat) $('article-category').value = suggestedCat;
      if (suggestedId) {
        // Try to look up title from id
        const existing = Storage.getById(suggestedId);
        if (existing) $('article-title').value = existing.title;
      }
    }

    modal.hidden = false;
    $('article-title').focus();
  }

  function closeEditor() {
    $('edit-modal').hidden = true;
  }

  function saveArticle() {
    const title   = $('article-title').value.trim();
    const category = $('article-category').value;
    const tagsRaw = $('article-tags').value.trim();
    const content = $('article-content').value.trim();
    const summary = $('edit-summary').value.trim();
    const existingId = $('article-id').value;

    if (!title) { toast('請輸入文章標題', 'error'); $('article-title').focus(); return; }
    if (!content) { toast('請輸入文章內容', 'error'); $('article-content').focus(); return; }

    const tags = tagsRaw ? tagsRaw.split(/[,，]+/).map(t => t.trim()).filter(Boolean) : [];

    const data = {
      title, category, tags, content,
      summary: summary || title,
      ...(existingId ? { id: existingId } : {}),
    };

    const saved = Storage.save(data, summary || '更新內容');
    closeEditor();
    populateSidebar();
    toast(`「${title}」已儲存`, 'success');
    Router.navigate(`#/article/${saved.id}`);
  }

  function confirmDelete(id) {
    const a = Storage.getById(id);
    if (!a) return;
    _deleteTargetId = id;
    $('delete-article-name').textContent = a.title;
    $('delete-modal').hidden = false;
  }

  function doDelete() {
    if (!_deleteTargetId) return;
    const a = Storage.getById(_deleteTargetId);
    Storage.remove(_deleteTargetId);
    $('delete-modal').hidden = false;
    $('delete-modal').hidden = true;
    _deleteTargetId = null;
    populateSidebar();
    toast(`文章已刪除`, 'info');
    Router.navigate('#/');
  }

  return { openEditor, closeEditor, saveArticle, confirmDelete, doDelete };
})();

window.App = App;

/* ── Toolbar (editor) ────────────────────────────────────────── */
function initEditorToolbar() {
  const textarea = $('article-content');

  document.querySelectorAll('.tbtn[data-wrap]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [before, after] = btn.dataset.wrap.split('|');
      const start = textarea.selectionStart;
      const end   = textarea.selectionEnd;
      const sel   = textarea.value.slice(start, end) || '文字';
      textarea.value = textarea.value.slice(0, start) + before + sel + after + textarea.value.slice(end);
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  });

  document.querySelectorAll('.tbtn[data-prefix]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prefix = btn.dataset.prefix;
      const start = textarea.selectionStart;
      const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
      textarea.value = textarea.value.slice(0, lineStart) + prefix + textarea.value.slice(lineStart);
      textarea.focus();
    });
  });

  document.querySelectorAll('.tbtn[data-snippet]').forEach(btn => {
    btn.addEventListener('click', () => {
      const snippet = btn.dataset.snippet;
      const start = textarea.selectionStart;
      textarea.value = textarea.value.slice(0, start) + snippet + textarea.value.slice(start);
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    });
  });

  // Infobox template
  $('infobox-btn').addEventListener('click', () => {
    const tpl = '{{infobox|標題=名稱|🔮|類型=|描述=}}';
    const start = textarea.selectionStart;
    textarea.value = textarea.value.slice(0, start) + tpl + textarea.value.slice(start);
    textarea.focus();
  });

  // Editor / Preview tabs
  const editorTab  = $('editor-tab');
  const previewTab = $('preview-tab');
  const preview    = $('article-preview');

  previewTab.addEventListener('click', () => {
    preview.hidden = false;
    textarea.style.display = 'none';
    preview.innerHTML = MarkdownParser.render(textarea.value);
    previewTab.classList.add('active');
    editorTab.classList.remove('active');
  });

  editorTab.addEventListener('click', () => {
    preview.hidden = true;
    textarea.style.display = '';
    editorTab.classList.add('active');
    previewTab.classList.remove('active');
    textarea.focus();
  });
}

/* ── Search ───────────────────────────────────────────────────── */
function initSearch() {
  const input    = $('global-search');
  const dropdown = $('search-dropdown');
  let debounce;

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const q = input.value.trim();
    if (!q) { dropdown.classList.remove('active'); return; }
    debounce = setTimeout(() => {
      const results = SearchEngine.quickSearch(q);
      if (!results.length) {
        dropdown.innerHTML = `<div class="srd-no-results">找不到「${q}」相關文章</div>`;
      } else {
        dropdown.innerHTML = results.map(r => {
          const m = CATS[r.category] || CATS.general;
          return `<div class="srd-item" onclick="Router.navigate('#/article/${r.id}');closeDropdown()">
            <span class="srd-cat">${m.icon} ${m.label}</span>
            <div><div class="srd-title">${r.title}</div>
            <div class="srd-excerpt">${(r.summary || '').slice(0, 60)}…</div></div>
          </div>`;
        }).join('') +
        `<div class="srd-item" style="border-top:1px solid var(--border)"
          onclick="Router.navigate('#/search?q=${encodeURIComponent(q)}');closeDropdown()">
          &#128269; 搜尋「${q}」的所有結果
        </div>`;
      }
      dropdown.classList.add('active');
    }, 200);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q) { Router.navigate(`#/search?q=${encodeURIComponent(q)}`); closeDropdown(); }
    }
    if (e.key === 'Escape') closeDropdown();
  });

  window.closeDropdown = () => {
    dropdown.classList.remove('active');
    input.value = '';
  };

  document.addEventListener('click', e => {
    if (!e.target.closest('.header-search')) closeDropdown();
  });
}

/* ── Theme ───────────────────────────────────────────────────── */
function initTheme() {
  const saved = Storage.getSetting('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtn(saved);
}

function updateThemeBtn(theme) {
  const btn = $('theme-toggle');
  btn.textContent = theme === 'dark' ? '☀' : '☽';
  btn.title = theme === 'dark' ? '切換為亮色主題' : '切換為暗色主題';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  Storage.setSetting('theme', next);
  updateThemeBtn(next);
}

/* ── Sidebar toggle ───────────────────────────────────────────── */
function initSidebar() {
  const sidebar = $('sidebar');
  const toggle  = $('sidebar-toggle');
  toggle.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('open');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  });
  // Close sidebar overlay on mobile when clicking outside
  document.addEventListener('click', e => {
    if (window.innerWidth <= 768 &&
        !e.target.closest('.wiki-sidebar') &&
        !e.target.closest('#sidebar-toggle')) {
      sidebar.classList.remove('open');
    }
  });
}

/* ── Routes ──────────────────────────────────────────────────── */
function initRoutes() {
  Router.define('/',                 () => renderHome());
  Router.define('/article/:id',      ({ params }) => renderArticle(params.id));
  Router.define('/history/:id',      ({ params }) => renderHistory(params.id));
  Router.define('/category/:cat',    ({ params }) => renderCategory(params.cat));
  Router.define('/tag/:tag',         ({ params }) => renderTag(params.tag));
  Router.define('/search',           ({ query })  => renderSearch(query.q || ''));
  Router.define('/recent',           () => renderRecent());
  Router.define('/map',              () => renderMap());
  Router.define('/timeline',         () => renderTimeline());
  Router.define('/random',           () => {
    const a = Storage.getRandom();
    if (a) Router.navigate(`#/article/${a.id}`);
    else Router.navigate('#/');
  });
  Router.define('*',                 () => renderHome());
}

/* ── Event Wiring ────────────────────────────────────────────── */
function initEvents() {
  // New article button
  $('new-article-btn').addEventListener('click', () => App.openEditor());

  // Modal close
  $('modal-close').addEventListener('click', App.closeEditor);
  $('cancel-edit').addEventListener('click', App.closeEditor);
  $('edit-modal').addEventListener('click', e => { if (e.target === $('edit-modal')) App.closeEditor(); });

  // Save article
  $('save-article').addEventListener('click', App.saveArticle);

  // Delete modal
  $('cancel-delete').addEventListener('click', () => { $('delete-modal').hidden = true; });
  $('confirm-delete').addEventListener('click', App.doDelete);
  $('delete-modal').addEventListener('click', e => { if (e.target === $('delete-modal')) $('delete-modal').hidden = true; });

  // Theme toggle
  $('theme-toggle').addEventListener('click', toggleTheme);
}

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSidebar();
  initSearch();
  initEditorToolbar();
  initEvents();
  initRoutes();
  populateSidebar();
  Router.start();
  $('page-loader').remove();
});
