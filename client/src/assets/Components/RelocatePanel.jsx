import { useState } from "react";
import useAction from "../useAction.js";
import Dialog from "./UI/Dialog.jsx";

const EARTH_RADIUS_KM = 6371;

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
  const { busy, error, run } = useAction();

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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedId === null) return;

    run(onConfirm, selectedId);
  };

  return (
    <Dialog
      title={`Relocate ${droneLabel}`}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      busy={busy}
      error={error}
      confirmDisabled={selectedId === null}
    >
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
                  ? "bg-accent/10 border-accent"
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
                    <span className="ml-1 font-bold text-cancel">
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
    </Dialog>
  );
}
