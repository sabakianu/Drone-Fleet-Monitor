import * as THREE from "three";
import droneIcon from "../Icons/Drone.png";
import baseIcon from "../Icons/DroneBase.png";
import moveTargetIcon from "../Icons/MoveTarget.png";

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

export function removeBaseMesh(objectsArray, baseId) {
  const baseMesh = findBaseMesh(objectsArray, baseId);
  if (!baseMesh) return;

  objectsArray.splice(objectsArray.indexOf(baseMesh), 1);
  baseMesh.parent?.remove(baseMesh);
  baseMesh.material.map?.dispose();
  baseMesh.material.dispose();
  // spre deosebire de sprite, PlaneGeometry e a lui -> o eliberăm
  baseMesh.geometry.dispose();
}

let moveTargetTexture = null;

function getMoveTargetTexture() {
  moveTargetTexture ??= new THREE.TextureLoader().load(moveTargetIcon);
  return moveTargetTexture;
}

const ARC_SEGMENTS = 64;
const ARC_ALTITUDE = 0.04;

function unitVector(globe, latitude, longitude) {
  const { x, y, z } = globe.getCoords(latitude, longitude, 0);
  return new THREE.Vector3(x, y, z).normalize();
}

function arcPoints(globe, from, to) {
  const start = unitVector(globe, from.latitude, from.longitude);
  const end = unitVector(globe, to.latitude, to.longitude);
  const radius = globe.getGlobeRadius() * (1 + ARC_ALTITUDE);

  return Array.from({ length: ARC_SEGMENTS + 1 }, (_, index) =>
    start
      .clone()
      .lerp(end, index / ARC_SEGMENTS)
      .normalize()
      .multiplyScalar(radius),
  );
}

export function spawnGlobeMarker(globe, destination, origin = null) {
  const group = new THREE.Group();

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: getMoveTargetTexture(),
      transparent: true,
    }),
  );
  sprite.scale.set(2, 2, 1);

  const coords = globe.getCoords(
    destination.latitude,
    destination.longitude,
    ARC_ALTITUDE,
  );
  sprite.position.set(coords.x, coords.y, coords.z);
  group.add(sprite);

  if (origin) {
    const geometry = new THREE.BufferGeometry().setFromPoints(
      arcPoints(globe, origin, destination),
    );
    const material = new THREE.LineDashedMaterial({
      color: "#6a6d9b",
      dashSize: 2,
      gapSize: 1.5,
    });

    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    group.add(line);
  }

  globe.add(group);

  return group;
}

export function removeGlobeMarker(globe, group) {
  globe.remove(group);

  group.traverse((child) => {
    child.geometry?.dispose();
    child.material?.dispose();
  });
}
