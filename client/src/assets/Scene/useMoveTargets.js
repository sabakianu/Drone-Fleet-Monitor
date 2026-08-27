import { useEffect } from "react";
import { spawnMoveTarget, removeMoveTarget } from "./markers.js";

export default function useMoveTargets({ globeRef, orders }) {
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const groups = orders.map((order) =>
      spawnMoveTarget(globe, order.destination, order.origin),
    );

    return () => groups.forEach((group) => removeMoveTarget(globe, group));
  }, [globeRef, orders]);
}
