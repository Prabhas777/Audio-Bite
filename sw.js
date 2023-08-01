self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll([
        "/images/icon.png",
        "/images/no-song.png",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log(event);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
