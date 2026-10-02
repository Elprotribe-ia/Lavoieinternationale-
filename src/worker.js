Pp/**
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
const auth = await checkKey(request, env);
  if (auth === 'missing') return json({ ok: false, error: 'Code administrateur non configuré sur le serveur' }, 503);
  if (!auth) return json({ ok: false, error: 'Code incorrect' }, 401);

  if (name === 'stats' && method === 'GET') {
    const rows = await env.DB.batch(['croyants', 'dirigeants', 'medias'].map((t) => env.DB.prepare(`SELECT COUNT(*) AS n FROM ${t}`)));
    return json({ ok: true, croyants: rows[0].results[0].n, dirigeants: rows[1].results[0].n, medias: rows[2].results[0].n });
  }

  if (!Object.hasOwn(TABLES, name || '')) return json({ ok: false, error: 'Route introuvable' }, 404);
  const table = TABLES[name];

  if (method === 'GET') {
    const where = [];
    const args = [];
    for (const key of Object.keys(table.enums)) {
      const v = url.searchParams.get(key);
      if (v) { where.push(`${key} = ?`); args.push(v); }
    }
    const q = url.searchParams.get('q');
    if (q) { where.push(`${table.cols[0]} LIKE ?`); args.push(`%${q.slice(0, 100)}%`); }
    const sql = `SELECT id, ${table.cols.join(', ')} FROM ${name}${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY ${table.order} LIMIT 500`;
    const { results } = await env.DB.prepare(sql).bind(...args).all();
    return json({ ok: true, items: results });
}
if (method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: 'Données invalides' }, 400); }
    const { out, error } = clean(table, body);
    if (error) return json({ ok: false, error }, 400);
    const marks = table.cols.map(() => '?').join(', ');
    const res = await env.DB.prepare(`INSERT INTO ${name} (${table.cols.join(', ')}) VALUES (${marks})`).bind(...table.cols.map((c) => out[c])).run();
    return json({ ok: true, id: res.meta.last_row_id }, 201);
  }

  if (method === 'DELETE') {
    if (!/^\d+$/.test(id || '')) return json({ ok: false, error: 'Identifiant invalide' }, 400);
    await env.DB.prepare(`DELETE FROM ${name} WHERE id = ?`).bind(Number(id)).run();
    return json({ ok: true });
  }

  return json({ ok: false, error: 'Méthode non autorisée' }, 405, { Allow: 'GET, POST, DELETE' });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith('/api/')) {
        if (env.DB) await ensureSchema(env);
        return await handleApi(request, env, url);
      }
      return await env.ASSETS.fetch(request);
    } catch (err) {
      console.error('Unhandled error:', err);
      return json({ ok: false, error: 'Erreur interne', detail: String((err && err.message) || err).slice(0, 200) }, 500);
    }
  },
};
