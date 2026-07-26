import { useEffect, useRef } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as topojson from "topojson-client";

function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  camera.position.z = 5;

  return camera;
}

function createRenderer() {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);

  return renderer;
}
// Animație
function animate(renderer, controls, scene, camera) {
  function loop() {
    requestAnimationFrame(loop);

    controls.update();

    renderer.render(scene, camera);
  }

  loop();
}

async function getCountries() {
  const response = await fetch(
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
  );

  const world = await response.json();

  const countries = topojson.feature(world, world.objects.countries);

  return countries.features;
}

function createGlobe(countries) {
  const globe = new ThreeGlobe()
    .globeMaterial(
      new THREE.MeshBasicMaterial({
        color: "#c7d5dd",
        transparent: true,
        opacity: 0.9,
      }),
    )
    .polygonsData(countries)
    .polygonCapColor(() => "#d9d9d9")
    .polygonSideColor(() => "#b0b0b0")
    .polygonStrokeColor(() => "#ffffff")
    .polygonAltitude(0.01);

  globe.position.set(0, 0, -170);
  return globe;
}

async function start(mountRef, scene) {
  const countries = await getCountries();

  const globe = createGlobe(countries);

  scene.add(globe);

  return globe;
}

export default function App() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f5f5f5");

    const camera = createCamera();
    const renderer = createRenderer();

    mountRef.current.appendChild(renderer.domElement);

    renderer.render(scene, camera);

    // Controale
    const controls = new OrbitControls(camera, renderer.domElement);

    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.enableRotate = false;

    let isDragging = false;
    let previousX = 0;
    let previousY = 0;

    animate(renderer, controls, scene, camera);
    start(mountRef, scene).then((globe) => {
      renderer.domElement.addEventListener("pointerdown", (event) => {
        if (event.button === 0) {
          isDragging = true;
          previousX = event.clientX;
          previousY = event.clientY;
        }
      });

      renderer.domElement.addEventListener("pointermove", (event) => {
        if (!isDragging) return;

        const deltaX = event.clientX - previousX;
        const deltaY = event.clientY - previousY;

        globe.rotation.y += deltaX * 0.005;
        globe.rotation.x += deltaY * 0.005;

        previousX = event.clientX;
        previousY = event.clientY;
      });

      renderer.domElement.addEventListener("pointerup", () => {
        isDragging = false;
      });
    });
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}
