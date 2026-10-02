'use strict';
const app = document.getElementById('app');
const KEY = 'lvi_key';
const PROVINCES = ['Province 1', 'Province 2', 'Province 3', 'Province 4'];
const SECTIONS = ['Section 1', 'Section 2'];
const LABEL = { image: 'Image', document: 'Document', audio: 'Audio', video: 'Vidéo', enseignement: 'Enseignement' };
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const getKey = () => { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } };
const setKey = (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) { /* ignore */ } };
let current = ['home'];
const views = {};

async function api(path, method = 'GET', body) {
  let r;
  try {
    r = await fetch('/api/' + path, {
      method,
      headers: { 'X-Admin-Key': getKey(), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) { throw new Error('Connexion impossible. Vérifie ton internet.'); }
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) { setKey(''); views.login('Code incorrect'); throw new Error('auth'); }
  if (!r.ok || !d.ok) throw new Error((d.error || 'Erreur serveur') + (d.detail ? ' (' + d.detail + ')' : ''));
  return d;
}

async function go(name, ...args) {
  if (name !== 'splash' && name !== 'login' && !getKey()) return views.login();
  current = [name, ...args];
  try { await views[name](...args); } catch (e) {
    if (e.message !== 'auth') shell('Erreur', `<div class="card"><p>${esc(e.message)}</p><button type="button" class="primary" data-action="home">Retour</button></div>`, 'h');
  }
}

const NAV = [['h', 'home', '⌂', 'Accueil'], ['c', 'croyants', '♙', 'Croyants'], ['p', 'provinces', '⌖', 'Provinces'], ['e', 'committee', '♟', 'Comité'], ['m', 'more', '•••', 'Plus']];
const nav = (a) => `<nav class="bottom" aria-label="Navigation principale">${NAV.map(([id, act, ic, lb]) =>
  `<button type="button" class="${id === a ? 'active' : ''}" data-action="${act}"><span aria-hidden="true">${ic}</span><br>${lb}</button>`).join('')}</nav>`;
function shell(title, body, active) {
  app.innerHTML = `<header class="top"><button type="button" data-action="home" aria-label="Accueil">‹</button><h2>${esc(title)}</h2></header><main class="content">${body}</main>${nav(active)}`;
  window.scrollTo(0, 0);
}

const inp = (n, ph, type = 'text') => `<input type="${type}" name="${n}" placeholder="${esc(ph)}" aria-label="${esc(ph)}" maxlength="200">`;
const sel = (n, label, pairs, val) => `<select name="${n}" aria-label="${label}">${pairs.map(([v, l]) => `<option value="${esc(v)}"${v === val ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
const form = (kind, fields) => `<div class="form" data-kind="${kind}"><h3>Ajouter</h3>${fields}<button type="button" class="primary" data-action="save">+ Ajouter</button><p class="err" role="alert"></p></div>`;
const avatar = (c) => (c.photo ? `<img class="avatar" src="${esc(c.photo)}" alt="">` : `<span class="avatar" aria-hidden="true">${esc((c.nom || '?').trim().charAt(0).toUpperCase())}</span>`);
const item = (kind, id, title, sub, lead = '') => `<div class="card row item"><div class="who">${lead}<div><b>${esc(title)}</b><div class="muted">${sub}</div></div></div><button type="button" class="del" data-action="del" data-kind="${kind}" data-id="${id}" aria-label="Supprimer ${esc(title)}">✕</button></div>`;
const page = (title, active, f, items) => shell(title, `${f}<input class="search" type="search" placeholder="Rechercher..." aria-label="Rechercher"><div class="list">${items || '<p class="muted">Aucun élément pour le moment.</p>'}</div>`, active);
