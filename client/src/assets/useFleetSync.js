import { useEffect, useRef, useState } from "react";
import * as api from "./api.js";
import {
  placeDroneSprite,
  findDroneSprite,
  findBaseMesh,
} from "./Scene/markers.js";

const POLL_MS = 500;

const isChanging = (drone) =>
  drone.currentSpeed.horizontal > 0 ||
  drone.currentSpeed.vertical > 0 ||
  (drone.status === "online" && drone.batteryLevel > 0) ||
  (drone.status === "offline" && drone.isInBase && drone.batteryLevel < 100);

export default function useFleetSync({ objectsRef, globeRef }) {
  const [drones, setDrones] = useState([]);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [selectedBase, setSelectedBase] = useState(null);

  const selectedBaseRef = useRef(null);
  selectedBaseRef.current = selectedBase;

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

  return {
    drones,
    selectedDrone,
    setSelectedDrone,
    selectedBase,
    setSelectedBase,

    applyDroneUpdate,
    applyBaseUpdate,
    refreshBases,
    syncDronesFromServer,

    resumeSync: () => setSyncing(true),
  };
}
