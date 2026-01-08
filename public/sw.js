const CACHE_NAME = 'zor-learning-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/assets/logo.png',
  '/manifest.json'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Background sync for data updates
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

// Background sync function
async function performBackgroundSync() {
  try {
    // Get auth data from IndexedDB or localStorage
    const authData = await getStoredAuthData();
    if (!authData || !authData.user) {
      console.log('No user logged in, skipping background sync');
      return;
    }

    // Check for updates using metadata
    const response = await fetch('/api/check-updates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      },
      body: JSON.stringify({
        uid: authData.user.uid,
        lastSyncTime: authData.lastSyncTime || 0
      })
    });

    if (response.ok) {
      const updates = await response.json();
      if (updates.hasUpdates) {
        console.log('Updates available, notifying main app');
        // Send message to main app about available updates
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'UPDATES_AVAILABLE',
              data: updates
            });
          });
        });
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper function to get stored auth data
async function getStoredAuthData() {
  return new Promise((resolve) => {
    // Try to get from IndexedDB first, fallback to localStorage
    try {
      const request = indexedDB.open('zor-offline-db', 1);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['auth'], 'readonly');
        const store = transaction.objectStore('auth');
        const getRequest = store.get('currentUser');
        
        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };
        
        getRequest.onerror = () => {
          resolve(null);
        };
      };
      
      request.onerror = () => {
        resolve(null);
      };
    } catch (error) {
      resolve(null);
    }
  });
}

// Periodic background sync (every 30 minutes)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'START_BACKGROUND_SYNC') {
    // Register background sync
    self.registration.sync.register('background-sync')
      .then(() => {
        console.log('Background sync registered');
      })
      .catch(error => {
        console.error('Background sync registration failed:', error);
      });
  }
});

// Activate service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});