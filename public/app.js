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
