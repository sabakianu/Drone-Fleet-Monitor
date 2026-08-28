import { useEffect } from "react";
import { spawnGlobeMarker, removeGlobeMarker } from "./markers.js";

// cate un marker pe glob per intrare din lista. marker.origin lipseste cat
// timp se alege punctul si apare dupa confirmare, odata cu traseul.
//
// pentru o drona in zbor traseul pleaca din pozitia ei curenta, nu din cea de
// decolare, asa ca bucata deja parcursa dispare pe masura ce inainteaza
export default function useGlobeMarkers({ globeRef, markers, drones }) {
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const byId = new Map(drones.map((drone) => [drone.id, drone]));

    const groups = markers.map((marker) => {
      // fara origin nu s-a pornit nimic: se vede doar tinta, fara traseu
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
