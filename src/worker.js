/**
 * La Voie au Congo — Worker
 * Fichiers statiques : servis par Workers Assets. Ici : uniquement /api/*.
 * Les routes de données exigent le secret ADMIN_KEY (en-tête X-Admin-Key).
 */
const HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
const json = (data, status = 200, extra = {}) => Response.json(data, { status, headers: { ...HEADERS, ...extra } });

const PROVINCES = ['Province 1', 'Province 2', 'Province 3', 'Province 4'];
const SECTIONS = ['Section 1', 'Section 2'];
const SEXES = ['Homme', 'Femme'];
const TYPES = ['image', 'document', 'audio', 'video', 'enseignement'];

// Liste blanche : seuls ces noms de tables/colonnes entrent dans le SQL
const TABLES = {
  croyants: { cols: ['nom', 'sexe', 'province', 'section', 'fonction', 'photo'], req: ['nom', 'sexe'], enums: { sexe: SEXES, province: PROVINCES, section: SECTIONS }, max: { photo: 40000 }, order: 'nom COLLATE NOCASE' },
  dirigeants: { cols: ['nom', 'fonction'], req: ['nom'], enums: {}, max: {}, order: 'id' },
  medias: { cols: ['titre', 'type', 'url'], req: ['titre', 'type'], enums: { type: TYPES }, max: {}, order: 'id DESC' },
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
function clean(table, body) {
  const out = {};
  for (const col of table.cols) {
    const value = body && typeof body[col] === 'string' ? body[col].trim() : '';
    if (value.length > ((table.max && table.max[col]) || 200)) return { error: `Texte trop long : ${col}` };
    if (!value && table.req.includes(col)) return { error: `Champ obligatoire : ${col}` };
    if (value && table.enums[col] && !table.enums[col].includes(value)) return { error: `Valeur invalide : ${col}` };
    out[col] = value || null;
  }
  if (out.url && !/^https?:\/\//i.test(out.url)) return { error: 'Le lien doit commencer par http:// ou https://' };
  if (out.photo && !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(out.photo)) return { error: 'Photo invalide' };
  return { out };
}

async function handleApi(request, env, url) {
  const [, name, id] = url.pathname.split('/').filter(Boolean);
  const method = request.method;

  if (name === 'health') {
    if (method !== 'GET') return json({ ok: false, error: 'Méthode non autorisée' }, 405);
    const body = { ok: true, app: 'La Voie au Congo' };
    if (url.searchParams.get('db') === '1') {
      try {
        await env.DB.prepare('SELECT 1').first();
        body.db = 'ok';
      } catch (err) {
        console.error('D1 health check failed:', err);
        return json({ ok: false, db: 'error' }, 503);
      }
    }
    return json(body);
  }
