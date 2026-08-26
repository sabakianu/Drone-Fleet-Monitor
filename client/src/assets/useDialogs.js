import { useState } from "react";
import { fetchBases, fetchDroneCatalog } from "./api.js";

// ce dialog e deschis, ce date are si ce actiune din useFleet declanseaza.
// dialogul se inchide doar dupa ce actiunea reuseste, altfel isi arata eroarea
export default function useDialogs(fleet) {
  const [renameTarget, setRenameTarget] = useState(null);
  const [relocateTarget, setRelocateTarget] = useState(null);
  const [addDroneTarget, setAddDroneTarget] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null);

  const openRenameDrone = (drone) =>
    setRenameTarget({
      entity: drone,
      rename: fleet.renameDrone,
      title: "Rename Drone",
      currentName: drone.name,
      placeholder: `Drone #${drone.id}`,
    });

  const openRenameBase = (droneBase) =>
    setRenameTarget({
      entity: droneBase,
      rename: fleet.renameBase,
      title: "Rename Base",
      currentName: droneBase.name,
      placeholder: `Base #${droneBase.id}`,
    });

  const confirmRename = async (name) => {
    const { entity, rename } = renameTarget;

    await rename(entity, name);
    setRenameTarget(null);
  };

  const openRelocateDrone = async (drone) =>
    setRelocateTarget({ drone, bases: await fetchBases() });

  const confirmRelocate = async (baseId) => {
    await fleet.relocateDrone(relocateTarget.drone, baseId);
    setRelocateTarget(null);
  };

  const openAddDrone = async (droneBase) =>
    setAddDroneTarget({ droneBase, catalog: await fetchDroneCatalog() });

  const confirmAddDrone = async (model, name) => {
    await fleet.addDrone(addDroneTarget.droneBase, model, name);
    setAddDroneTarget(null);
  };

  const askDestroyDrone = (drone) => {
    const label = drone.name || `Drone #${drone.id}`;

    setConfirmTarget({
      title: "Destroy Drone",
      message: `${label} will be removed from the fleet. This cannot be undone.`,
      confirmLabel: "Destroy",
      action: () => fleet.destroyDrone(drone),
    });
  };

  const askDecommissionBase = (droneBase) => {
    const label = droneBase.name || `Base #${droneBase.id}`;

    const ownParked = droneBase.dronesInBaseCount;
    const visitors = droneBase.parkedCount - ownParked;

    const effects = [];
    if (ownParked > 0) {
      effects.push(`its ${ownParked} parked drones will be destroyed`);
    }
    if (visitors > 0) {
      effects.push(`${visitors} visiting drones will take off`);
    }

    const warning =
      effects.length > 0 ? ` If you go on, ${effects.join("; ")}.` : "";

    setConfirmTarget({
      title: "Decommission Base",
      message: `${label} will be taken off the map.${warning}`,
      confirmLabel: "Decommission",
      action: () => fleet.decommissionBase(droneBase),
    });
  };

  const confirmAction = async () => {
    await confirmTarget.action();
    setConfirmTarget(null);
  };

  return {
    renameTarget,
    openRenameDrone,
    openRenameBase,
    confirmRename,
    closeRename: () => setRenameTarget(null),

    relocateTarget,
    openRelocateDrone,
    confirmRelocate,
    closeRelocate: () => setRelocateTarget(null),

    addDroneTarget,
    openAddDrone,
    confirmAddDrone,
    closeAddDrone: () => setAddDroneTarget(null),

    moveTarget,
    startMove: (drone) => setMoveTarget(drone),
    cancelMove: () => setMoveTarget(null),

    confirmTarget,
    askDestroyDrone,
    askDecommissionBase,
    confirmAction,
    closeConfirm: () => setConfirmTarget(null),
  };
}
