import * as THREE from "three";
import droneIcon from "../Icons/Drone.png";
import baseIcon from "../Icons/DroneBase.png";

export function spawnDrone(globe, drone, objectsArray) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(droneIcon);

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    color: "#ffffff",
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3, 3, 1);

  const coords = globe.getCoords(
    drone.currentLocation.latitude,
    drone.currentLocation.longitude,
    0.05,
  );
  sprite.position.set(coords.x, coords.y, coords.z);

  sprite.userData = {
    type: "drone",
    drone,
    baseScale: 3,
    hoverScale: 3.5,
  };
  globe.add(sprite);
  objectsArray.push(sprite);

  return sprite;
}

export function spawnBase(globe, droneBase, objectsArray) {
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

  const coords = globe.getCoords(
    droneBase.currentLocation.latitude,
    droneBase.currentLocation.longitude,
    0.01,
  );
  baseMesh.position.set(coords.x, coords.y, coords.z);

  baseMesh.lookAt(0, 0, 0);

  baseMesh.userData = {
    type: "base",
    droneBase,
    baseScale: 1,
    hoverScale: 1.2,
  };
  globe.add(baseMesh);
  objectsArray.push(baseMesh);

  return baseMesh;
}

// dronele parcate în bază nu au sprite pe glob -> poate lipsi
export function findDroneSprite(objectsArray, droneId) {
  return objectsArray.find(
    (obj) => obj.userData.type === "drone" && obj.userData.drone.id === droneId,
  );
}

export function findBaseMesh(objectsArray, baseId) {
  return objectsArray.find(
    (obj) =>
      obj.userData.type === "base" && obj.userData.droneBase.id === baseId,
  );
}

// scoate sprite-ul din raycast, de pe glob, și eliberează textura de pe GPU
export function removeDroneSprite(objectsArray, droneId) {
  const sprite = findDroneSprite(objectsArray, droneId);
  if (!sprite) return;

  objectsArray.splice(objectsArray.indexOf(sprite), 1);
  sprite.parent?.remove(sprite);
  sprite.material.map?.dispose();
  sprite.material.dispose();
}
