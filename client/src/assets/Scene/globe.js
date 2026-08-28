import * as THREE from "three";
import ThreeGlobe from "three-globe";
import * as topojson from "topojson-client";

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

  globe.position.set(0, 0, 0);
  return globe;
}

export function setupGlobeRotation(globe, renderer) {
  let isDragging = false;
  let previousX = 0;
  let previousY = 0;

  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (event.button === 0) {
      stopCentering();
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
}

const CENTER_DURATION_MS = 600;

let centerFrameId = null;

function stopCentering() {
  if (centerFrameId === null) return;

  cancelAnimationFrame(centerFrameId);
  centerFrameId = null;
}

function shortestDelta(from, to) {
  let delta = (to - from) % (Math.PI * 2);

  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;

  return delta;
}

export function centerGlobeOn(globe, { latitude, longitude }) {
  stopCentering();

  const fromX = globe.rotation.x;
  const fromY = globe.rotation.y;

  const deltaX = shortestDelta(fromX, THREE.MathUtils.degToRad(latitude));
  const deltaY = shortestDelta(fromY, THREE.MathUtils.degToRad(-longitude));

  const start = performance.now();

  const step = () => {
    const progress = Math.min(
      (performance.now() - start) / CENTER_DURATION_MS,
      1,
    );
    const eased = 1 - (1 - progress) ** 3;

    globe.rotation.x = fromX + deltaX * eased;
    globe.rotation.y = fromY + deltaY * eased;

    centerFrameId = progress < 1 ? requestAnimationFrame(step) : null;
  };

  step();
}

export async function setupGlobeScene(scene) {
  const countries = await getCountries();

  const globe = createGlobe(countries);

  scene.add(globe);

  return globe;
}
