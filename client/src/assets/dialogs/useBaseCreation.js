import { useState } from "react";

const NEW_BASE_KEY = "new-base";

export default function useBaseCreation(fleet, markers) {
  const [picking, setPicking] = useState(false);
  const [plan, setPlan] = useState(null);

  const pickLocation = (geo) => {
    setPlan({ location: geo });
    markers.put({ key: NEW_BASE_KEY, destination: geo, origin: null });
    setPicking(false);
  };

  const confirm = async (newBase) => {
    await fleet.addBase(newBase);

    markers.drop(NEW_BASE_KEY);
    setPlan(null);
  };

  return {
    picking,
    start: () => setPicking(true),
    cancel: () => setPicking(false),
    pickLocation,

    plan,
    confirm,
    updateLocation: (geo) =>
      markers.put({ key: NEW_BASE_KEY, destination: geo, origin: null }),
    close: () => {
      markers.drop(NEW_BASE_KEY);
      setPlan(null);
    },
  };
}
