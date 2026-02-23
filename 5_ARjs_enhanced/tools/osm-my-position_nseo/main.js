// https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html

// données
// TOURS
let somePlaces = [
  { lonlat:[0.71318, 47.40953] }
]

let firstGPSPosition = null;
let map = null;
let markers = null;
let markerColors = ["gold", "magenta", "cyan"];
let markerIndex = 0;

function initMap(lonlat) {
  let url = [
    "https://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
    "https://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
    "https://c.tile.openstreetmap.org/${z}/${x}/${y}.png",
  ];

  map = new OpenLayers.Map("basicMap");
  let mapnik = new OpenLayers.Layer.OSM('lol', url);
  let fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
  let toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
  let position = new OpenLayers.LonLat(...lonlat).transform(fromProjection, toProjection);
  let zoom = 18;

  map.addLayer(mapnik);
  map.setCenter(position, zoom);

  markers = new OpenLayers.Layer.Markers("Markers");
  map.addLayer(markers);

  let blueIcon = new OpenLayers.Icon('./img/marker-blue.png', new OpenLayers.Size(21,25), new OpenLayers.Pixel(-10, -25));
  markers.addMarker(new OpenLayers.Marker(position, blueIcon));

  for (let place of somePlaces) {
    let position = new OpenLayers.LonLat(...place.lonlat).transform(fromProjection, toProjection);
    let redIcon = new OpenLayers.Icon('./img/marker-red.png', new OpenLayers.Size(21,25), new OpenLayers.Pixel(-10, -25));
    markers.addMarker(new OpenLayers.Marker(position, redIcon));
  }

  // Ajout des 4 nouvelles positions par rapport à la position initiale
  addNearbyPlaces(lonlat);

  updateGpsInfo();
}

function followUser({ fromProjection, toProjection }) {
  function success(pos) {
    let { longitude, latitude } = pos.coords;
    console.log(`user position: (${longitude.toFixed(6)}, ${latitude.toFixed(6)})`);

    if (!firstGPSPosition) {
      firstGPSPosition = [longitude, latitude];
      let initialPosition = somePlaces.length > 0 ? somePlaces[0].lonlat : firstGPSPosition;
      initMap(initialPosition);
      updateGpsInfo();
    }
  }

  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  const id = navigator.geolocation.watchPosition(success, error, options);
}

function addNearbyPlaces(lonlat) {
  // Calcul des 4 points à environ 10m au nord, est, sud, ouest
  const directions = [
    { lat: lonlat[1] + 0.0001, lon: lonlat[0], direction: "N" },
    { lat: lonlat[1], lon: lonlat[0] + 0.0001, direction: "E" },
    { lat: lonlat[1] - 0.0001, lon: lonlat[0], direction: "S" },
    { lat: lonlat[1], lon: lonlat[0] - 0.0001, direction: "O" }
  ];

  let infoText = `Init : lat: ${lonlat[1].toFixed(6)}, lon: ${lonlat[0].toFixed(6)}<br>`;

  // Affichage des points ajoutés avec les directions
  directions.forEach((place, index) => {
    let fromProjection = new OpenLayers.Projection("EPSG:4326");
    let toProjection = new OpenLayers.Projection("EPSG:900913");
    let position = new OpenLayers.LonLat(place.lon, place.lat).transform(fromProjection, toProjection);
    
    let goldIcon = new OpenLayers.Icon('./img/marker-gold.png', new OpenLayers.Size(21,25), new OpenLayers.Pixel(-10, -25));
    markers.addMarker(new OpenLayers.Marker(position, goldIcon));

    infoText += `${place.direction}: lat: ${place.lat.toFixed(6)}, lon: ${place.lon.toFixed(6)}<br>`;
  });

  // Mise à jour de l'info affichée dans le GPS
  let gpsinfo = document.getElementById("gps");
  gpsinfo.innerHTML = infoText;
}

function updateGpsInfo() {
  // Cette fonction est maintenant appelée après chaque ajout de places, donc inutile ici.
}

followUser({
  fromProjection: new OpenLayers.Projection("EPSG:4326"),
  toProjection: new OpenLayers.Projection("EPSG:900913"),
});
