import { useState } from "react";

export default function useMarkers() {
  const [list, setList] = useState([]);

  const put = (marker) =>
    setList((current) => {
      const previous = current.find((entry) => entry.key === marker.key);

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

  const drop = (key) =>
    setList((current) => current.filter((entry) => entry.key !== key));

  const has = (key) => list.some((entry) => entry.key === key);

  const dropArrived = (drones) => {
    if (drones.length === 0) return;

    setList((current) => {
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

  return { list, put, drop, has, dropArrived };
}
