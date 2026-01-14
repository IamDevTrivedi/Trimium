const CACHE_NAME = 'trimium-offline-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache for offline use
const OFFLINE_ASSETS = [
    OFFLINE_URL,
    '/favicon.png',
    '/brand.png',
];

// Install event - cache offline assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching offline assets');
            return cache.addAll(OFFLINE_ASSETS);
        })
    );
    // Activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => {
                        console.log('[ServiceWorker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        })
    );
    // Take control of all pages immediately
    self.clients.claim();
});

// Fetch event - serve offline page when network fails
self.addEventListener('fetch', (event) => {
    // Only handle navigation requests (page loads)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // Network failed, serve the offline page
                    return caches.match(OFFLINE_URL);
                })
        );
        return;
    }

    // For other requests, try network first, then cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses for static assets
                if (response.ok && event.request.url.match(/\.(png|jpg|jpeg|svg|ico|woff2?)$/)) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Try to serve from cache
                return caches.match(event.request);
            })
    );
});
