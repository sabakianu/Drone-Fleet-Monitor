import { useEffect } from "react";
import { spawnGlobeMarker, removeGlobeMarker } from "./markers.js";

// cate un marker pe glob per intrare din lista.
export default function useGlobeMarkers({ globeRef, markers }) {
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const groups = markers.map((marker) =>
      spawnGlobeMarker(globe, marker.destination, marker.origin),
    );

    return () => groups.forEach((group) => removeGlobeMarker(globe, group));
  }, [globeRef, markers]);
}
