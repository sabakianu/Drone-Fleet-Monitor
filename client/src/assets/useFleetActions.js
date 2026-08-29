import * as api from "./api.js";
import {
  spawnBase,
  removeDroneSprite,
  removeBaseMesh,
} from "./Scene/markers.js";

export default function useFleetActions({ objectsRef, globeRef, sync }) {
  const {
    applyDroneUpdate,
    applyBaseUpdate,
    refreshBases,
    setSelectedDrone,
    setSelectedBase,
  } = sync;

  const setSyncing = sync.resumeSync;
  const syncDronesFromServer = sync.syncDronesFromServer;

  const toggleDroneStatus = async (drone) => {
    const nextStatus = drone.status === "offline" ? "online" : "offline";
    applyDroneUpdate(await api.setDroneStatus(drone.id, nextStatus));

    setSyncing(true);
  };

  const renameDrone = async (drone, name) => {
    applyDroneUpdate(await api.setDroneName(drone.id, name));
  };

  const relocateDrone = async (drone, baseId) => {
    const updated = await api.relocateDrone(drone.id, baseId);
    applyDroneUpdate(updated);

    await refreshBases(drone.droneBaseId, baseId, updated.parkedAtBaseId);
  };

  const moveDrone = async (drone, plan) => {
    applyDroneUpdate(await api.moveDrone(drone.id, plan));
    setSyncing(true);

    await refreshBases(drone.droneBaseId, drone.parkedAtBaseId);
  };

  const towDrone = async (drone) => {
    const updated = await api.towDrone(drone.id);

    applyDroneUpdate(updated);
    removeDroneSprite(objectsRef.current, drone.id);

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
    await api.decommissionBase(droneBase.id);

    removeBaseMesh(objectsRef.current, droneBase.id);
    setSelectedBase((current) =>
      current && current.id === droneBase.id ? null : current,
    );

    await syncDronesFromServer();
  };

  return {
    toggleDroneStatus,
    renameDrone,
    moveDrone,
    cancelDroneMove,
    towDrone,
    relocateDrone,
    destroyDrone,

    toggleBaseStatus,
    renameBase,
    addBase,
    addDrone,
    decommissionBase,
  };
}
