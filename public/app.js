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
  if (!r.ok || !d.ok) throw new Error(d.error || 'Erreur serveur');
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
