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

const nav = (a) => `<nav class="bottom" aria-label="Navigation principale">${NAV.map(([id, act, ic, lb]) =>
  `<button type="button" class="${id === a ? 'active' : ''}" data-action="${act}"><span aria-hidden="true">${ic}</span><br>${lb}</button>`).join('')}</nav>`;
function shell(title, body, active) {
  app.innerHTML = `<header class="top"><button type="button" data-action="home" aria-label="Accueil">‹</button><h2>${esc(title)}</h2></header><main class="content">${body}</main>${nav(active)}`;
  window.scrollTo(0, 0);
}

const inp = (n, ph, type = 'text') => `<input type="${type}" name="${n}" placeholder="${esc(ph)}" aria-label="${esc(ph)}" maxlength="200">`;
const sel = (n, label, pairs, val) => `<select name="${n}" aria-label="${label}">${pairs.map(([v, l]) => `<option value="${esc(v)}"${v === val ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
const form = (kind, fields) => `<div class="form" data-kind="${kind}"><h3>Ajouter</h3>${fields}<button type="button" class="primary" data-action="save">+ Ajouter</button><p class="err" role="alert"></p></div>`;
const item = (kind, id, title, sub) => `<div class="card row item"><div><b>${esc(title)}</b><div class="muted">${sub}</div></div><button type="button" class="del" data-action="del" data-kind="${kind}" data-id="${id}" aria-label="Supprimer ${esc(title)}">✕</button></div>`;
const page = (title, active, f, items) => shell(title, `${f}<input class="search" type="search" placeholder="Rechercher..." aria-label="Rechercher"><div class="list">${items || '<p class="muted">Aucun élément pour le moment.</p>'}</div>`, active);

views.splash = () => {
  app.innerHTML = `<section class="splash"><img src="icon-192.png" width="180" height="180" alt="Logo"><h1>La Voie Internationale</h1><div class="tag">UN PEUPLE • UNE FOI • UNE MISSION</div><div class="welcome">Bienvenue !</div><p class="desc">Études et des formations bibliques</p><button type="button" class="continue" data-action="home">Continuer →</button></section>`;
};
views.login = (msg) => {
  app.innerHTML = `<section class="splash"><img src="icon-192.png" width="120" height="120" alt="Logo"><h1>Accès administrateur</h1><div class="form"><input type="password" id="key" placeholder="Code administrateur" aria-label="Code administrateur" autocomplete="current-password"><button type="button" class="continue" data-action="login">Entrer</button></div><p class="err" role="alert">${esc(msg || '')}</p></section>`;
};
views.home = async () => {
  const s = await api('stats');
  shell('La Voie Internationale', `<div class="hello"><b>Bonjour, Administrateur</b><br>Que Dieu bénisse votre journée !</div>
<div class="stats"><div class="stat">Croyants<b>${s.croyants}</b></div><div class="stat">Provinces<b>${PROVINCES.length}</b></div><div class="stat">Comité exécutif<b>${s.dirigeants}</b></div><div class="stat">Médias<b>${s.medias}</b></div></div>
<h3>Accès rapide</h3>
<div class="quick"><button type="button" data-action="croyants">♙<br>Croyants</button><button type="button" data-action="provinces">⌖<br>Provinces</button><button type="button" data-action="committee">♟<br>Comité</button><button type="button" data-action="teaching">▣<br>Enseignements</button><button type="button" data-action="videos">▶<br>Vidéos</button><button type="button" data-action="media">▤<br>Médias</button></div>`, 'h');
};
views.provinces = () => {
  const cards = PROVINCES.map((p) => `<div class="card province"><div><b>${esc(p)}</b><div class="muted">Organisation provinciale</div></div><div class="sections">${SECTIONS.map((s) =>
    `<button type="button" class="pill" data-action="croyants" data-province="${esc(p)}" data-section="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`).join('');
  shell('Provinces', `<div class="list">${cards}</div>`, 'p');
};
views.croyants = async (p, s) => {
  const qs = new URLSearchParams();
  if (p) qs.set('province', p);
  if (s) qs.set('section', s);
  const { items } = await api('croyants?' + qs);
  const f = form('croyants', inp('nom', 'Nom complet') + sel('province', 'Province', PROVINCES.map((x) => [x, x]), p) + sel('section', 'Section', SECTIONS.map((x) => [x, x]), s));
  page(p ? `${p} — ${s}` : 'Registre des Croyants', p ? 'p' : 'c', f, items.map((c) => item('croyants', c.id, c.nom, esc(`${c.province || '—'} · ${c.section || '—'}`))).join(''));
};
views.committee = async () => {
  const { items } = await api('dirigeants');
  const f = form('dirigeants', inp('nom', 'Nom complet') + inp('fonction', 'Fonction (à écrire toi-même)'));
  page('Comité Exécutif', 'e', f, items.map((d) => item('dirigeants', d.id, d.nom, esc(d.fonction || 'Fonction non précisée'))).join(''));
};
async function lib(title, type) {
  const { items } = await api('medias' + (type ? '?type=' + type : ''));
  const tf = type ? `<input type="hidden" name="type" value="${type}">` : sel('type', 'Type', ['image', 'document', 'audio'].map((t) => [t, LABEL[t]]));
  const f = form('medias', inp('titre', 'Titre') + inp('url', 'Lien https:// (YouTube, Drive, PDF...)', 'url') + tf);
  page(title, 'm', f, items.map((m) => item('medias', m.id, m.titre, esc(LABEL[m.type] || '') + (m.url ? ` · <a href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">Ouvrir</a>` : ''))).join(''));
}
views.teaching = () => lib('Enseignements', 'enseignement');
views.videos = () => lib('Vidéos', 'video');
views.media = () => lib('Médias');
views.more = () => {
  shell('Plus', `<div class="list"><button type="button" class="section-btn" data-action="teaching">Enseignements</button><button type="button" class="section-btn" data-action="videos">Vidéos</button><button type="button" class="section-btn" data-action="media">Médias</button><button type="button" class="section-btn" data-action="logout">Verrouiller l’application</button></div>`, 'm');
};
async function save(el) {
  const f = el.closest('.form');
  const body = {};
  f.querySelectorAll('[name]').forEach((i) => { body[i.name] = i.value; });
  const err = f.querySelector('.err');
  err.textContent = '';
  el.disabled = true;
  try { await api(f.dataset.kind, 'POST', body); await go(...current); } catch (e) {
    if (e.message !== 'auth') { err.textContent = e.message; el.disabled = false; }
  }
}
async function del(el) {
  if (!window.confirm('Supprimer cet élément ?')) return;
  try { await api(`${el.dataset.kind}/${el.dataset.id}`, 'DELETE'); await go(...current); } catch (e) { /* géré par api() */ }
}

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || !app.contains(el)) return;
  const { action, province, section } = el.dataset;
  if (action === 'save') return save(el);
  if (action === 'del') return del(el);
  if (action === 'logout') { setKey(''); return views.login(); }
  if (action === 'login') {
    const v = (document.getElementById('key').value || '').trim();
    if (!v) return;
    setKey(v);
    return go('home');
  }
  if (Object.prototype.hasOwnProperty.call(views, action)) go(action, province, section);
});
app.addEventListener('input', (e) => {
  if (!e.target.classList.contains('search')) return;
  const q = e.target.value.toLowerCase();
  app.querySelectorAll('.item').forEach((c) => { c.hidden = !c.textContent.toLowerCase().includes(q); });
});

views.splash();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('SW:', err));
  });
}
