
let debugVisible = true; // État initial : affiché

function toggleDebug() {
    debugVisible = !debugVisible; // Inverse l'état

    const debugElement = document.getElementById('debug-info');
    if (debugElement) {
        debugElement.style.display = debugVisible ? "block" : "none";
        console.log(`Debug mode: ${debugVisible ? "ON" : "OFF"}`);
    } else {
        console.error("Element #debug-info not found!");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const camera = document.querySelector("#camera");
    const debugLatLon = document.querySelector("#debugLatLon");

    if (camera) {
        console.log("GPS Camera found, waiting for position updates...");
        camera.addEventListener("gps-camera-update-position", (event) => {
            if (event.detail.position) {
                const { latitude, longitude } = event.detail.position;
                // console.log(`lat: ${latitude.toFixed(5)}, lon: ${longitude.toFixed(5)}`);

                // Affichage dans le paragraphe latlon
                debugLatLon.textContent = `lat: ${latitude.toFixed(5)}, lon: ${longitude.toFixed(5)}`;
            }
        });
    } else {
        console.error("GPS Camera not found!");
    }
});
