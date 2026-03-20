// MigRent Service Worker - Push Notifications + Basic Offline Caching

const CACHE_NAME = "migrent-v1";
const OFFLINE_URLS = ["/", "/dashboard/seeker", "/dashboard/owner"];

// Install - cache basic shell pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - network first, fall back to cache for navigation
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request).then((r) => r || caches.match("/")))
    );
  }
});

// Push - show notification from FCM payload
self.addEventListener("push", (event) => {
  let data = { title: "MigRent", body: "You have a new update", url: "/" };

  if (event.data) {
    try {
      const payload = event.data.json();
      // FCM wraps data in notification or data keys
      if (payload.notification) {
        data.title = payload.notification.title || data.title;
        data.body = payload.notification.body || data.body;
      }
      if (payload.data) {
        data.url = payload.data.url || data.url;
      }
    } catch (e) {
      // If not JSON, use as plain text body
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    data: { url: data.url },
    vibrate: [100, 50, 100],
    actions: [{ action: "open", title: "Open" }],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click - open the relevant page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if possible
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(url);
    })
  );
});
