// ═══════════════════════════════════════════════════════
//  COMPOSANT 1 : smooth-gps
//  Lisse la position GPS par moyenne glissante circulaire
// ═══════════════════════════════════════════════════════
AFRAME.registerComponent('smooth-gps', {
    schema: {
        bufferSize: { type: 'int', default: 5 },   // nb de mesures à moyenner
        interval:   { type: 'int', default: 2000 } // maximumAge GPS en ms
    },

    init() {
        this.buffer  = [];
        this.watchId = null;
        this.startWatching();
    },

    startWatching() {
        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.onPosition(position),
            (err) => console.error('GPS error:', err),
            { enableHighAccuracy: true, maximumAge: this.data.interval }
        );
    },

    onPosition(position) {
        const { latitude, longitude } = position.coords;

        this.buffer.push({ latitude, longitude });
        if (this.buffer.length > this.data.bufferSize) this.buffer.shift();

        const avg = this.buffer.reduce(
            (acc, pos) => ({
                latitude:  acc.latitude  + pos.latitude  / this.buffer.length,
                longitude: acc.longitude + pos.longitude / this.buffer.length
            }),
            { latitude: 0, longitude: 0 }
        );

        this.el.setAttribute('gps-new-camera', {
            latitude:  avg.latitude,
            longitude: avg.longitude
        });

        console.log(`GPS lissé → lat: ${avg.latitude.toFixed(7)}, lon: ${avg.longitude.toFixed(7)}`);
    },

    remove() {
        if (this.watchId) navigator.geolocation.clearWatch(this.watchId);
    }
});


// ═══════════════════════════════════════════════════════
//  COMPOSANT 2 : gyro-orientation
//  Stabilise l'orientation de la caméra AR en lissant
//  le cap (alpha) issu de deviceorientation.
//
//  Pourquoi ? AR.js prend l'orientation brute du capteur,
//  très sensible aux micro-tremblements du magnétomètre.
//  On applique une moyenne circulaire sur le cap avant
//  de l'injecter dans la rotation de la caméra A-Frame.
// ═══════════════════════════════════════════════════════
AFRAME.registerComponent('gyro-orientation', {
    schema: {
        bufferSize: { type: 'int',   default: 8   }, // nb de mesures à lisser
        enabled:    { type: 'boolean', default: true }
    },

    init() {
        this.buffer      = [];
        this.lastAlpha   = null;
        this.bound       = this.onOrientation.bind(this);

        // iOS 13+ : demande de permission
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            // On attend un geste utilisateur — déclenché par le premier touch
            document.addEventListener('touchstart', () => {
                DeviceOrientationEvent.requestPermission()
                    .then(state => {
                        if (state === 'granted') this.startListening();
                        else console.warn('Orientation refusée (iOS)');
                    })
                    .catch(console.error);
            }, { once: true });
        } else {
            // Android et autres : direct
            this.startListening();
        }
    },

    startListening() {
        // deviceorientationabsolute = plus précis sur Android (nord absolu)
        // deviceorientation = fallback universel
        window.addEventListener('deviceorientationabsolute', this.bound, true);
        window.addEventListener('deviceorientation',         this.bound, true);
        console.log('gyro-orientation : écoute active');
    },

    onOrientation(e) {
        if (!this.data.enabled) return;

        // ── Récupération du cap selon la plateforme ──
        let heading = null;

        if (e.webkitCompassHeading != null) {
            // iOS : webkitCompassHeading = cap direct vers le nord magnétique
            heading = e.webkitCompassHeading;
        } else if (e.alpha != null) {
            // Android : alpha = rotation autour de Z, sens inverse du cap
            heading = (360 - e.alpha) % 360;
        }

        if (heading === null) return;

        // ── Lissage circulaire (évite les sauts 359°→1°) ──
        this.buffer.push(heading);
        if (this.buffer.length > this.data.bufferSize) this.buffer.shift();

        let sinSum = 0, cosSum = 0;
        this.buffer.forEach(h => {
            sinSum += Math.sin(h * Math.PI / 180);
            cosSum += Math.cos(h * Math.PI / 180);
        });
        const smoothed = (Math.atan2(sinSum, cosSum) * 180 / Math.PI + 360) % 360;

        // ── Application à la caméra A-Frame ──
        // On récupère la rotation actuelle et on ne modifie que le Y (cap)
        // pour ne pas interférer avec beta/gamma (inclinaison)
        const cam = this.el.object3D;
        if (cam) {
            // Convertit le cap en radians (sens trigonométrique)
            const yaw = THREE.MathUtils.degToRad(-smoothed);

            // Préserve l'inclinaison (pitch/roll) de la caméra
            const euler = new THREE.Euler().setFromQuaternion(cam.quaternion, 'YXZ');
            euler.y = yaw;
            cam.quaternion.setFromEuler(euler);
        }

        this.lastAlpha = smoothed;
        // console.log(`Gyro lissé → cap: ${smoothed.toFixed(1)}°`);
    },

    remove() {
        window.removeEventListener('deviceorientationabsolute', this.bound, true);
        window.removeEventListener('deviceorientation',         this.bound, true);
    }
});

// ═══════════════════════════════════════════════════════
//  COMPOSANT 3 : random-animator
//  Syntaxe simple pour faire jouer des animations d'un modèle 3D de manière aléatoire et continue.
//  Ex: random-animator="clips: anim1, anim2, anim3; minDelay: 500"
//  - clips : liste des noms d'animations à jouer (séparés par virgule)
//  - minDelay : délai minimum entre deux animations (en ms)
// ═══════════════════════════════════════════════════════
AFRAME.registerComponent('random-animator', {
    schema: {
        clips: { type: 'string', default: 'anim1, anim2, anim3' },
        minDelay: { type: 'number', default: 0 }   // délai mini entre deux animations (ms)
    },

    init() {
        this.clipList = this.data.clips.split(',').map(s => s.trim());
        this.lastClip = null;
        this.mixer = null;

        // Attend que le modèle GLB soit chargé
        this.el.addEventListener('model-loaded', () => {
            this.mixer = this.el.components['animation-mixer'];
            this.playRandom();
        });
    },

    // Choisit une animation différente de la précédente
    pickClip() {
        const others = this.clipList.filter(c => c !== this.lastClip);
        return others[Math.floor(Math.random() * others.length)];
    },

    playRandom() {
        const clip = this.pickClip();
        this.lastClip = clip;

        // Injecte le clip dans animation-mixer
        this.el.setAttribute('animation-mixer', {
            clip: clip,
            loop: 'once',
            clampWhenFinished: true
        });

        // Récupère la durée du clip pour enchaîner
        this.el.addEventListener('animation-finished', () => {
            setTimeout(() => this.playRandom(), this.data.minDelay);
        }, { once: true });

        console.log(`random-animator → ${clip}`);
    }
});

// ═══════════════════════════════════════════════════════
//  COMPOSANT 4 : sync-animator-master
//  Permet de synchroniser l'animation de plusieurs entités à partir d'un "chef d'orchestre".    
//  Syntaxe : sync-animator-master="clips: anim1, anim2; targets: id1, id2, id3; minDelay: 500"
//  - clips : liste des noms d'animations à jouer (séparés par virgule)
//  - targets : liste des ids des entités à animer (séparés par virgule)
//  - minDelay : délai minimum entre deux animations (en ms)
// ═══════════════════════════════════════════════════════

// ─── Chef d'orchestre : choisit le clip et prévient les autres ───
    AFRAME.registerComponent('sync-animator-master', {
        schema: {
        clips: {type: 'string', default: 'pas_01,pas_02,pas_03,pas_04,pas_05' },
    targets: {type: 'string', default: '' },  // ids séparés par virgule ex: "danseur1,danseur2,danseur3"
    minDelay: {type: 'number', default: 0 }
    },

    init() {
        this.clipList = this.data.clips.split(',').map(s => s.trim());
        this.targetIds = this.data.targets.split(',').map(s => s.trim());
    this.lastClip = null;

        // Attend que CE modèle soit chargé avant de démarrer
        this.el.addEventListener('model-loaded', () => this.playSync());
    },

    pickClip() {
        const others = this.clipList.filter(c => c !== this.lastClip);
    return others[Math.floor(Math.random() * others.length)];
    },

    playSync() {
        const clip = this.pickClip();
    this.lastClip = clip;

        // Applique le clip sur tous les targets (y compris lui-même)
        this.targetIds.forEach(id => {
            const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('animation-mixer', {
        clip: clip,
    loop: 'once',
    clampWhenFinished: true
            });
        });

    console.log(`sync-animator → ${clip}`);

        // Enchaîne sur l'événement du master uniquement
        this.el.addEventListener('animation-finished', () => {
            setTimeout(() => this.playSync(), this.data.minDelay);
        }, { once: true });
    }
});
