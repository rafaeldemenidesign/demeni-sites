export const config = {
    matcher: '/',
};

// Platform subdomains that should NOT be routed to the Edge Function
const PLATFORM_HOSTS = [
    'rafaeldemeni.com',
    'www.rafaeldemeni.com',
    'sites.rafaeldemeni.com',
];

const SUPABASE_URL = 'https://aeyxdqggngapczohqvbo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleXhkcWdnbmdhcGN6b2hxdmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTc3MTcsImV4cCI6MjA4NDU5MzcxN30.eq9Feo9dj6T1KUO-F4AN7j4x7HECb8f0B9WddFLD9C4';

/**
 * Vercel Edge Middleware
 *
 * Problem: subdomain sites (e.g. roberta-joias.rafaeldemeni.com) were served
 * by index.html which is a JS-based loader. WhatsApp/Facebook crawlers don't
 * execute JS, so they saw no OG meta tags → broken link previews.
 *
 * Solution: this middleware intercepts subdomain requests, fetches the
 * published html_content directly from Supabase, and returns it server-side.
 * The html_content already contains proper OG tags from generatePublishableHTML().
 */
export default async function middleware(request) {
    const hostname = request.headers.get('host') || '';

    // Skip platform hosts and preview deployments
    if (
        PLATFORM_HOSTS.includes(hostname) ||
        hostname.includes('vercel.app') ||
        hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('localhost:')
    ) {
        return;  // pass through to index.html
    }

    // Extract subdomain
    const parts = hostname.split('.');
    if (parts.length < 2) return;
    const slug = parts[0].toLowerCase();
    if (!slug || slug === 'www') return;

    // Fetch published site directly from Supabase
    try {
        const apiUrl = `${SUPABASE_URL}/rest/v1/projects?slug=eq.${slug}&published=eq.true&select=html_content,name&limit=1`;
        const res = await fetch(apiUrl, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Accept': 'application/json',
            },
        });

        const data = await res.json();

        if (!data || data.length === 0 || !data[0].html_content) {
            return;  // pass through to index.html (will show 404 via JS)
        }

        // Serve the published HTML directly — crawlers get OG tags, users get the full site
        return new Response(data[0].html_content, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                'X-Site-Name': data[0].name || slug,
                'X-Powered-By': 'Demeni Sites',
            },
        });
    } catch (err) {
        console.error('[Middleware] Error fetching site:', err);
        return;  // pass through on error
    }
}
