import * as api from "./api.js";
import useFleetSync from "./useFleetSync.js";
import useFleetActions from "./useFleetActions.js";

export default function useFleet({ objectsRef, globeRef }) {
  const sync = useFleetSync({ objectsRef, globeRef });
  const actions = useFleetActions({ objectsRef, globeRef, sync });

  return {
    ...sync,
    ...actions,
    openBase: async (baseId) =>
      sync.setSelectedBase(await api.fetchBase(baseId)),
  };
}
