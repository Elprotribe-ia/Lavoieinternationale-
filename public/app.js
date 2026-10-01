'use strict';
const app = document.getElementById('app');
const PROVINCES = ['Province 1', 'Province 2', 'Province 3', 'Province 4'];
const BELIEVERS = ['Jean Koffi', 'Marie Mbuyi', 'Paul Nzozi', 'Sarah Lemba', 'Daniel Okemba', 'Esther Kalala'];
const COMMITTEE = ['Président', 'Vice-président', 'Secrétaire Général', 'Trésorier', 'Chargé des Médias', 'Responsable des Provinces', 'Conseiller Spirituel'];
const VIDEOS = ['Le message de l’Évangile', 'La puissance de la prière', 'Témoignage de foi', 'Formation des leaders'];
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NAV = [
  { id: 'h', action: 'home', icon: '⌂', label: 'Accueil' },
  { id: 'c', action: 'believers', icon: '♙', label: 'Croyants' },
  { id: 'p', action: 'provinces', icon: '⌖', label: 'Provinces' },
  { id: 'e', action: 'committee', icon: '♟', label: 'Comité' },
  { id: 'm', action: 'more', icon: '•••', label: 'Plus' },
];
function nav(active) {
  const items = NAV.map((n) =>
    `<button type="button" class="${n.id === active ? 'active' : ''}" data-action="${n.action}">` +
    `<span aria-hidden="true">${n.icon}</span><br>${n.label}</button>`
  ).join('');
  return `<nav class="bottom" aria-label="Navigation principale">${items}</nav>`;
}
function shell(title, body, active) {
  app.innerHTML =
    `<header class="top"><button type="button" data-action="home" aria-label="Accueil">‹</button><h2>${esc(title)}</h2></header>` +
    `<main class="content">${body}</main>${nav(active)}`;
  window.scrollTo(0, 0);
}
const views = {};
views.splash = () => {
  app.innerHTML =
    `<section class="splash"><img src="icon-192.png" width="180" height="180" alt="Logo">` +
    `<h1>La Voie Internationale</h1><div class="tag">UN PEUPLE • UNE FOI • UNE MISSION</div>` +
    `<div class="welcome">Bienvenue !</div><p class="desc">Études et des formations bibliques</p>` +
    `<button type="button" class="continue" data-action="home">Continuer →</button></section>`;
};
views.home = () => {
  shell('La Voie Internationale',
    `<div class="hello"><b>Bonjour, Administrateur</b><br>Que Dieu bénisse votre journée !</div>
<div class="stats">
<div class="stat">Croyants<b>245</b></div>
<div class="stat">Provinces<b>4</b></div>
<div class="stat">Comité exécutif<b>12</b></div>
<div class="stat">Médias<b>8</b></div>
</div>
<h3>Accès rapide</h3>
<div class="quick">
<button type="button" data-action="believers">♙<br>Croyants</button>
<button type="button" data-action="provinces">⌖<br>Provinces</button>
<button type="button" data-action="committee">♟<br>Comité</button>
<button type="button" data-action="teaching">▣<br>Enseignements</button>
<button type="button" data-action="videos">▶<br>Vidéos</button>
<button type="button" data-action="media">▤<br>Médias</button>
</div>`, 'h');
};
views.provinces = () => {
  const cards = PROVINCES.map((p) =>
    `<div class="card province"><div><b>${esc(p)}</b><div class="muted">Organisation provinciale</div></div><div class="sections">` +
    `<button type="button" class="pill" data-action="section" data-province="${esc(p)}" data-section="Section 1">Section 1</button>` +
    `<button type="button" class="pill" data-action="section" data-province="${esc(p)}" data-section="Section 2">Section 2</button>` +
    `</div></div>`).join('');
  shell('Provinces', `<input class="search" type="search" placeholder="Rechercher une province..." aria-label="Rechercher"><div class="list">${cards}</div>`, 'p');
};
views.section = (province, section) => {
  shell(`${province} — ${section}`,
    `<div class="card"><h3>${esc(section)}</h3><p class="muted">Gestion de ${esc(section)}.</p>` +
    `<button type="button" class="primary" data-action="believers">Voir les croyants</button></div>`, 'p');
};
views.believers = () => {
  const cards = BELIEVERS.map((n, i) =>
    `<div class="card"><b>${esc(n)}</b><div class="muted">Province ${(i % 4) + 1} · Section ${(i % 2) + 1}</div></div>`).join('');
  shell('Registre des Croyants', `<input class="search" type="search" placeholder="Rechercher un croyant..." aria-label="Rechercher"><div class="list">${cards}</div>`, 'c');
};


