const APP_VERSION = 'v1';
const APP_SHELL_CACHE = `dr-app-shell-${APP_VERSION}`;
const RUNTIME_CACHE = `dr-runtime-${APP_VERSION}`;
const BASE = '/daily-record';

const APP_SHELL = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.webmanifest`,
  `${BASE}/favicon.ico`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => ![APP_SHELL_CACHE, RUNTIME_CACHE].includes(k)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Helper: classify requests
function isMarkdown(request) {
  return request.url.includes(`${BASE}/records/`) && request.url.endsWith('.md');
}

function isImage(request) {
  return /(\.png|\.jpg|\.jpeg|\.webp|\.gif|\.svg)$/i.test(new URL(request.url).pathname);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // SPA navigation fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(`${BASE}/index.html`))
    );
    return;
  }

  // Markdown: Stale-While-Revalidate
  if (isMarkdown(request)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Images: Cache First
  if (isImage(request)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }
});


