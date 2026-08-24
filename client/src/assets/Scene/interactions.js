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
