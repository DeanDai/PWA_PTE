let cacheName = 'pteA';
let dataCacheName = 'pteData';

let filesCacheList = [
    '/',
    '/index.html',
    '/scripts/app.js',
    '/styles/main.css'
];

// Install
/**
 * skipWaiting作用是在新的sw注册安装后，使其立即生效
 */
self.addEventListener('install', e => {
    console.log('[ServiceWorker Install');
    e.waitUntil(
        caches.open(cacheName)
        .then(cache => {
            console.log('[ServiceWorker] Caching app shell');
            cache.addAll(filesCacheList);
        })
        .then(() => {
            self.skipWaiting()
        })
    );
});

/**
 * 当sw更新时，出发新的sw install. 此时需要手动清除旧sw的缓存，新的sw才会从waiting状态变成work状态
 */
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(key => {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function (e) {
    console.log('[Service Worker] Fetch', e.request.url);
    var dataUrl = 'https://ptestudy.com/pteadmin/api/question/questionResNovalid.php';
    if (e.request.url.indexOf(dataUrl) > -1) {
        /*
         * When the request URL contains dataUrl, the app is asking for fresh
         * weather data. In this case, the service worker always goes to the
         * network and then caches the response. This is called the "Cache then
         * network" strategy:
         * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
         */
        e.respondWith(
            caches.open(dataCacheName).then(cache => {
                return fetch(e.request).then(response => {
                    cache.put(e.request.url, response.clone());
                    return response;
                });
            })
        );
    } else {
        /*
         * The app is asking for app shell files. In this scenario the app uses the
         * "Cache, falling back to the network" offline strategy:
         * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
         */
        e.respondWith(
            caches.match(e.request).then(response => {
                return response || fetch(e.request);
            })
        );
    }
});