/* ════════════════════════════════════════════════════════════
   Mundi Wiki — LocalStorage Data Layer
   ════════════════════════════════════════════════════════════ */
'use strict';

const DB_KEY = 'mundi_wiki_v1';

const Storage = (() => {
  /* ── Private helpers ──────────────────────────────────────── */
  function _load() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function _save(db) {
    try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch (e) {
      console.error('Storage write failed:', e);
    }
  }

  function _initDB() {
    const db = {
      articles: {},
      settings: { theme: 'dark' },
      version: 1,
    };
    // Seed with initial articles
    (window.MUNDI_SEED_ARTICLES || []).forEach(a => {
      db.articles[a.id] = { ...a, revisions: a.revisions || [] };
    });
    _save(db);
    return db;
  }

  function _getDB() {
    let db = _load();
    if (!db || !db.articles) db = _initDB();
    return db;
  }

  /* ── Article CRUD ─────────────────────────────────────────── */
  function getAll() {
    const db = _getDB();
    return Object.values(db.articles).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function getById(id) {
    const db = _getDB();
    return db.articles[id] || null;
  }

  function getByCategory(cat) {
    return getAll().filter(a => a.category === cat);
  }

  function getByTag(tag) {
    const t = tag.toLowerCase();
    return getAll().filter(a => (a.tags || []).some(x => x.toLowerCase() === t));
  }

  function getFeatured() {
    return getAll().filter(a => a.featured);
  }

  function getRecent(limit = 8) {
    return getAll().slice(0, limit);
  }

  function getRandom() {
    const all = getAll();
    return all[Math.floor(Math.random() * all.length)] || null;
  }

  function slugify(title) {
    return title
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w\u4e00-\u9fff-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '') || Date.now().toString(36);
  }

  function generateId(title) {
    const base = slugify(title);
    const db = _getDB();
    let id = base;
    let i = 1;
    while (db.articles[id]) { id = `${base}-${i++}`; }
    return id;
  }

  function save(data, editSummary = '') {
    const db = _getDB();
    const now = Date.now();

    if (data.id && db.articles[data.id]) {
      // Update existing
      const existing = db.articles[data.id];
      const revision = {
        content: existing.content,
        summary: existing.revisions && existing.revisions.length
          ? editSummary || '更新'
          : '初始版本',
        savedAt: existing.updatedAt || now,
      };
      db.articles[data.id] = {
        ...existing,
        ...data,
        updatedAt: now,
        revisions: [...(existing.revisions || []), revision].slice(-20), // keep last 20
      };
    } else {
      // Create new
      const id = data.id || generateId(data.title);
      db.articles[id] = {
        revisions: [],
        featured: false,
        createdAt: now,
        ...data,
        id,
        updatedAt: now,
      };
      return db.articles[id];
    }

    _save(db);
    return db.articles[data.id];
  }

  function remove(id) {
    const db = _getDB();
    if (!db.articles[id]) return false;
    delete db.articles[id];
    _save(db);
    return true;
  }

  /* ── Settings ─────────────────────────────────────────────── */
  function getSetting(key) {
    const db = _getDB();
    return db.settings ? db.settings[key] : undefined;
  }

  function setSetting(key, value) {
    const db = _getDB();
    if (!db.settings) db.settings = {};
    db.settings[key] = value;
    _save(db);
  }

  /* ── Stats ────────────────────────────────────────────────── */
  function getStats() {
    const all = getAll();
    const cats = {};
    const tags = {};
    all.forEach(a => {
      cats[a.category] = (cats[a.category] || 0) + 1;
      (a.tags || []).forEach(t => { tags[t] = (tags[t] || 0) + 1; });
    });
    return { total: all.length, byCategory: cats, byTag: tags };
  }

  /* ── Reset / Export ───────────────────────────────────────── */
  function reset() {
    localStorage.removeItem(DB_KEY);
    _initDB();
  }

  function exportJSON() {
    return JSON.stringify(_getDB(), null, 2);
  }

  return { getAll, getById, getByCategory, getByTag, getFeatured, getRecent,
           getRandom, save, remove, getSetting, setSetting, getStats,
           generateId, slugify, reset, exportJSON };
})();

window.Storage = Storage;
