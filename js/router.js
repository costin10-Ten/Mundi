/* ════════════════════════════════════════════════════════════
   Mundi Wiki — Hash-Based Router
   ════════════════════════════════════════════════════════════ */
'use strict';

const Router = (() => {
  const routes = [];
  let currentPath = '';

  function define(pattern, handler) {
    routes.push({ pattern, handler });
  }

  function parse(hash) {
    // hash = "#/article/foo" → "/article/foo"
    return hash.replace(/^#/, '') || '/';
  }

  function match(path) {
    for (const route of routes) {
      const paramNames = [];
      const regexStr = route.pattern
        .replace(/\//g, '\\/')
        .replace(/:([^/]+)/g, (_, name) => { paramNames.push(name); return '([^/]+)'; });
      const re = new RegExp(`^${regexStr}$`);
      const m = path.match(re);
      if (m) {
        const params = {};
        paramNames.forEach((name, i) => { params[name] = decodeURIComponent(m[i + 1]); });
        return { handler: route.handler, params };
      }
    }
    return null;
  }

  function navigate(hash) {
    window.location.hash = hash;
  }

  function dispatch() {
    const path = parse(window.location.hash);
    if (path === currentPath) return;
    currentPath = path;

    // Parse query string from path
    const [pathOnly, qs] = path.split('?');
    const query = {};
    if (qs) {
      qs.split('&').forEach(part => {
        const [k, v] = part.split('=');
        if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }

    const matched = match(pathOnly);
    if (matched) {
      matched.handler({ params: matched.params, query, path: pathOnly });
    } else {
      // 404 fallback
      const fallback = routes.find(r => r.pattern === '*');
      if (fallback) fallback.handler({ params: {}, query, path: pathOnly });
    }

    // Update active sidebar links
    document.querySelectorAll('[data-route], .nav-section ul li a').forEach(el => {
      el.classList.remove('active');
      const href = el.getAttribute('href') || '';
      if (href && href !== '#/' && path.startsWith(parse(href))) el.classList.add('active');
      if (href === '#/' && path === '/') el.classList.add('active');
    });
  }

  function start() {
    window.addEventListener('hashchange', dispatch);
    dispatch(); // initial
  }

  return { define, navigate, dispatch, start, parse };
})();

window.Router = Router;
