// load and update positions from a JSON file
// This script loads a JSON file containing GPS positions and updates the camera and entities in the A-Frame scene.

        let positionsData = {};
        let isDataLoaded = false;

        async function loadPositions(file) {
            try {
                const response = await fetch(file);
                positionsData = await response.json();
                isDataLoaded = true;
                console.log("Positions JSON chargé avec succès");
                console.log("Lecture du fichier JSON:");
                Object.entries(positionsData.entities).forEach(([id, entity]) => {
                    console.log(`${id} : lat=${entity.latitude}, lon=${entity.longitude}`);
                });
                updatePositions();
            } catch (error) {
                console.error("Erreur lors du chargement du fichier JSON:", error);
            }
        }

        function updatePositions() {
            if (!isDataLoaded) {
                console.error("Les données GPS ne sont pas encore chargées.");
                return;
            }

            // Vérification et mise à jour de la caméra
            // const camera = document.querySelector('#camera');
            // if (camera && positionsData.camera) {
            //     camera.setAttribute('gps-new-camera', {
            //         gpsTimeInterval: 5000,
            //         simulateLatitude: positionsData.camera.latitude,
            //         simulateLongitude: positionsData.camera.longitude
            //     }, true);
            //     console.log(`Caméra mise à jour: lat=${positionsData.camera.latitude}, lon=${positionsData.camera.longitude}`);
            // } else {
            //     console.error("La caméra n'a pas été trouvée ou les données GPS de la caméra sont absentes.");
            // }

            // Vérification et mise à jour des entités
            Object.entries(positionsData.entities).forEach(([id, entityData]) => {
                const entity = document.querySelector(`#${id}`);
                if (entity) {
                    entity.setAttribute('gps-new-entity-place', {
                        latitude: entityData.latitude,
                        longitude: entityData.longitude
                    }, true);

                    // tests
                    // entity.setAttribute('material', 'color', 'yellow');
                    // entity.setAttribute('position', { x: 1, y: 2, z: 3 });
                    // entity.setAttribute('rotation', { x: 90, y: 90, z: 90 });

                    // Affichage dans la console des attributs de l'entité
                    // console.log(`Attributs de l'entité ${id}:`);
                    // console.log(`GPS Place: `, entity.getAttribute('gps-new-entity-place')); 
                    // console.log(`Rotation: `, entity.getAttribute('rotation'));
                    // console.log(`Couleur: `, entity.getAttribute('material').color);
                    // console.log(`Position GPS: lat=${entityData.latitude}, lon=${entityData.longitude}`);

                    console.log(`Position mise à jour pour ${id}: lat=${entityData.latitude}, lon=${entityData.longitude}`);
                    // A CORRIGER console.log(`Attributs de l'entité ${id}: ${entityData}`);
                } else {
                    console.error(`L'entité avec l'ID '${id}' n'a pas été trouvée.`);
                }
            });
        }