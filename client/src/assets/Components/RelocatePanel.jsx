import { useEffect, useState } from "react";
import DialogActions from "./UI/DialogActions.jsx";

const EARTH_RADIUS_KM = 6371;

// haversine: distanta pe suprafata globului intre doua coordonate
function distanceKm(from, to) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

function formatDistance(km) {
  return km < 10
    ? `${km.toFixed(1)} km`
    : `${Math.round(km).toLocaleString("en-US")} km`;
}

export default function RelocatePanel({ drone, bases, onCancel, onConfirm }) {
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleKey = (event) => event.key === "Escape" && onCancel();

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  const droneLabel = drone.name || `Drone #${drone.id}`;
  const currentBase = bases.find((b) => b.id === drone.droneBaseId) ?? null;

  const options = bases
    .filter((base) => base.id !== drone.droneBaseId)
    .map((base) => {
      const wrongCategory = base.category !== drone.category;

      return {
        ...base,
        wrongCategory,
        blocked: base.isFull || wrongCategory,
        reason: wrongCategory ? base.category.toUpperCase() : "FULL",
        distance: distanceKm(drone.currentLocation, base.currentLocation),
      };
    })
    .sort((a, b) => a.blocked - b.blocked || a.distance - b.distance);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedId === null || busy) return;

    setBusy(true);
    setError(null);

    try {
      await onConfirm(selectedId);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 z-60 flex items-center justify-center bg-slate-900/30">
      <form
        onSubmit={handleSubmit}
        className="w-96 bg-zinc-200 shadow-xl rounded-xl p-4 border-2 border-zinc-300 flex flex-col"
      >
        <h1 className="text-xl text-slate-700 font-semibold mb-3">
          Relocate {droneLabel}
        </h1>

        <h3 className="text-sm font-semibold text-slate-700 mb-1">
          Current base:
        </h3>
        <div className="w-full bg-white border-2 border-zinc-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600">
          {currentBase ? currentBase.name : "None"}
        </div>

        <h3 className="text-sm font-semibold text-slate-700 mt-4 mb-1">
          Possible bases:{" "}
          <span className="text-xs font-medium text-slate-500">
            ({options.filter((base) => !base.blocked).length} available)
          </span>
        </h3>

        <div className="max-h-64 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-400">
          {options.length === 0 && (
            <p className="text-xs text-slate-500 italic">No other bases.</p>
          )}

          {options.map((base) => {
            const selected = base.id === selectedId;

            return (
              <button
                key={base.id}
                type="button"
                disabled={base.blocked || busy}
                onClick={() => setSelectedId(base.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border-2 text-left transition-colors disabled:cursor-not-allowed ${
                  selected
                    ? "bg-[#6a6d9b]/10 border-[#6a6d9b]"
                    : "bg-white border-zinc-300 hover:border-slate-400 disabled:bg-zinc-100 disabled:border-zinc-200 disabled:hover:border-zinc-200"
                }`}
              >
                <span className="flex flex-col min-w-0">
                  <span
                    className={`text-sm font-bold leading-tight truncate ${
                      base.blocked ? "text-slate-400" : "text-slate-700"
                    }`}
                  >
                    {base.name}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      base.blocked ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {base.category} · {base.droneCount}/{base.maxDroneCapacity}
                    {base.blocked && (
                      <span className="ml-1 font-bold text-[#9b6a6d]">
                        {base.reason}
                      </span>
                    )}
                  </span>
                </span>

                <span
                  className={`text-xs font-semibold shrink-0 ${
                    base.blocked ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {formatDistance(base.distance)}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-2 text-xs font-medium text-red-600 wrap-break-word">
            {error}
          </p>
        )}

        <DialogActions
          onCancel={onCancel}
          busy={busy}
          confirmDisabled={selectedId === null}
        />
      </form>
    </div>
  );
}
