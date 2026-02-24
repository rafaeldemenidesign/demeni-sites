export const config = {
    runtime: 'edge',
};

const SUPABASE_URL = 'https://aeyxdqggngapczohqvbo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleXhkcWdnbmdhcGN6b2hxdmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTc3MTcsImV4cCI6MjA4NDU5MzcxN30.eq9Feo9dj6T1KUO-F4AN7j4x7HECb8f0B9WddFLD9C4';

/**
 * Serves the OG image for a published site.
 * Extracts the hero background image from project data stored in Supabase
 * and returns it as an actual image file.
 *
 * Usage: /api/og-image?s=roberta-joias
 *
 * WhatsApp/Facebook crawlers call this URL (set as og:image in the HTML)
 * and get the actual image bytes instead of a data URI.
 */
export default async function handler(request) {
    const url = new URL(request.url);
    const slug = url.searchParams.get('s');

    if (!slug) {
        return new Response('Missing slug', { status: 400 });
    }

    try {
        // Fetch project data from Supabase (only the data column, not full HTML)
        const apiUrl = `${SUPABASE_URL}/rest/v1/projects?slug=eq.${slug}&published=eq.true&select=data&limit=1`;
        const res = await fetch(apiUrl, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Accept': 'application/json',
            },
        });

        const rows = await res.json();
        if (!rows || rows.length === 0) {
            return new Response('Not found', { status: 404 });
        }

        const data = rows[0].data || {};
        const pwa = data.d2Adjustments?.pwa || {};
        const seo = pwa.seo || {};

        // Priority: custom OG image > hero background
        let imageDataUri = seo.ogImage || data.d2Adjustments?.hero?.bgImage || '';

        // Must be a data URI to convert
        if (!imageDataUri || !imageDataUri.startsWith('data:')) {
            return new Response('No image available', { status: 404 });
        }

        // Parse data URI: data:image/webp;base64,XXXX...
        const match = imageDataUri.match(/^data:(image\/[^;]+);base64,(.+)$/);
        if (!match) {
            return new Response('Invalid image format', { status: 400 });
        }

        const mimeType = match[1];
        const base64Data = match[2];

        // Convert base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return new Response(bytes, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=86400, s-maxage=86400',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (err) {
        console.error('[og-image] Error:', err);
        return new Response('Server error', { status: 500 });
    }
}
