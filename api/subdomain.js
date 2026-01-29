export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';
  
  // Main domains - don't redirect
  if (hostname === 'rafaeldemeni.com' || 
      hostname === 'www.rafaeldemeni.com' ||
      hostname.includes('vercel.app') ||
      hostname.includes('localhost')) {
    // Pass through to normal routing
    return new Response(null, { status: 404 });
  }
  
  // Extract subdomain
  const subdomain = hostname.split('.')[0];
  
  if (!subdomain || subdomain === 'www') {
    return new Response(null, { status: 404 });
  }
  
  // Redirect to site.html with slug
  const siteUrl = new URL('/site.html', url.origin);
  siteUrl.searchParams.set('s', subdomain);
  
  // Fetch the site.html and return it
  const response = await fetch(siteUrl.toString());
  return response;
}
