// Migrent Service Worker - push notifications only.
//
// It used to precache "/" and two old dashboard pages (which now redirect,
// so the install could fail and retry on every visit) and to intercept every
// page navigation just to pass it through. A fetch handler makes the browser
// start this worker before each navigation, which slows every page for an
// offline fallback almost nobody saw. It now handles push and nothing else,
// and clears the caches the old version left behind.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "Migrent", body: "You have a new update", url: "/" };

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
