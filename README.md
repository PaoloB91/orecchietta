# Orecchietta

App web personale per catalogare i libri letti: voto a stelle, diario di lettura (citazioni fotografate che diventano testo, più note personali) e punti chiave.

Si installa sull'iPhone da Safari: Condividi, poi "Aggiungi alla schermata Home".

## Note tecniche

- PWA autocontenuta: un solo `index.html`, nessun framework, nessuna CDN.
- OCR in-app con [Tesseract.js](https://github.com/naptha/tesseract.js) (lingua italiana), lettore di codici a barre con [ZXing](https://github.com/zxing-js/library): entrambi inclusi in `vendor/`, funzionano offline.
- I dati (libri, foto, diario) restano nel dispositivo (IndexedDB). Questo repository contiene solo l'app, mai contenuti personali.
- Cataloghi consultati in sola lettura per titolo, autore e copertina: Open Library e Google Books.
