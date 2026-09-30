'use strict';

/* La Voie Internationale — interface PWA
 * Aucun gestionnaire inline (onclick) : tout passe par data-action,
 * ce qui permet une Content-Security-Policy stricte (script-src 'self'). */

const app = document.getElementById('app');
const PROVINCES = ['Province 1', 'Province 2', 'Province 3', 'Province 4'];
const BELIEVERS = ['Jean Koffi', 'Marie Mbuyi', 'Paul Nzozi', 'Sarah Lemba', 'Daniel Okemba', 'Esther Kalala'];
const COMMITTEE = [
  'Président',
  'Vice-président',
  'Secrétaire Général',
  'Trésorier',
  'Chargé des Médias',
  'Responsable des Provinces',
  'Conseiller Spirituel',
];
const VIDEOS = ['Le message de l’Évangile', 'La puissance de la prière', 'Témoignage de foi', 'Formation des leaders'];

/* Échappe le HTML pour toute donnée insérée dans un template */
const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const NAV = [
  { id: 'h', action: 'home', icon: '⌂', label: 'Accueil' },
  { id: 'c', action: 'believers', icon: '♙', label: 'Croyants' },
  { id: 'p', action: 'provinces', icon: '⌖', label: 'Provinces' },
  { id: 'e', action: 'committee', icon: '♟', label: 'Comité' },
  { id: 'm', action: 'more', icon: '•••', label: 'Plus' },
];

function nav(active) {
  const items = NAV.map(
    (n) =>
      `<button type="button" class="${n.id === active ? 'active' : ''}" data-action="${n.action}"` +
      `${n.id === active ? ' aria-current="page"' : ''}><span aria-hidden="true">${n.icon}</span><br>${n.label}</button>`
  ).join('');
  return `<nav class="bottom" aria-label="Navigation principale">${items}</nav>`;
}

function shell(title, body, active) {
  app.innerHTML =
    `<header class="top"><button type="button" data-action="home" aria-label="Reto