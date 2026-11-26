// Service Worker for Budapest Trip 2026 💜
const CACHE_NAME = 'budapest-trip-v23';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './app.js',
  './manifest.json',
  './images/favicon.png',
  './images/apple-touch-icon.png',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/icon-512-maskable.png',
  './images/og-banner.jpg',
  './images/og-banner.png',
  './images/casati-1.jpg',
  './images/casati-2.jpg',
  './images/cortile-pool.jpg',
  './images/vorosmarty-xmas.jpg',
  './images/basilica-xmas.jpg',
  './images/basilica-dome.jpg',
  './images/gellert-hill.jpg',
  './images/danube-cruise.jpg',
  './images/szechenyi-baths.jpg',
  './images/fishermans-bastion.jpg',
  './images/ice-rink.jpg',
  './images/budapest-eye.jpg',
  './images/lam-light-art.jpg',
  './images/sweets-selfies.jpg',
  './images/flashkart.jpg',
  './images/escooter.jpg',
  './images/budapest-variete.jpg',
  './images/orfeum.jpg',
  './images/garden-of-lights.jpg',
  './images/godollo-1.jpg',
  './images/godollo-2.jpg',
  './images/godollo-3.jpg',
  './images/godollo-4.jpg',
  './images/menza.jpg',
  './images/pampas.jpg',
  './images/la-pampa.jpg',
  './images/beerstro14.jpg',
  './images/forsale-front.jpg',
  './images/forsale-interior.jpg',
  './images/forsale-notes.jpg',
  './images/bamba-marha.jpg',
  './images/aleli-pasta.jpg',
  './images/the-magic.jpg',
  './images/art-of-sushi.jpg',
  './images/newyork-cafe.jpg',
  './images/cookie-beacon.jpg',
  './images/ruszwurm.jpg',
  './images/gelato-rosa.jpg',
  './images/pizzica.jpg',
  './images/best-bagel.jpg',
  './images/mcdonalds-nyugati.jpg',
  './images/kfc-chicken.jpg',
  './images/langos.jpg',
  './images/goulash.jpg',
  './images/kurtoskalacs.jpg',
  './images/beef-bone.jpg',
  './images/somloi-galuska.jpg',
  './images/dobostorta.jpg',
  './images/turogomboc.jpg',
  './images/hortobagyi-palacsinta.jpg',
  './images/halaszle.jpg',
  './images/paprikas-csirke.jpg',
  './images/hot-stone.jpg',
  './images/smash-burger.jpg',
  './images/gordon-ramsay.jpg',
  './images/smashy-burger.jpg',
  './images/pizza-slice.jpg',
  './images/bar-szimpla.jpg',
  './images/bar-boutiq.jpg',
  './images/bar-360.jpg',
  './images/bar-highnote.jpg',
  './images/bar-twentysix.jpg',
  './images/bar-tuktuk.jpg',
  './images/shop-westend.jpg',
  './images/shop-arena.jpg',
  './images/shop-etele.jpg',
  './images/shop-premier.jpg',
  './images/shop-vaci.jpg',
  './images/shop-andrassy.jpg',
  './images/shop-halfprice.jpg',
  './images/shop-market-hall.jpg',
  './images/tax-free-banner.jpg',
  './images/zing-burger.jpg',
  './images/eggdrop.jpg',
  './images/massage.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching all trip assets and images');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Code files (HTML/JS/CSS/JSON) = network first, so updates always show up.
// Images = cache first (fast + offline). Offline fallback = cache.
function isCodeRequest(req) {
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return false;
  return req.mode === 'navigate' || /\.(html|js|css|json)$/.test(url.pathname) || url.pathname.endsWith('/');
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const req = event.request;

  if (isCodeRequest(req)) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() =>
        caches.match(req, { ignoreSearch: true }).then((cached) =>
          cached || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)
        )
      )
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
