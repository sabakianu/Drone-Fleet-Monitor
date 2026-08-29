import { useState } from "react";

export default function useConfirm(fleet) {
  const [target, setTarget] = useState(null);

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

    setTarget({
      title: "Decommission Base",
      message: `${label} will be taken off the map.${warning}`,
      confirmLabel: "Decommission",
      action: () => fleet.decommissionBase(droneBase),
    });
  };

  return {
    target,
    askDestroyDrone: (drone) =>
      setTarget({
        title: "Destroy Drone",
        message: `${drone.name || `Drone #${drone.id}`} will be removed from the fleet. This cannot be undone.`,
        confirmLabel: "Destroy",
        action: () => fleet.destroyDrone(drone),
      }),
    askDecommissionBase,
    confirm: async () => {
      await target.action();
      setTarget(null);
    },
    close: () => setTarget(null),
  };
}
