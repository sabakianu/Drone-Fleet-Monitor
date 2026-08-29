import { useEffect, useRef, useState } from "react";
import * as api from "./api.js";
import {
  spawnDrone,
  spawnBase,
  placeDroneSprite,
  findDroneSprite,
  findBaseMesh,
  removeDroneSprite,
  removeBaseMesh,
} from "./Scene/markers.js";

const POLL_MS = 500;

const isChanging = (drone) =>
  drone.currentSpeed.horizontal > 0 ||
  drone.currentSpeed.vertical > 0 ||
  (drone.status === "online" && drone.batteryLevel > 0) ||
  (drone.status === "offline" && drone.isInBase && drone.batteryLevel < 100);

export default function useFleet({ objectsRef, globeRef }) {
  const [drones, setDrones] = useState([]);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [selectedBase, setSelectedBase] = useState(null);

  const selectedBaseRef = useRef(null);
  selectedBaseRef.current = selectedBase;

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

      if (globeRef.current) {
        placeDroneSprite(globeRef.current, drone, objectsRef.current);
      } else if (sprite) {
        sprite.userData.drone = drone;
      }
    });

    setSelectedDrone((current) =>
      current ? (byId.get(current.id) ?? null) : current,
    );

    setDrones(drones);
    await syncSelectedBase(drones, byId);

    return drones;
  };

  // dronele din panoul bazei sunt copii vechi: le inlocuim cu cele proaspete.
  // daca s-a schimbat cine e parcat acolo, recitim baza intreaga (contoarele
  // le calculeaza serverul)
  const syncSelectedBase = async (drones, byId) => {
    const base = selectedBaseRef.current;
    if (!base) return;

    const parkedNow = drones
      .filter((drone) => drone.parkedAtBaseId === base.id)
      .map((drone) => drone.id)
      .sort()
      .join();

    const parkedBefore = (base.parkedDrones ?? [])
      .map((drone) => drone.id)
      .sort()
      .join();

    if (parkedNow !== parkedBefore) {
      await refreshBases(base.id);
      return;
    }

    const fresh = (list) =>
      (list ?? []).map((drone) => byId.get(drone.id) ?? drone);

    setSelectedBase((current) =>
      current && current.id === base.id
        ? {
            ...current,
            drones: fresh(current.drones),
            parkedDrones: fresh(current.parkedDrones),
          }
        : current,
    );
  };

  const toggleDroneStatus = async (drone) => {
    const nextStatus = drone.status === "offline" ? "online" : "offline";
    applyDroneUpdate(await api.setDroneStatus(drone.id, nextStatus));

    // pornita/oprita -> incepe sa se descarce sau sa se incarce
    setSyncing(true);
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

  // cat timp se schimba ceva pe server, recitim flota ca sa se vada in panouri
  // si pe glob; cand totul e static, ne oprim singuri
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    if (!syncing) return;

    let stopped = false;

    const poll = async () => {
      try {
        const drones = await syncDronesFromServer();

        if (!stopped && !drones.some(isChanging)) setSyncing(false);
      } catch (err) {
        console.error("failed to sync fleet:", err);
      }
    };

    poll();
    const timer = setInterval(poll, POLL_MS);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [syncing]);

  const moveDrone = async (drone, plan) => {
    applyDroneUpdate(await api.moveDrone(drone.id, plan));
    setSyncing(true);

    await refreshBases(drone.droneBaseId, drone.parkedAtBaseId);
  };

  const cancelDroneMove = async (drone) => {
    applyDroneUpdate(await api.cancelDroneMove(drone.id));
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
    drones,
    selectedDrone,
    setSelectedDrone,
    selectedBase,
    setSelectedBase,

    toggleDroneStatus,
    renameDrone,
    moveDrone,
    cancelDroneMove,
    relocateDrone,
    destroyDrone,

    toggleBaseStatus,
    renameBase,
    addBase,
    addDrone,
    decommissionBase,
  };
}
