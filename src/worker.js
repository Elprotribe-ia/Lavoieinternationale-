/**
 * La Voie Internationale — Worker
 * Fichiers statiques : servis par Workers Assets. Ici : uniquement /api/*.
 * Les routes de données exigent le secret ADMIN_KEY (en-tête X-Admin-Key).
 */
const HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
const json = (data, status = 200, extra = {}) => Response.json(data, { status, headers: { ...HEADERS, ...extra } });

const PROVINCES = ['Province 1', 'Province 2', 'Province 3', 'Province 4'];
const SECTIONS = ['Section 1', 'Section 2'];
const TYPES = ['image', 'document', 'audio', 'video', 'enseignement'];

// Liste blanche : seuls ces noms de tables/colonnes entrent dans le SQL
const TABLES = {
  croyants: { cols: ['nom', 'province', 'section'], req: ['nom'], enums: { province: PROVINCES, section: SECTIONS }, order: 'nom COLLATE NOCASE' },
  dirigeants: { cols: ['nom', 'fonction'], req: ['nom'], enums: {}, order: 'id' },
  medias: { cols: ['titre', 'type', 'url'], req: ['titre', 'type'], enums: { type: TYPES }, order: 'id DESC' },
};

async function sha(text) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}

async function checkKey(request, env) {
  if (!env.ADMIN_KEY) return 'missing';
  const [a, b] = await Promise.all([sha(request.headers.get('X-Admin-Key') || ''), sha(env.ADMIN_KEY)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
