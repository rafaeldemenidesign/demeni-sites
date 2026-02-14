// Demeni Sites — Service Worker
const CACHE_NAME = 'demeni-v1';
const PRECACHE = [
    '/app.html',
    '/css/app.css',
    '/js/supabase.js',
    '/js/auth.js',
    '/js/dashboard.js',
    '/img/favicon.svg',
    '/img/favicon.png'
];

// Install: cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch: network-first with cache fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET and Supabase API calls
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('supabase.co')) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
