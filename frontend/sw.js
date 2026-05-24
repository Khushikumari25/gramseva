// GramSeva Service Worker - PWA Offline Support
const CACHE_NAME = 'gramseva-v1';
const OFFLINE_URLS = [
  '/',
  '/assets/css/main.css',
  '/js/app.js',
  '/js/translations.js',
  '/js/components/schemes.js',
  '/js/components/marketplace.js',
  '/js/components/equipment.js',
  '/js/components/emergency.js',
  '/js/components/ai-assistant.js',
  '/manifest.json'
];

// Install - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/');
        });
      })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Sync any offline-stored data when connection returns
  const db = await openIndexedDB();
  const pendingActions = await db.getAll('pending');
  for (const action of pendingActions) {
    try {
      await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
      });
      await db.delete('pending', action.id);
    } catch (e) {
      // Will retry on next sync
    }
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GramSevaOffline', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('schemes')) {
        db.createObjectStore('schemes', { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains('emergency')) {
        db.createObjectStore('emergency', { keyPath: 'number' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
