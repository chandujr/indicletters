const CACHE_NAME = "indic-varnamala-cache-v1.1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "./",
        "./manifest.json",
        "./index.html",
        "./language.html",
        "./assets/icon-192.png",
        "./assets/icon-512.png",
        "./css/base.css",
        "./css/components.css",
        "./css/layout.css",
        "./css/variables.css",
        "./js/language-loader.js",
        "./js/main.js",
        "./languages/kannada.json",
        "./languages/malayalam.json",
        "./languages/tamil.json",
      ]);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
