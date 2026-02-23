export const config = {
  runtime: 'edge',
};

// Supabase REST API (no SDK needed at the edge)
const SUPABASE_URL = 'https://aeyxdqggngapczohqvbo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleXhkcWdnbmdhcGN6b2hxdmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTc3MTcsImV4cCI6MjA4NDU5MzcxN30.eq9Feo9dj6T1KUO-F4AN7j4x7HECb8f0B9WddFLD9C4';

const ERROR_HTML = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Site não encontrado</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Montserrat',sans-serif;min-height:100vh;background:#0a0a1a;color:#fff;display:flex;align-items:center;justify-content:center}
.c{text-align:center;padding:20px}.i{font-size:60px;margin-bottom:20px}.t{font-size:24px;font-weight:700;margin-bottom:10px}.m{color:rgba(255,255,255,.6);max-width:400px;margin-bottom:20px}
.b{display:inline-block;padding:12px 24px;background:#D4AF37;color:#000;text-decoration:none;border-radius:8px;font-weight:600}</style></head>
<body><div class="c"><div class="i">🔍</div><h1 class="t">Site não encontrado</h1><p class="m">O site que você está procurando não existe ou não está publicado.</p>
<a href="https://rafaeldemeni.com" class="b">Criar meu site</a></div></body></html>`;

export default async function handler(request) {
  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';

  // === EXTRACT SLUG ===
  let slug = null;

  // 1. From subdomain (oficial.rafaeldemeni.com)
  if (!hostname.includes('vercel.app') &&
    !hostname.includes('localhost') &&
    hostname !== 'rafaeldemeni.com' &&
    hostname !== 'www.rafaeldemeni.com') {
    const sub = hostname.split('.')[0];
    if (sub && sub !== 'www') slug = sub;
  }

  // 2. From query param (/site.html?s=slug or /s/slug)
  if (!slug) {
    slug = url.searchParams.get('s');
  }

  // 3. From path (/s/slug)
  if (!slug) {
    const match = url.pathname.match(/\/s\/([^\/]+)/);
    if (match) slug = match[1];
  }

  if (!slug) {
    return new Response(ERROR_HTML, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  slug = slug.toLowerCase().trim();

  // === FETCH FROM SUPABASE ===
  try {
    const apiUrl = `${SUPABASE_URL}/rest/v1/projects?slug=eq.${slug}&published=eq.true&select=html_content,name&limit=1`;
    const res = await fetch(apiUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json'
      }
    });

    const data = await res.json();

    if (!data || data.length === 0 || !data[0].html_content) {
      return new Response(ERROR_HTML, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // === SERVE HTML WITH CDN CACHE ===
    // s-maxage=3600: Vercel CDN caches for 1 hour
    // stale-while-revalidate=86400: serve stale while revalidating for 24h
    // Visitors in the same region get instant response from cache
    return new Response(data[0].html_content, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'X-Site-Name': data[0].name || slug,
        'X-Powered-By': 'Demeni Sites'
      }
    });

  } catch (err) {
    console.error('Edge Function error:', err);
    return new Response(ERROR_HTML, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}
