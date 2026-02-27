// ===========================
// DEMENI CORE — SERVICE WORKER
// PWA offline support + cache
// ===========================

const CACHE_NAME = 'demeni-core-v2';
const PRECACHE = [
    '/core.html',
    '/css/core.css',
    '/js/core.js',
    '/js/supabase.js',
    '/img/favicon.svg',
    '/img/favicon.png',
    '/core-manifest.json'
];

// External resources to cache on first use
const CDN_CACHE = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
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
            Promise.all(
                keys.filter(k => k.startsWith('demeni-core-') && k !== CACHE_NAME)
                    .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch strategy: Network-first with cache fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip Supabase API calls (always need fresh data)
    if (event.request.url.includes('supabase.co')) return;

    // Skip chrome-extension and other non-http
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache successful responses
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Offline: try cache
                return caches.match(event.request).then(cached => {
                    if (cached) return cached;

                    // Offline fallback for navigation
                    if (event.request.mode === 'navigate') {
                        return caches.match('/core.html');
                    }

                    return new Response('Offline', { status: 503, statusText: 'Offline' });
                });
            })
    );
});

// Background Sync: queue data changes when offline
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-orders') {
        event.waitUntil(syncPendingChanges());
    }
});

async function syncPendingChanges() {
    // This will be called when connection is restored
    // Notify all clients to trigger sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({ type: 'SYNC_READY' });
    });
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body || 'Nova atualização no Demeni Core',
        icon: '/img/favicon.png',
        badge: '/img/favicon.png',
        vibrate: [100, 50, 100],
        data: { url: data.url || '/core.html' },
        actions: [
            { action: 'open', title: 'Abrir' },
            { action: 'close', title: 'Fechar' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Demeni Core', options)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') return;

    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then(clients => {
            // Focus existing window or open new
            for (const client of clients) {
                if (client.url.includes('core.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            return self.clients.openWindow(event.notification.data.url || '/core.html');
        })
    );
});
