import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as topojson from "topojson-client";
import droneIcon from "./assets/Drone.png";
import DronePanel from "./assets/Components/DronePanel.jsx";

function spawnDrone(globe, lat, lng, alt, dronesArray) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(droneIcon);

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    color: "#ffffff",
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3, 3, 1);

  const coords = globe.getCoords(lat, lng, alt);
  sprite.position.set(coords.x, coords.y, coords.z);

  globe.add(sprite);
  dronesArray.push(sprite);

  return sprite;
}

function setupHover(camera, renderer, dronesArray) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredDrone = null;

  const handlePointerMove = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  window.addEventListener("pointermove", handlePointerMove);

  const updateHover = () => {
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(dronesArray);

    if (hoveredDrone) {
      hoveredDrone.scale.set(3, 3, 1);
      renderer.domElement.style.cursor = "default";
      hoveredDrone = null;
    }

    if (intersects.length > 0) {
      hoveredDrone = intersects[0].object;
      hoveredDrone.scale.set(3.5, 3.5, 1);
      renderer.domElement.style.cursor = "pointer";
    }
  };

  return {
    updateHover,
    cleanup: () => window.removeEventListener("pointermove", handlePointerMove),
  };
}

export function setupClick(camera, renderer, activeDrones, onDroneClicked) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const handleClick = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(activeDrones, true);

    if (intersects.length > 0) {
      onDroneClicked(intersects[0].object);
    }
  };

  renderer.domElement.addEventListener("click", handleClick);

  return {
    cleanup: () => {
      renderer.domElement.removeEventListener("click", handleClick);
    },
  };
}

function createCamera(width, height) {
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

  camera.position.z = 200;

  return camera;
}

function createControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);

  controls.minDistance = 120;
  controls.maxDistance = 230;
  controls.enableRotate = false;
  controls.enablePan = false;
  controls.zoomSpeed = 1.5;

  return controls;
}

function createRenderer(width, height) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  renderer.setSize(width, height);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  return renderer;
}

function setupResize(camera, renderer) {
  let currentGlobe = null;

  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);

    const aspect = width / height;

    const baseScale = 0.85;

    const scaleFactor = aspect < 1 ? aspect * baseScale : baseScale;

    if (currentGlobe) {
      currentGlobe.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
  };

  window.addEventListener("resize", handleResize);
  handleResize();

  return {
    cleanup: () => window.removeEventListener("resize", handleResize),
    setGlobe: (globeInstance) => {
      currentGlobe = globeInstance;
      handleResize();
    },
  };
}

function animate(renderer, controls, scene, camera, onFrame) {
  let frameId;
  function loop() {
    frameId = requestAnimationFrame(loop);
    controls.update();

    if (onFrame) onFrame();

    renderer.render(scene, camera);
  }
  loop();

  return () => cancelAnimationFrame(frameId);
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

  globe.position.set(0, 0, 0);
  return globe;
}

function setupGlobeRotation(globe, renderer) {
  let isDragging = false;
  let previousX = 0;
  let previousY = 0;

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
}

async function setupGlobeScene(mountRef, scene) {
  const countries = await getCountries();

  const globe = createGlobe(countries);

  scene.add(globe);

  return globe;
}

export default function App() {
  const handleDroneClick = () => {
    setIsPanelOpen(true);
  };

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const mountRef = useRef(null);

  useEffect(() => {
    if (mountRef.current) {
      mountRef.current.innerHTML = "";
    }

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f5f5f5");
    const camera = createCamera(width, height);
    const renderer = createRenderer(width, height);

    mountRef.current.appendChild(renderer.domElement);

    renderer.render(scene, camera);

    const controls = createControls(camera, renderer);
    const resizeManager = setupResize(camera, renderer);

    const activeDrones = [];

    const hoverManager = setupHover(camera, renderer, activeDrones);
    const clickManager = setupClick(
      camera,
      renderer,
      activeDrones,
      (dronaLovita) => {
        setIsPanelOpen(true);
      },
    );

    const stopAnimation = animate(
      renderer,
      controls,
      scene,
      camera,
      hoverManager.updateHover,
    );

    setupGlobeScene(mountRef, scene).then((globe) => {
      setupGlobeRotation(globe, renderer);
      resizeManager.setGlobe(globe);
      spawnDrone(globe, 45.9432, 24.9668, 0.05, activeDrones); // ro
      spawnDrone(globe, 40.7128, -74.006, 0.05, activeDrones); // ny
    });

    return () => {
      stopAnimation();
      resizeManager.cleanup();
      hoverManager.cleanup();

      if (
        mountRef.current &&
        renderer.domElement &&
        mountRef.current.contains(renderer.domElement)
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative  w-screen h-screen overflow-hidden">
      <div ref={mountRef} className="absolute top-0 left-0 w-full h-full z-0" />
      {isPanelOpen && <DronePanel onClose={() => setIsPanelOpen(false)} />}
    </div>
  );
}
