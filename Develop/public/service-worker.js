console.log("Hi from your service-worker.js file!");

const FILES_TO_CACHE = [
    "/",
    "/models/transaction.js",
    "/public/icons/icon-192x192.png",
    "/public/icons/icon-512x512.png",
    "/public/index.html",
    "/public/index.js",
    "/public/manisfest.webmanifest",
    "/public/service-worker.js",
    "/public/styles.css",
    "/public/routes/api.js",
    "/package.json",
    "/server.js",
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

//install
self.addEventListener("install", function(evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were pre-cached successfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", function(evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

//fetch
self.addEventListener("fetch", function(evt) {
    //cache successful requests to the API
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    //If the response was good, clone it and store it in the cache.
                    if (response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }

                    return response;
                })
                .catch(err => {
                    //Network request failed, try to get it from the cache.
                    return cache.match(evt.request);
                });
            }).catch(err => console.log(err))
        );

        return;
    }

    evt.respondWith(
        caches.match(evt.request).then(function(response) {
            return response || fetch(evt.request);
        })
    );
});

// // Initialize deferredPrompt for use later to show browser install prompt.
// let deferredPrompt;

// window.addEventListener('beforeinstallprompt', (e) => {
//   // Prevent the mini-infobar from appearing on mobile
//   e.preventDefault();
//   // Stash the event so it can be triggered later.
//   deferredPrompt = e;
//   // Update UI notify the user they can install the PWA
//   showInstallPromotion();
//   // Optionally, send analytics event that PWA install promo was shown.
//   console.log(`'beforeinstallprompt' event was fired.`);
// });