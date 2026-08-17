/* Service worker: rende l'app apribile anche senza rete.
   CACHE_VERSION va incrementata a ogni pubblicazione (lo fa deploy.sh). */
const CACHE_VERSION = "orecchietta-v5";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];
/* librerie caricate su richiesta: scaricarle subito le rende disponibili offline,
   ma se una manca l'installazione non deve fallire */
const VENDOR = [
  "./vendor/zxing.min.js",
  "./vendor/tesseract/tesseract.min.js",
  "./vendor/tesseract/worker.min.js",
  "./vendor/tesseract/tesseract-core-lstm.wasm.js",
  "./vendor/tesseract/tesseract-core-simd-lstm.wasm.js",
  "./vendor/tesseract/ita.traineddata.gz"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c => c.addAll(SHELL).then(() => Promise.allSettled(VENDOR.map(f => c.add(f)))))
      .then(() => self.skipWaiting())
  );
});

/* le copertine scaricate dai cataloghi vivono in una cache a parte, che NON
   viene svuotata a ogni pubblicazione: sono immagini che non cambiano mai */
const CACHE_COPERTINE = "orecchietta-copertine";

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(n => n !== CACHE_VERSION && n !== CACHE_COPERTINE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

/* Rete prima (per prendere gli aggiornamenti), cache come rete di sicurezza. */
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  const esterna = new URL(e.request.url).origin !== self.location.origin;
  if(esterna){
    /* le copertine dei cataloghi non si possono scaricare via codice (niente CORS),
       ma tenerle in cache le rende visibili anche senza rete: qui si guarda prima
       in cache e si scarica solo se manca */
    if(e.request.destination === "image"){
      e.respondWith(
        caches.match(e.request).then(inCache => inCache || fetch(e.request).then(r => {
          const copia = r.clone();
          caches.open(CACHE_COPERTINE).then(c => c.put(e.request, copia)).catch(() => {});
          return r;
        }))
      );
    }
    /* tutto il resto (ricerche nei cataloghi) passa dritto: intercettarlo
       significherebbe, in caso di errore, restituire la pagina dell'app al posto
       della risposta e mandare in confusione la ricerca */
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copia = r.clone();
        caches.open(CACHE_VERSION).then(c => c.put(e.request, copia)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
