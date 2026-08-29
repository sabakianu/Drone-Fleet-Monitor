import { useState } from "react";

export default function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const run = async (action, ...args) => {
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      await action(...args);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return { busy, error, run };
}
