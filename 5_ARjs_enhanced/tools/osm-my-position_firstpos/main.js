// https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html

// données
// TOURS
let somePlaces = [
  { lonlat:[0.71318, 47.40953] }
]


let firstGPSPosition = null;
let gpsPositions = []; // Stocker toutes les mesures GPS
let map = null;
let markers = null;

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

  for (let place of somePlaces) {
    let position = new OpenLayers.LonLat(...place.lonlat).transform(fromProjection, toProjection);
    let redIcon = new OpenLayers.Icon('./img/marker-red.png', new OpenLayers.Size(21,25), new OpenLayers.Pixel(-10, -25));
    markers.addMarker(new OpenLayers.Marker(position, redIcon));
  }
}

function followUser({ fromProjection, toProjection }) {
  function success(pos) {
    let { longitude, latitude } = pos.coords;
    console.log(`user position: (${longitude.toFixed(5)}, ${latitude.toFixed(5)})`);

    let gpsinfo = document.getElementById("gps");
    gpsinfo.textContent = `lon : ${longitude.toFixed(5)}, lat : ${latitude.toFixed(5)}, ${gpsPositions.length + 1}`;

    let size = new OpenLayers.Size(21,25);
    let offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
    let position = new OpenLayers.LonLat(longitude, latitude).transform(fromProjection, toProjection);
    
    if (!firstGPSPosition) {
      firstGPSPosition = [longitude, latitude];
      initMap(firstGPSPosition); // Initialiser la carte après la première position GPS
      let blueIcon = new OpenLayers.Icon('./img/marker-blue.png', size, offset);
      markers.addMarker(new OpenLayers.Marker(position, blueIcon));
    } else {
      gpsPositions.push([longitude, latitude]); // Ajoute aux positions GPS
      let greenIcon = new OpenLayers.Icon('./img/marker-green.png', size, offset);
      markers.addMarker(new OpenLayers.Marker(position, greenIcon));
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

followUser({
  fromProjection: new OpenLayers.Projection("EPSG:4326"),
  toProjection: new OpenLayers.Projection("EPSG:900913"),
});
