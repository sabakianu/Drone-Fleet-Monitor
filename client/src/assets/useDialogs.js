import { useState } from "react";
import { fetchBases, fetchDroneCatalog, fetchDroneDistances } from "./api.js";

// ce dialog e deschis, ce date are si ce actiune din useFleet declanseaza.
// dialogul se inchide doar dupa ce actiunea reuseste, altfel isi arata eroarea
export default function useDialogs(fleet) {
  const [renameTarget, setRenameTarget] = useState(null);
  const [relocateTarget, setRelocateTarget] = useState(null);
  const [addDroneTarget, setAddDroneTarget] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null);
  const [movePlan, setMovePlan] = useState(null);

  const [moveOrders, setMoveOrders] = useState([]);

  const putOrder = (order) =>
    setMoveOrders((current) => {
      const previous = current.find((entry) => entry.droneId === order.droneId);

      if (
        previous &&
        previous.origin === order.origin &&
        previous.destination.latitude === order.destination.latitude &&
        previous.destination.longitude === order.destination.longitude
      ) {
        return current;
      }

      return [
        ...current.filter((entry) => entry.droneId !== order.droneId),
        order,
      ];
    });

  const dropOrder = (droneId) =>
    setMoveOrders((current) =>
      current.filter((entry) => entry.droneId !== droneId),
    );

  const pickMoveDestination = (geo) => {
    if (moveTarget === null) return;

    setMovePlan({ drone: moveTarget, destination: geo });
    putOrder({ droneId: moveTarget.id, destination: geo, origin: null });
    setMoveTarget(null);
  };

  const confirmMove = async (plan) => {
    console.log("move drone", { droneId: movePlan.drone.id, ...plan });

    // destinatia din plan, nu cea din click: poate fi editata din inputuri
    putOrder({
      droneId: movePlan.drone.id,
      destination: { latitude: plan.latitude, longitude: plan.longitude },
      origin: movePlan.drone.currentLocation,
    });
    setMovePlan(null);
  };

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

  const openRelocateDrone = async (drone) => {
    const [bases, distances] = await Promise.all([
      fetchBases(),
      fetchDroneDistances(drone.id),
    ]);

    setRelocateTarget({ drone, bases, distances });
  };

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

    moveOrders,
    cancelOrder: dropOrder,

    moveTarget,
    // replanificarea aceleiasi drone inlocuieste ordinul ei, nu pe ale altora
    startMove: (drone) => {
      dropOrder(drone.id);
      setMoveTarget(drone);
    },
    cancelMove: () => setMoveTarget(null),
    pickMoveDestination,

    movePlan,
    confirmMove,
    // tinta urmareste inputurile din panou, nu doar punctul din click
    updateMoveDestination: (geo) =>
      putOrder({ droneId: movePlan.drone.id, destination: geo, origin: null }),
    closeMove: () => {
      dropOrder(movePlan.drone.id);
      setMovePlan(null);
    },

    confirmTarget,
    askDestroyDrone,
    askDecommissionBase,
    confirmAction,
    closeConfirm: () => setConfirmTarget(null),
  };
}
