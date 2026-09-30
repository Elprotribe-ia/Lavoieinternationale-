/**
 * La Voie Internationale — Cloudflare Worker
 * Les fichiers statiques (public/) sont servis directement par Workers Assets.
 * Ce Worker ne gère que les routes /api/* (voir "run_worker_first" dans wrangler.jsonc).
 */

const API_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

const json = (data, status = 200, extra = {}) =>
  Response.json(data, { status, headers: { ...API_HEADERS, ...extra } });

async function handleApi(request, env, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json({ ok: false, error: 'Méthode non autorisée' }, 405, { Allow: 'GET, HEAD' });
  }

  if (url.pathname === '/api/health') {
    const body = { ok: true, app: 'La Voie Internationale' };

    // /api/health?db=1 vérifie aussi la connexion à D1
    if (url.searchParams.get('db') === '1') {
      try {
        await env.DB.prepare('SELECT 1').first();
        body.db = 'ok';
      } catch (err) {
        console.error('D1 health check failed:', err);
        return json({ ok: false, app: body.app, db: 'error' }, 503);
      }
    }
    return json(body);
  }

  return json({ ok: false, error: 'Route introuvable' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname.startsWith('/api/')) return await handleApi(request, env, url);
      return await env.ASSETS.fetch(request);
    } catch (err) {
      console.error('Unhandled error:', err);
      return json({ ok: false, error: 'Erreur interne' }, 500);
    }
  },
};
