const CACHE_NAME = "indic-letters-cache-v3.3";
// Note: External CDN resources (like perfect-freehand) are not cached in service worker
// to ensure they always load from their origin and have proper versioning

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "./",
        "./manifest.json",
        "./index.html",
        "./language.html",
        "./privacy.html",
        "./terms.html",
        "./assets/favicon.png",
        "./assets/icon-192.png",
        "./assets/icon-512.png",
        "./css/base.css",
        "./css/components.css",
        "./css/layout.css",
        "./css/modern-normalize.min.css",
        "./css/variables.css",
        "./css/writing-pad.css",
        "./js/language-loader.js",
        "./js/main.js",
        "./js/writing-pad.js",
        "./languages/kannada.json",
        "./languages/malayalam.json",
        "./languages/marathi.json",
        "./languages/odia.json",
        "./languages/tamil.json",
        "./languages/telugu.json",
      ]);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    }),
  );
});
