let consoleVisible = false; // État initial : masqué
let nbPositions = 0; // Nombre de positions chargées

function toggleConsole() {
    consoleVisible = !consoleVisible; // Inverse l'état

    const consoleOutput = document.getElementById('console-output');
    const showLatLon = document.getElementById('showLatLon');
    if (consoleOutput && showLatLon) {
        consoleOutput.style.display = consoleVisible ? "block" : "none";
        showLatLon.style.display = consoleVisible ? "none" : "block";
        console.log(`console mode: ${consoleVisible ? "ON" : "OFF"}`);
    } else {
        console.error("Element #console-output or #showLatLon not found!");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const camera = document.querySelector("#camera");
    const showLatLon = document.querySelector("#showLatLon");

    if (camera) {
        console.log("GPS Camera found");
        console.log("waiting for position updates...");
        camera.addEventListener("gps-camera-update-position", (event) => {
            console.log("gps-camera-update-position");
            nbPositions++; // Incrémente le compteur de positions
            if (event.detail.position) {
                const { latitude, longitude } = event.detail.position;
                console.log(`lat: ${latitude.toFixed(5)}, lon: ${longitude.toFixed(5)}, nb: ${nbPositions}`);

                // Affichage dans le paragraphe latlon
                showLatLon.textContent = `lat: ${latitude.toFixed(5)}, lon: ${longitude.toFixed(5)}, nb: ${nbPositions}`;
            }
        });
    } else {
        console.error("GPS Camera not found!");
    }
});

// Tableau pour stocker les messages
const messages = [];

// Fonction pour ajouter un message au tableau et mettre à jour la balise p
function logToParagraph(message) {
    // Ajouter le message au tableau
    messages.unshift(message);

    // Limiter le nombre de messages à 10
    if (messages.length > 10) {
        messages.pop();
    }

    // Mettre à jour la balise p avec les messages
    const consoleOutput = document.getElementById('console-output');
    consoleOutput.textContent = messages.join('\n');
}

// Remplacer console.log par notre fonction personnalisée
console.log = function (message) {
    logToParagraph(message);
};