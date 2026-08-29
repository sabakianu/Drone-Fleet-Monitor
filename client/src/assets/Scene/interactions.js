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
  const { getGlobe, onGeoClicked, isPicking, onCancelPick } = globeClick;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  let downX = 0;
  let downY = 0;

  const handlePointerDown = (event) => {
    downX = event.clientX;
    downY = event.clientY;
  };

  const dragged = (event) =>
    Math.hypot(event.clientX - downX, event.clientY - downY) >
    DRAG_TOLERANCE_PX;

  const aimAt = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
  };

  const handleClick = (event) => {
    if (isPicking?.()) {
      if (!dragged(event)) onCancelPick?.();
      return;
    }

    aimAt(event);

    const intersects = raycaster.intersectObjects(activeObjects, true);
    if (intersects.length > 0) onObjectClicked(intersects[0].object);
  };

  const handleContextMenu = (event) => {
    if (!isPicking?.()) return;

    event.preventDefault();
    if (dragged(event)) return;

    const globe = getGlobe?.();
    if (!globe || !onGeoClicked) return;

    aimAt(event);

    const hit = raycaster.intersectObject(globe, true)[0];
    if (!hit) return;

    const local = globe.worldToLocal(hit.point.clone());
    const { lat, lng } = globe.toGeoCoords(local);

    onGeoClicked({ latitude: lat, longitude: lng });
  };

  renderer.domElement.addEventListener("pointerdown", handlePointerDown);
  renderer.domElement.addEventListener("click", handleClick);
  renderer.domElement.addEventListener("contextmenu", handleContextMenu);

  return {
    cleanup: () => {
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("click", handleClick);
      renderer.domElement.removeEventListener("contextmenu", handleContextMenu);
    },
  };
}
