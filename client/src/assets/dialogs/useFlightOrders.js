import { useState } from "react";

const orderKey = (droneId) => `drone-${droneId}`;
const pendingKey = (droneId) => `pending-${droneId}`;

export default function useFlightOrders(fleet, markers) {
  const [moveTarget, setMoveTarget] = useState(null);
  const [movePlan, setMovePlan] = useState(null);
  const [altitudeTarget, setAltitudeTarget] = useState(null);

  const pickDestination = (geo) => {
    setMovePlan({ drone: moveTarget, destination: geo });
    markers.put({
      key: pendingKey(moveTarget.id),
      droneId: moveTarget.id,
      destination: geo,
      origin: null,
    });
    setMoveTarget(null);
  };

  const confirmMove = async (plan) => {
    const { drone } = movePlan;

    const origin = { ...drone.currentLocation };

    await fleet.moveDrone(drone, plan);

    markers.drop(pendingKey(drone.id));

    markers.put({
      key: orderKey(drone.id),
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

  return {
    moveTarget,
    startMove: (drone) => setMoveTarget(drone),
    cancelMove: () => setMoveTarget(null),
    pickDestination,

    movePlan,
    confirmMove,

    updateDestination: (geo) =>
      markers.put({
        key: pendingKey(movePlan.drone.id),
        droneId: movePlan.drone.id,
        destination: geo,
        origin: null,
      }),
    closeMove: () => {
      markers.drop(pendingKey(movePlan.drone.id));
      setMovePlan(null);
    },

    altitudeTarget,
    openChangeAltitude: (drone) => setAltitudeTarget({ drone }),
    confirmAltitude,
    closeAltitude: () => setAltitudeTarget(null),

    hasOrderFor: (droneId) => markers.has(orderKey(droneId)),

    cancelOrder: async (drone) => {
      await fleet.cancelDroneMove(drone);
      markers.drop(orderKey(drone.id));
    },
  };
}
