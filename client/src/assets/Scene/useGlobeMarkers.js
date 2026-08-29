import { useEffect } from "react";
import { spawnGlobeMarker, removeGlobeMarker } from "./markers.js";

export default function useGlobeMarkers({ globeRef, markers, drones }) {
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const byId = new Map(drones.map((drone) => [drone.id, drone]));

    const groups = markers.map((marker) => {
      if (marker.origin === null) {
        return spawnGlobeMarker(globe, marker.destination, null);
      }

      const drone = marker.droneId ? byId.get(marker.droneId) : null;

      return spawnGlobeMarker(
        globe,
        marker.destination,
        drone ? drone.currentLocation : marker.origin,
      );
    });

    return () => groups.forEach((group) => removeGlobeMarker(globe, group));
  }, [globeRef, markers, drones]);
}
