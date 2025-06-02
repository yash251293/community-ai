const CACHE_NAME = 'local-assist-v3'; // Ensure this is the same as used in activate for cleanup
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js', 
  '/nav.js', // Added nav.js
  '/manifest.json',
  '/login.html',
  '/signup.html',
  '/profile.html',
  '/requests.html',
  '/offers.html',
  '/matches.html',
  '/create_request.html',
  '/create_offer.html',
  '/map.html',
  '/chat.html',
  '/conversations.html', // Added conversations.html
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Ensures the new service worker activates immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Using 'reload' to bypass HTTP cache for these initial assets ensures fresh copies.
        const cachePromises = urlsToCache.map(urlToCache => {
          const request = new Request(urlToCache, {cache: 'reload'});
          return fetch(request).then(response => {
            if (response.ok) {
              return cache.put(request, response);
            }
            // Log non-critical asset caching failures but don't fail SW install
            console.warn(`Failed to cache ${urlToCache} during install: Status ${response.status}`);
            return Promise.resolve(); // Resolve so one failure doesn't stop all
          }).catch(error => {
            console.error(`Caching failed for ${urlToCache}: ${error}`);
            return Promise.resolve();
          });
        });
        return Promise.all(cachePromises);
      })
      .catch(error => {
        console.error('Failed to open cache during install:', error);
      })
  );
});

self.addEventListener('activate', event => {
  self.clients.claim(); // Allows the activated SW to take control of open clients immediately
  const cacheWhitelist = [CACHE_NAME]; // Current cache name
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    // For non-GET requests, just fetch from network.
    // Or handle differently if needed (e.g. Background Sync for POSTs)
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response that we want to cache
            // response.ok checks for status in the range 200-299
            // We also check type to avoid caching opaque responses for third-party assets if not careful,
            // but for same-origin resources, 'basic' is expected. 'cors' is for CORS-enabled cross-origin.
            if (!networkResponse || !networkResponse.ok || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
              return networkResponse; // Return non-cacheable response as is
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(cacheError => {
                // Log error but don't fail the network request for the user
                console.error('Failed to cache network response:', cacheError);
              });

            return networkResponse;
          }
        ).catch(error => {
          // Optional: Handle fetch errors, e.g. by returning a custom offline page
          // This is a basic example, so we'll just log the error and let the browser handle it
          console.error('Fetch failed; returning offline page or error for:', event.request.url, error);
          // Example: return caches.match('/offline.html'); (if you have an offline.html)
          // For now, just rethrow to let browser show its offline page
          // throw error; 
          // Or, to avoid breaking the page if a sub-resource fails,
          // return a synthetic error response, or nothing to let it fail naturally.
          // For API calls, this might result in app errors if not handled in client-side JS.
          // For main page navigations, this would show browser's offline.
        });
      })
  );
});
