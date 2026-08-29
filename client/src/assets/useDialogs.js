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

  const [altitudeTarget, setAltitudeTarget] = useState(null);
  const [addingBase, setAddingBase] = useState(false);
  const [addBasePlan, setAddBasePlan] = useState(null);

  // markerii desenati pe glob, identificati prin cheie: ordinele de mutare si
  // locul unde se pune o baza noua
  const [globeMarkers, setGlobeMarkers] = useState([]);

  const droneKey = (droneId) => `drone-${droneId}`;
  const pendingKey = (droneId) => `pending-${droneId}`;
  const NEW_BASE_KEY = "new-base";

  const putMarker = (marker) =>
    setGlobeMarkers((current) => {
      const previous = current.find((entry) => entry.key === marker.key);

      // acelasi marker -> pastram array-ul, ca sa nu respawnam degeaba
      if (
        previous &&
        previous.origin === marker.origin &&
        previous.destination.latitude === marker.destination.latitude &&
        previous.destination.longitude === marker.destination.longitude
      ) {
        return current;
      }

      return [...current.filter((entry) => entry.key !== marker.key), marker];
    });

  const dropMarker = (key) =>
    setGlobeMarkers((current) => current.filter((entry) => entry.key !== key));

  // un marker cu origin inseamna zbor pornit; cand drona s-a oprit, a ajuns
  const dropArrivedOrders = (drones) => {
    if (drones.length === 0) return;

    setGlobeMarkers((current) => {
      const next = current.filter((entry) => {
        if (entry.origin === null || !entry.droneId) return true;

        const drone = drones.find((d) => d.id === entry.droneId);
        if (!drone) return false;

        return (
          drone.currentSpeed.horizontal > 0 || drone.currentSpeed.vertical > 0
        );
      });

      return next.length === current.length ? current : next;
    });
  };

  // clickul pe glob inseamna altceva in functie de modul activ
  // lista de baze, ca panoul de mutare sa recunoasca o tinta care e o baza
  const handleGlobeClick = (geo) => {
    if (moveTarget !== null) {
      setMovePlan({ drone: moveTarget, destination: geo });
      putMarker({
        key: pendingKey(moveTarget.id),
        droneId: moveTarget.id,
        destination: geo,
        origin: null,
      });
      setMoveTarget(null);
      return;
    }

    if (addingBase) {
      setAddBasePlan({ location: geo });
      putMarker({ key: NEW_BASE_KEY, destination: geo, origin: null });
      setAddingBase(false);
    }
  };

  const confirmMove = async (plan) => {
    const { drone } = movePlan;

    const origin = { ...drone.currentLocation };

    await fleet.moveDrone(drone, plan);

    dropMarker(pendingKey(drone.id));

    // destinatia din plan, nu cea din click: poate fi editata din inputuri
    putMarker({
      key: droneKey(drone.id),
      droneId: drone.id,
      destination: { latitude: plan.latitude, longitude: plan.longitude },
      origin,
    });
    setMovePlan(null);
  };

  const confirmAltitude = async (plan) => {
    const { drone } = altitudeTarget;

    await fleet.moveDrone(drone, {
      latitude: drone.currentLocation.latitude,
      longitude: drone.currentLocation.longitude,
      ...plan,
    });

    setAltitudeTarget(null);
  };

  const confirmAddBase = async (newBase) => {
    await fleet.addBase(newBase);

    dropMarker(NEW_BASE_KEY);
    setAddBasePlan(null);
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

    globeMarkers,
    handleGlobeClick,

    // cat timp alegi un punct pe glob, clickul stanga anuleaza in loc sa selecteze
    picking: moveTarget !== null || addingBase,
    cancelPick: () => {
      setMoveTarget(null);
      setAddingBase(false);
    },

    dropArrivedOrders,
    hasOrderFor: (droneId) =>
      globeMarkers.some((entry) => entry.key === droneKey(droneId)),
    // anularea opreste drona unde a ajuns si sterge traseul
    cancelOrder: async (drone) => {
      await fleet.cancelDroneMove(drone);
      dropMarker(droneKey(drone.id));
    },

    moveTarget,
    // replanificarea aceleiasi drone inlocuieste ordinul ei, nu pe ale altora
    startMove: (drone) => setMoveTarget(drone),
    cancelMove: () => setMoveTarget(null),

    movePlan,
    confirmMove,
    // tinta urmareste inputurile din panou, nu doar punctul din click
    updateMoveDestination: (geo) =>
      putMarker({
        key: pendingKey(movePlan.drone.id),
        droneId: movePlan.drone.id,
        destination: geo,
        origin: null,
      }),
    closeMove: () => {
      dropMarker(pendingKey(movePlan.drone.id));
      setMovePlan(null);
    },

    altitudeTarget,
    openChangeAltitude: (drone) => setAltitudeTarget({ drone }),
    confirmAltitude,
    closeAltitude: () => setAltitudeTarget(null),

    addingBase,
    startAddBase: () => setAddingBase(true),
    cancelAddBase: () => setAddingBase(false),

    addBasePlan,
    confirmAddBase,
    updateAddBaseLocation: (geo) =>
      putMarker({ key: NEW_BASE_KEY, destination: geo, origin: null }),
    closeAddBase: () => {
      dropMarker(NEW_BASE_KEY);
      setAddBasePlan(null);
    },

    confirmTarget,
    askDestroyDrone,
    askDecommissionBase,
    confirmAction,
    closeConfirm: () => setConfirmTarget(null),
  };
}
