// https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html

// données
// TOURS
let somePlaces = [
  { lonlat:[47.40953, 0.71318] }
]

let firstGPSPosition = null;
let map = null;
let markers = null;
let addPlaces = [];
let markerColors = ["gold", "magenta", "cyan"];
let markerIndex = 0;
const maxMarkers = 3;

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

  map.events.register("click", map, function(event) {
    if (addPlaces.length < maxMarkers) {
      let lonlat = map.getLonLatFromViewPortPx(event.xy).transform(toProjection, fromProjection);
      addMarker(lonlat.lon, lonlat.lat);
    }
  });
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

function addMarker(lon, lat) {
  if (addPlaces.length >= maxMarkers) return;

  let fromProjection = new OpenLayers.Projection("EPSG:4326");
  let toProjection = new OpenLayers.Projection("EPSG:900913");
  let position = new OpenLayers.LonLat(lon, lat).transform(fromProjection, toProjection);
  
  let color = markerColors[markerIndex % markerColors.length];
  let icon = new OpenLayers.Icon(`./img/marker-${color}.png`, new OpenLayers.Size(21,25), new OpenLayers.Pixel(-10, -25));
  markers.addMarker(new OpenLayers.Marker(position, icon));

  addPlaces.push({ lon, lat, color });
  updateGpsInfo();

  markerIndex++;
}

function updateGpsInfo() {
  let gpsinfo = document.getElementById("gps");
  let infoText = `lon : ${firstGPSPosition[0].toFixed(6)}, lat : ${firstGPSPosition[1].toFixed(6)}<br>`;
  infoText += addPlaces.map(p => `lat: ${p.lat.toFixed(6)}, lon: ${p.lon.toFixed(6)}, couleur: ${p.color}`).join('<br>');
  gpsinfo.innerHTML = infoText;
}

followUser({
  fromProjection: new OpenLayers.Projection("EPSG:4326"),
  toProjection: new OpenLayers.Projection("EPSG:900913"),
});