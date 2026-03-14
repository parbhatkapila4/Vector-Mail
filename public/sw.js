const CACHE_NAME = "vectormail-v3";
const OFFLINE_URL = "/offline.html";

function shouldSkipCache(url) {
  try {
    const path = new URL(url).pathname;
    return (
      path.startsWith("/api/") ||
      path.startsWith("/trpc/") ||
      path.includes("sync") ||
      path.startsWith("/_next/") ||
      path === "/sw.js" ||
      path === "/manifest.json"
    );
  } catch {
    return true;
  }
}

function safeCachePut(request, response) {
  if (response.status !== 200 || (response.type !== "basic" && response.type !== "cors"))
    return Promise.resolve();
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.put(request, response).catch(function () {
    });
  });
}

self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) {
          return k !== CACHE_NAME;
        }).map(function (k) {
          return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.mode !== "navigate" && event.request.method !== "GET") return;
  if (shouldSkipCache(event.request.url)) return;

  var origin = self.location.origin;
  if (!event.request.url.startsWith(origin)) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(function (res) {
          var copy = res.clone();
          if (res.ok && res.status === 200 && (res.type === "basic" || res.type === "cors"))
            safeCachePut(event.request, copy);
          return res;
        })
        .catch(function () {
          return caches.match(event.request).then(function (cached) {
            return cached || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function (res) {
        var copy = res.clone();
        if (res.status === 200 && (res.type === "basic" || res.type === "cors"))
          safeCachePut(event.request, copy);
        return res;
      })
      .catch(function () {
        return caches.match(event.request);
      })
  );
});
