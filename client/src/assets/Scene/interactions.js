import * as THREE from "three";

export function setupHover(camera, renderer, objectsArray) {
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

const DRAG_TOLERANCE_PX = 5;

export function setupClick(
  camera,
  renderer,
  activeObjects,
  onObjectClicked,
  globeClick = {},
) {
  const { getGlobe, onGeoClicked } = globeClick;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // rotirea globului se face prin drag, iar dragul se termina cu un click:
  // retinem de unde a plecat, ca sa nu confundam o rotire cu o alegere
  let downX = 0;
  let downY = 0;

  const handlePointerDown = (event) => {
    downX = event.clientX;
    downY = event.clientY;
  };

  const handleClick = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(activeObjects, true);

    if (intersects.length > 0) {
      onObjectClicked(intersects[0].object);
      return;
    }

    const globe = getGlobe?.();
    if (!globe || !onGeoClicked) return;

    const dragged =
      Math.hypot(event.clientX - downX, event.clientY - downY) >
      DRAG_TOLERANCE_PX;
    if (dragged) return;

    const hit = raycaster.intersectObject(globe, true)[0];
    if (!hit) return;

    // globul e rotit, deci punctul din scena trebuie adus in spatiul lui
    const local = globe.worldToLocal(hit.point.clone());
    const { lat, lng } = globe.toGeoCoords(local);

    onGeoClicked({ latitude: lat, longitude: lng });
  };

  renderer.domElement.addEventListener("pointerdown", handlePointerDown);
  renderer.domElement.addEventListener("click", handleClick);

  return {
    cleanup: () => {
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("click", handleClick);
    },
  };
}
