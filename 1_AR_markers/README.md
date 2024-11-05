# AR Markers detection
[example](https://github.com/AR-js-org/AR.js/tree/master/aframe/examples/marker-based)

Bonnes pratiques ([ref](https://medium.com/chialab-open-source/10-tips-to-enhance-your-ar-js-app-8b44c6faffca))
- utiliser des markers asymétriques
- utilisé en landscape (optimisé) (bugs en passant de l'un à l'autre
- changement d'échelle sur les 3 axes en même temps
- taille du marker (règle empirique : doit être reconnaissable pour l'oeil humain). Marker de 3cm2 fonctionne à 40-50 cm
- imprimer le marker (plus de difficultés sur écrans : effets de brillances, …)
- laisser un bord clair autour du cadre
favoriser le contraste (noir-blanc mieux que couleurs)
au moins être de la moitié de la largeur du cadre.
- logique d'événement :
quand le marker est trouvé ou perdu
evénements souris (clic, mouse avec le curseur)
- utiliser Safari sur iOS (problème accès webcam avec chrome _ bug google)
- resolution par défaut de la webcam (640x480px)
ex : pour changer en FullHD camera

`<a-scene embedded arjs=’sourceType: webcam; sourceWidth:1280; sourceHeight:960; displayWidth: 1280; displayHeight: 960;’>`


Square Markers - Patterns
1. [Markers Generator](https://jeromeetienne.github.io/AR.js/three.js/examples/marker-training/examples/generator.html)
2. [Arttoolkit Barcode _ collection](https://github.com/AR-js-org/artoolkit-barcode-markers-collection)
3. [Markers in QR codes](https://medium.com/chialab-open-source/how-to-deliver-ar-on-the-web-only-with-a-qr-code-e24b7b61f8cb)
