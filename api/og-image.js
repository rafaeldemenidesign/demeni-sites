export const config = {
    runtime: 'edge',
};

const SUPABASE_URL = 'https://aeyxdqggngapczohqvbo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleXhkcWdnbmdhcGN6b2hxdmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTc3MTcsImV4cCI6MjA4NDU5MzcxN30.eq9Feo9dj6T1KUO-F4AN7j4x7HECb8f0B9WddFLD9C4';

// Fallback: Demeni Sites branded banner (hosted on the platform itself)
const FALLBACK_IMAGE_URL = 'https://sites.rafaeldemeni.com/img/Banner-01_Demeni-Sites.webp';

/**
 * Serves the OG image for a published site.
 * Priority: custom SEO OG image > hero background > Demeni branded fallback
 *
 * Usage: /api/og-image?s=roberta-joias
 *
 * WhatsApp/Facebook/Twitter crawlers call this URL and get the actual image.
 */
export default async function handler(request) {
    const url = new URL(request.url);
    const slug = url.searchParams.get('s');

    // Validate slug: only lowercase letters, numbers, and hyphens
    if (!slug || !/^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]?$/.test(slug)) {
        return new Response('Invalid slug', { status: 400 });
    }

    try {
        // Fetch project data from Supabase (only the data column)
        const apiUrl = `${SUPABASE_URL}/rest/v1/projects?slug=eq.${encodeURIComponent(slug)}&published=eq.true&select=data&limit=1`;
        const res = await fetch(apiUrl, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Accept': 'application/json',
            },
        });

        const rows = await res.json();
        if (!rows || rows.length === 0) {
            // Site not found — redirect to fallback
            return Response.redirect(FALLBACK_IMAGE_URL, 302);
        }

        const data = rows[0].data || {};
        const pwa = data.d2Adjustments?.pwa || {};
        const seo = pwa.seo || {};

        // Priority: custom OG image > hero background
        let imageDataUri = seo.ogImage || data.d2Adjustments?.hero?.bgImage || '';

        // If it's already a public URL, just redirect to it
        if (imageDataUri && !imageDataUri.startsWith('data:') && imageDataUri !== 'img/hero-bg.webp') {
            return Response.redirect(imageDataUri, 302);
        }

        // Must be a data URI to convert
        if (!imageDataUri || !imageDataUri.startsWith('data:')) {
            // No image available — redirect to Demeni branded fallback
            return Response.redirect(FALLBACK_IMAGE_URL, 302);
        }

        // Parse data URI: data:image/webp;base64,XXXX...
        const match = imageDataUri.match(/^data:(image\/[^;]+);base64,(.+)$/);
        if (!match) {
            return Response.redirect(FALLBACK_IMAGE_URL, 302);
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
        return Response.redirect(FALLBACK_IMAGE_URL, 302);
    }
}
