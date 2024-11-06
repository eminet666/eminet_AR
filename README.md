# eminet_AR
prémabule (sécurité) : nécessite le protocole https (ok avec github.io)

## 0. [AR detection less](./0_AR_detectionless/README.xx)
## 1. [AR Markers detection](./1_AR_markers/README.md)
## 2. [AR Image Tracking](./2_AR_image_tracking/README.md)
## 3. [AR Geolocalisation](./3_AR_geo/README.md)
<!-- # 1. [AR Markers detection](https://github.com/eminet666/eminet_AR/tree/master/1_AR_markers)
# 2. [AR Image Tracking](https://github.com/eminet666/eminet_AR/tree/master/2_AR_image_tracking) (Natural Feature Tracking or NFT)
# 3. [AR geolocalisation](https://github.com/eminet666/eminet_AR/tree/master/3_AR_geo) (GPS) -->

### AR (Augmented Reality) _ référence
[Accueil AR.js](https://github.com/AR-js-org)

0. AR.js documentation :
[github](https://github.com/AR-js-org/AR.js-Docs) ou
[online](https://ar-js-org.github.io/AR.js-Docs/)
1. [librairie AR.js](https://github.com/AR-js-org/AR.js)
2. [AR.js with HTML balises](https://github.com/AR-js-org/aframe)

### divers

#### rappels a-frame (AR en mode balises compatibles HTML)
[cours a-frame](https://aframe-course.glitch.me/index.html)
[doc:primitives](https://github.com/aframevr/aframe/tree/master/docs/primitives)
[doc:components](https://github.com/aframevr/aframe/tree/master/docs/components)
[site](https://aframe.io/)
[getting start](https://aframe.io/docs/1.0.0/introduction/)
[blog examples](https://aframe.io/blog/)
[components:superframe](https://github.com/supermedium/superframe)
[components:](https://www.npmjs.com/search?q=keywords:aframe&page=1&ranking=optimal)

notes : 
- aframe inspector : ctrl+alt+i
- console : ctrl+maj+i (pas installé par défaut sur safari)

#### three.js (AR en pur javascript)
[AR js 3Dlibrary](https://threejs.org/)

#### outils
- [test webcam](https://fr.webcamtests.com/)
- [test RTC webcam](https://test.webrtc.org/)

#### look at
* [base](https://eminet666.github.io/eminet_AR/x_tests/4_component_lookat/lookat_0_base.html) |
* [timer](https://eminet666.github.io/eminet_AR/x_tests/4_component_lookat/lookat_1_random.html)

#### temp
WebRTC (Web Real-Time Communication)= interface de programmation (API) JavaScript
WebXR (ex WebVR) : API javascript de rendu de scènes 3D en VR ou AR
[WebVR & WebRTC](https://webrtchacks.com/webrtc-meets-webvr/)

[tracking method : best](https://medium.com/arjs/ar-js-supports-tango-on-a-frame-too-2c098de4df34)

choix de camera sur Chrome : chrome://settings/content/camera

#### bugs
Webcam Error
Name: NotFoundError
Message: The object can not be found here.
