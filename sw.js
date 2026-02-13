const cacheName = 'gashi-family-v2'; // E rritëm versionin në v2
const assets = [
  './',
  './index.html',
  './family.css',
  './family.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js'
];

// Instalimi - Ruajtja e skedarëve në memorien e telefonit
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Duke ruajtur skedarët në cache...');
      return cache.addAll(assets);
    })
  );
});

// Aktivizimi - Fshirja e cache-it të vjetër nëse ndryshon versioni
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// Strategjia e marrjes së të dhënave
self.addEventListener('fetch', evt => {
  // Mos i bëj cache kërkesat e Firebase (Realtime Database)
  if (evt.request.url.includes('firebaseio.com') || evt.request.url.includes('googleapis.com')) {
    return; // Lejoje rrjetin ta kryejë punën direkt
  }

  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      // Ktheje nga cache nëse ekziston, përndryshe merre nga interneti
      return cacheRes || fetch(evt.request);
    })
  );
});
