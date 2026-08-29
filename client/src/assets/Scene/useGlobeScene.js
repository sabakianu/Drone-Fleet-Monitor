import { useEffect, useRef } from "react";
import * as THREE from "three";
import { fetchDrones, fetchBases } from "../api.js";
import {
  createCamera,
  createControls,
  createRenderer,
  setupResize,
  animate,
} from "./renderer.js";
import { setupGlobeScene, setupGlobeRotation } from "./globe.js";
import { spawnDrone, spawnBase } from "./markers.js";
import { setupHover, setupClick } from "./interactions.js";

export default function useGlobeScene({
  objectsRef,
  globeRef,
  onSelectDrone,
  onSelectBase,
  onGlobeClick,
  picking,
  onCancelPick,
}) {
  const mountRef = useRef(null);

  const selectRef = useRef(null);
  selectRef.current = {
    onSelectDrone,
    onSelectBase,
    onGlobeClick,
    picking,
    onCancelPick,
  };

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

    let disposed = false;

    const objects = objectsRef.current;
    objects.length = 0;

    const hoverManager = setupHover(camera, renderer, objects);
    const clickManager = setupClick(
      camera,
      renderer,
      objects,
      (clickedObject) => {
        if (clickedObject.userData.type === "drone") {
          selectRef.current.onSelectDrone(clickedObject.userData.drone);
        } else if (clickedObject.userData.type === "base") {
          selectRef.current.onSelectBase(clickedObject.userData.droneBase);
        }
      },
      {
        getGlobe: () => globeRef.current,
        onGeoClicked: (geo) => selectRef.current.onGlobeClick?.(geo),
        isPicking: () => selectRef.current.picking,
        onCancelPick: () => selectRef.current.onCancelPick?.(),
      },
    );

    const stopAnimation = animate(
      renderer,
      controls,
      scene,
      camera,
      hoverManager.updateHover,
    );

    Promise.all([setupGlobeScene(scene), fetchDrones(), fetchBases()])
      .then(([globe, droneList, baseList]) => {
        if (disposed) return;

        globeRef.current = globe;
        setupGlobeRotation(globe, renderer);
        resizeManager.setGlobe(globe);

        droneList
          .filter((d) => !d.isInBase)
          .forEach((d) => spawnDrone(globe, d, objects));

        baseList.forEach((b) => spawnBase(globe, b, objects));
      })
      .catch((err) => console.error("failed to load fleet:", err));

    return () => {
      disposed = true;
      globeRef.current = null;
      stopAnimation();
      resizeManager.cleanup();
      hoverManager.cleanup();
      clickManager.cleanup();

      if (
        mountRef.current &&
        renderer.domElement &&
        mountRef.current.contains(renderer.domElement)
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [objectsRef, globeRef]);

  return mountRef;
}
