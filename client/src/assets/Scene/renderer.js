import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function createCamera(width, height) {
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

  camera.position.z = 200;

  return camera;
}

export function createControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);

  controls.minDistance = 120;
  controls.maxDistance = 230;
  controls.enableRotate = false;
  controls.enablePan = false;
  controls.zoomSpeed = 1.5;

  return controls;
}

export function createRenderer(width, height) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  renderer.setSize(width, height);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  return renderer;
}

export function setupResize(camera, renderer) {
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

export function animate(renderer, controls, scene, camera, onFrame) {
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
