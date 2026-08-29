import { useState } from "react";
import { fetchBases, fetchDroneCatalog, fetchDroneDistances } from "../api.js";

export default function useEntityDialogs(fleet) {
  const [renameTarget, setRenameTarget] = useState(null);
  const [relocateTarget, setRelocateTarget] = useState(null);
  const [addDroneTarget, setAddDroneTarget] = useState(null);

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

  return {
    renameTarget,
    openRenameDrone: (drone) =>
      setRenameTarget({
        entity: drone,
        rename: fleet.renameDrone,
        title: "Rename Drone",
        currentName: drone.name,
        placeholder: `Drone #${drone.id}`,
      }),
    openRenameBase: (droneBase) =>
      setRenameTarget({
        entity: droneBase,
        rename: fleet.renameBase,
        title: "Rename Base",
        currentName: droneBase.name,
        placeholder: `Base #${droneBase.id}`,
      }),
    confirmRename,
    closeRename: () => setRenameTarget(null),

    relocateTarget,
    openRelocateDrone,
    confirmRelocate: async (baseId) => {
      await fleet.relocateDrone(relocateTarget.drone, baseId);
      setRelocateTarget(null);
    },
    closeRelocate: () => setRelocateTarget(null),

    addDroneTarget,
    openAddDrone: async (droneBase) =>
      setAddDroneTarget({ droneBase, catalog: await fetchDroneCatalog() }),
    confirmAddDrone: async (model, name) => {
      await fleet.addDrone(addDroneTarget.droneBase, model, name);
      setAddDroneTarget(null);
    },
    closeAddDrone: () => setAddDroneTarget(null),
  };
}
