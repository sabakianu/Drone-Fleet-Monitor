import { useState } from "react";
import * as api from "./api.js";
import {
  spawnDrone,
  spawnBase,
  findDroneSprite,
  findBaseMesh,
  removeDroneSprite,
  removeBaseMesh,
} from "./Scene/markers.js";

// aliniaza panourile si globul cu rezultatul
export default function useFleet({ objectsRef, globeRef }) {
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [selectedBase, setSelectedBase] = useState(null);

  // sincronizează drona actualizată în panou, pe glob și în lista bazei
  const applyDroneUpdate = (updated) => {
    setSelectedDrone((current) =>
      current && current.id === updated.id ? updated : current,
    );

    const sprite = findDroneSprite(objectsRef.current, updated.id);
    if (sprite) sprite.userData.drone = updated;

    setSelectedBase((current) => {
      if (!current?.drones?.some((d) => d.id === updated.id)) return current;

      return {
        ...current,
        drones: current.drones.map((d) => (d.id === updated.id ? updated : d)),
      };
    });
  };

  // sincronizează baza actualizată în panou și pe glob
  const applyBaseUpdate = (updated) => {
    setSelectedBase((current) =>
      current && current.id === updated.id ? updated : current,
    );

    const baseMesh = findBaseMesh(objectsRef.current, updated.id);
    if (baseMesh) baseMesh.userData.droneBase = updated;
  };

  const refreshBases = async (...baseIds) => {
    const unique = [...new Set(baseIds.filter((id) => id != null))];

    for (const baseId of unique) {
      const refreshed = await api.fetchBase(baseId);

      const baseMesh = findBaseMesh(objectsRef.current, baseId);
      if (baseMesh) baseMesh.userData.droneBase = refreshed;

      setSelectedBase((current) =>
        current && current.id === baseId ? refreshed : current,
      );
    }
  };

  // reciteste flota si aliniaza sprite-urile de pe glob cu ce zice serverul:
  // sterge ce nu mai exista, adauga ce a decolat, actualizeaza restul
  const syncDronesFromServer = async () => {
    const drones = await api.fetchDrones();
    const byId = new Map(drones.map((d) => [d.id, d]));

    objectsRef.current
      .filter(
        (obj) =>
          obj.userData.type === "drone" && !byId.has(obj.userData.drone.id),
      )
      .forEach((obj) =>
        removeDroneSprite(objectsRef.current, obj.userData.drone.id),
      );

    drones.forEach((drone) => {
      const sprite = findDroneSprite(objectsRef.current, drone.id);

      // dronele parcate in baza nu se randeaza pe glob
      if (drone.isInBase) {
        if (sprite) removeDroneSprite(objectsRef.current, drone.id);
        return;
      }

      if (sprite) {
        sprite.userData.drone = drone;
      } else if (globeRef.current) {
        spawnDrone(globeRef.current, drone, objectsRef.current);
      }
    });

    setSelectedDrone((current) =>
      current ? (byId.get(current.id) ?? null) : current,
    );
  };

  const toggleDroneStatus = async (drone) => {
    const nextStatus = drone.status === "offline" ? "online" : "offline";
    applyDroneUpdate(await api.setDroneStatus(drone.id, nextStatus));
  };

  const renameDrone = async (drone, name) => {
    applyDroneUpdate(await api.setDroneName(drone.id, name));
  };

  const relocateDrone = async (drone, baseId) => {
    const updated = await api.relocateDrone(drone.id, baseId);
    applyDroneUpdate(updated);

    // se schimba apartenenta: vechea baza, noua baza si cea in care e parcata
    await refreshBases(drone.droneBaseId, baseId, updated.parkedAtBaseId);
  };

  const destroyDrone = async (drone) => {
    await api.destroyDrone(drone.id);

    removeDroneSprite(objectsRef.current, drone.id);
    setSelectedDrone((current) =>
      current && current.id === drone.id ? null : current,
    );

    await refreshBases(drone.droneBaseId, drone.parkedAtBaseId);
  };

  const toggleBaseStatus = async (droneBase) => {
    const nextStatus = droneBase.status === "offline" ? "online" : "offline";
    applyBaseUpdate(await api.setBaseStatus(droneBase.id, nextStatus));
  };

  const renameBase = async (droneBase, name) => {
    applyBaseUpdate(await api.setBaseName(droneBase.id, name));
  };

  const addDrone = async (droneBase, model, name) => {
    await api.addDrone(droneBase.id, model, name);
    await refreshBases(droneBase.id);
  };

  const addBase = async (newBase) => {
    const created = await api.createBase(newBase);

    if (globeRef.current) {
      spawnBase(globeRef.current, created, objectsRef.current);
    }

    return created;
  };

  const decommissionBase = async (droneBase) => {
    // dronele parcate sunt sterse pe server odata cu baza
    await api.decommissionBase(droneBase.id);

    removeBaseMesh(objectsRef.current, droneBase.id);
    setSelectedBase((current) =>
      current && current.id === droneBase.id ? null : current,
    );

    await syncDronesFromServer();
  };

  return {
    selectedDrone,
    setSelectedDrone,
    selectedBase,
    setSelectedBase,

    toggleDroneStatus,
    renameDrone,
    relocateDrone,
    destroyDrone,

    toggleBaseStatus,
    renameBase,
    addBase,
    addDrone,
    decommissionBase,
  };
}
