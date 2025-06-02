const CACHE_NAME = 'local-assist-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js', // Global script, if any. Will cache even if 404 for now.
  '/manifest.json',
  // Add other important pages
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
  // Core assets
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
  // Consider adding other assets like a logo if they become available
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use {ignoreRequestModifications: true} if you encounter issues with addAll
        // For example, if requests are being modified by the browser (e.g. range requests)
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})))
          .catch(error => {
            console.error('Failed to cache URLs during install:', error);
            // Log which URLs failed, if possible
            urlsToCache.forEach(url => {
              fetch(url).then(res => { if(!res.ok) console.error(`Failed to fetch ${url}: ${res.status}`)})
                         .catch(err => console.error(`Fetch error for ${url}: ${err}`));
            });
          });
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                // Don't cache POST requests or other non-GET requests for now
                if (event.request.method === 'GET') {
                    cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      }
    )
  );
});

// Optional: Add an activate event listener to clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
