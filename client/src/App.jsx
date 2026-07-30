import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as topojson from "topojson-client";
import droneIcon from "./assets/Drone.png";
import baseIcon from "./assets/DroneBase.png";
import DronePanel from "./assets/Components/DronePanel.jsx";
import BasePanel from "./assets/Components/BasePanel.jsx";

function spawnDrone(globe, lat, lng, alt, objectsArray) {
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

  sprite.userData = {
    type: "drone",
    name: "Reaper",
    baseScale: 3,
    hoverScale: 3.5,
  };
  globe.add(sprite);
  objectsArray.push(sprite);

  return sprite;
}

function spawnBase(globe, lat, lng, objectsArray) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(baseIcon);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    color: "#ffffff",
    side: THREE.DoubleSide,
  });

  const geometry = new THREE.PlaneGeometry(3, 3);
  const baseMesh = new THREE.Mesh(geometry, material);

  const coords = globe.getCoords(lat, lng, 0.01);
  baseMesh.position.set(coords.x, coords.y, coords.z);

  baseMesh.lookAt(0, 0, 0);

  baseMesh.userData = {
    type: "base",
    name: "Baza Militară",
    baseScale: 1,
    hoverScale: 1.2,
  };
  globe.add(baseMesh);
  objectsArray.push(baseMesh);

  return baseMesh;
}

function setupHover(camera, renderer, objectsArray) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredObject = null;

  const handlePointerMove = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  window.addEventListener("pointermove", handlePointerMove);

  const updateHover = () => {
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(objectsArray);

    if (hoveredObject) {
      hoveredObject.scale.set(
        hoveredObject.userData.baseScale,
        hoveredObject.userData.baseScale,
        1,
      );
      renderer.domElement.style.cursor = "default";
      hoveredObject = null;
    }

    if (intersects.length > 0) {
      hoveredObject = intersects[0].object;
      hoveredObject.scale.set(
        hoveredObject.userData.hoverScale,
        hoveredObject.userData.hoverScale,
        1,
      );
      renderer.domElement.style.cursor = "pointer";
    }
  };

  return {
    updateHover,
    cleanup: () => window.removeEventListener("pointermove", handlePointerMove),
  };
}

export function setupClick(camera, renderer, activeObjects, onObjectClicked) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const handleClick = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(activeObjects, true);

    if (intersects.length > 0) {
      onObjectClicked(intersects[0].object);
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
    setisDronePanelOpen(true);
  };

  const [isDronePanelOpen, setisDronePanelOpen] = useState(false);
  const [isBasePanelOpen, setisBasePanelOpen] = useState(false);
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

    const objects = [];

    const hoverManager = setupHover(camera, renderer, objects);
    const clickManager = setupClick(
      camera,
      renderer,
      objects,
      (clickedObject) => {
        if (clickedObject.userData.type === "drone") {
          setisDronePanelOpen(true);
        } else if (clickedObject.userData.type === "base") {
          setisBasePanelOpen(true);
        }
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
      spawnDrone(globe, 45.9432, 24.9668, 0.05, objects); // ro
      spawnDrone(globe, 40.7128, -74.006, 0.05, objects); // ny
      spawnBase(globe, 37.237, -115.808, objects); // Area 51, Nevada, SUA
      spawnBase(globe, 35.6762, 139.6503, objects); // Tokyo, Japonia
      spawnBase(globe, -33.8688, 151.2093, objects); // Sydney, Australia
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
      {isDronePanelOpen && (
        <DronePanel onClose={() => setisDronePanelOpen(false)} />
      )}

      {isBasePanelOpen && (
        <BasePanel
          onClose={() => setisBasePanelOpen(false)}
          onDroneClick={(selectedDrone) => {
            setisDronePanelOpen(true);
          }}
        />
      )}
    </div>
  );
}
