import { useState } from "react";
import CloseButton from "../Icons/CloseButton.png";
import LocationIcon from "../Icons/Location.png";
import BatteryIcon from "../Icons/Battery.png";
import RelocateIcon from "../Icons/Relocate.png";
import { resolveImage } from "../images.js";

const DRONE_VIEWS = [
  {
    label: "Assigned Drones",
    source: (base) => base.drones,
    filter: () => true,
    empty: "No drones assigned.",
  },
  {
    label: "Drones In Base",
    source: (base) => base.parkedDrones,
    filter: () => true,
    empty: "No drones in base.",
  },
  {
    label: "Drones In Flight",
    source: (base) => base.drones,
    filter: (drone) => drone.parkedAtBaseId === null,
    empty: "No drones in flight.",
  },
  {
    label: "Drones Away",
    source: (base) => base.drones,
    filter: (drone, base) =>
      drone.parkedAtBaseId !== null && drone.parkedAtBaseId !== base.id,
    empty: "No drones parked elsewhere.",
  },
];

export default function BasePanel({
  droneBase,
  onClose,
  onDroneClick,
  onRename,
  onRelocateDrone,
  onToggleStatus,
  onDecommission,
}) {
  const baseImg = resolveImage(droneBase.imagePath);

  const [viewIndex, setViewIndex] = useState(0);
  const view = DRONE_VIEWS[viewIndex];
  const visibleDrones = (view.source(droneBase) ?? []).filter((drone) =>
    view.filter(drone, droneBase),
  );

  const cycleView = (step) =>
    setViewIndex(
      (current) => (current + step + DRONE_VIEWS.length) % DRONE_VIEWS.length,
    );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // blocheaza butoanele cat timp requestul e in zbor si arata eroarea daca pica
  const run = async (action) => {
    setBusy(true);
    setError(null);

    try {
      await action(droneBase);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDecommission = () => {
    const label = droneBase.name || `Base #${droneBase.id}`;

    const ownParked = droneBase.dronesInBaseCount;
    const visitors = droneBase.parkedCount - ownParked;

    const effects = [];
    if (ownParked > 0) {
      effects.push(`its ${ownParked} parked drones will be destroyed`);
    }
    if (visitors > 0) {
      effects.push(`${visitors} visiting drones will take off`);
    }

    const warning = effects.length > 0 ? ` ${effects.join("; ")}.` : "";

    if (!window.confirm(`Decommission ${label}?${warning}`)) {
      return;
    }

    run(onDecommission);
  };

  return (
    <div className="absolute top-3.5 bottom-4.5 right-2.25 w-80 z-50 bg-zinc-200 shadow-xl rounded-xl p-3 border-2 border-zinc-300 flex flex-col">
      <div className="relative flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl text-slate-700 font-semibold">
            {droneBase.name || `Base #${droneBase.id}`}
          </h1>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-800 font-bold px-2 py-1 rounded-lg hover:bg-slate-300/60 transition-colors"
        >
          <img
            src={CloseButton}
            alt="Close"
            className="w-6 h-6 object-contain opacity-70 hover:opacity-100"
          />
        </button>
      </div>

      <div className="h-36 w-full overflow-hidden rounded-lg">
        <img
          src={baseImg}
          alt={`${droneBase.category} Base`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="text-sm text-slate-500 font-medium text-center mb-4">
        {droneBase.category} Base
      </div>

      {/* locatie */}
      <div className="flex flex-col gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img
              src={LocationIcon}
              alt="Location"
              className="w-5 h-5 object-contain opacity-70"
            />
            <h3 className="text-sm font-semibold text-slate-700">Location:</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600 pl-7">
            <p>
              Lat:{" "}
              <span className="font-bold text-slate-800">
                {droneBase.currentLocation.latitude.toFixed(4)}
              </span>
            </p>
            <div className="w-px h-3 bg-slate-300"></div>{" "}
            <p>
              Long:{" "}
              <span className="font-bold text-slate-800">
                {droneBase.currentLocation.longitude.toFixed(4)}
              </span>
            </p>
          </div>
        </div>

        {/* capacitate: drone asignate vs. locuri de parcare */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">
            Capacity:
          </h3>
          <div className="text-sm text-slate-600 pl-7">
            <span className="font-bold text-slate-800">
              {droneBase.droneCount} / {droneBase.maxDroneCapacity}
            </span>{" "}
            <span className="text-xs text-slate-500">assigned</span>
            {droneBase.isFull && (
              <span className="ml-2 text-xs font-bold text-red-600">FULL</span>
            )}
          </div>
          <div className="text-sm text-slate-600 pl-7">
            <span className="font-bold text-slate-800">
              {droneBase.parkedCount} / {droneBase.maxParkingCapacity}
            </span>{" "}
            <span className="text-xs text-slate-500">parked</span>
            {droneBase.isParkingFull && (
              <span className="ml-2 text-xs font-bold text-red-600">FULL</span>
            )}
          </div>
        </div>

        {/* status */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700">
            Status: {droneBase.status}
          </h3>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Docked:</h3>
        <div className="flex items-center gap-4 text-sm text-slate-600 pl-7">
          <p>
            In base:{" "}
            <span className="font-bold text-slate-800">
              {droneBase.dronesInBaseCount}
            </span>
          </p>
          <div className="w-px h-3 bg-slate-300"></div>
          <p>
            In flight:{" "}
            <span className="font-bold text-slate-800">
              {droneBase.dronesInFlightCount}
            </span>
          </p>
          <div className="w-px h-3 bg-slate-300"></div>
          <p>
            Away:{" "}
            <span className="font-bold text-slate-800">
              {droneBase.dronesAwayCount}
            </span>
          </p>
        </div>
      </div>

      {/*lista drone*/}
      <div className="flex-1 min-h-0 flex flex-col mb-4">
        {/* switcher intre cele 3 liste */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => cycleView(-1)}
            aria-label="Previous list"
            className="px-2 py-0.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-300/60 transition-colors font-bold"
          >
            ‹
          </button>

          <h3 className="text-sm font-semibold text-slate-700">
            {view.label}{" "}
            <span className="text-xs font-medium text-slate-500">
              ({visibleDrones.length})
            </span>
          </h3>

          <button
            onClick={() => cycleView(1)}
            aria-label="Next list"
            className="px-2 py-0.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-300/60 transition-colors font-bold"
          >
            ›
          </button>
        </div>

        {/* Containerul care face scroll dacă sunt prea multe */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-400">
          {visibleDrones.length === 0 && (
            <p className="text-xs text-slate-500 italic">{view.empty}</p>
          )}

          {visibleDrones.map((drone, index) => (
            <div
              key={drone.id}
              onClick={() => onDroneClick(drone)}
              className="flex items-center justify-between bg-zinc-300/60 p-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:bg-zinc-300 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] active:shadow-none"
            >
              <div className="flex items-center gap-3">
                {/* index */}
                <span className="text-xs font-bold text-slate-400 w-3">
                  {index + 1}
                </span>

                {/* name/model */}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 leading-tight">
                    {drone.name || `Drone #${drone.id}`}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {drone.model}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <img
                    src={BatteryIcon}
                    alt="Battery"
                    className="w-4 h-4 object-contain opacity-80"
                  />
                  <span className="text-sm font-bold text-slate-800">
                    {Math.round(drone.batteryLevel)}%
                  </span>
                </div>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    run(() => onRelocateDrone(drone));
                  }}
                  disabled={busy}
                  aria-label="Relocate drone"
                  className="p-1 rounded-lg hover:bg-slate-400/40 disabled:cursor-not-allowed transition-colors"
                >
                  <img
                    src={RelocateIcon}
                    alt="Relocate"
                    className="w-4 h-4 object-contain opacity-70 hover:opacity-100"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {error && (
          <p className="text-xs font-medium text-red-600 wrap-break-word">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => onRename(droneBase)}
            disabled={busy}
            className="flex-1 bg-slate-500 hover:bg-slate-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            Rename Base
          </button>
          <button
            onClick={() => run(onToggleStatus)}
            disabled={busy}
            className="flex-1 bg-[#6a6d9b] hover:bg-[#575a85] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            {droneBase.status === "offline" ? "Activate" : "Deactivate"}
          </button>
        </div>
        <button
          disabled={droneBase.isFull}
          className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors text-sm"
        >
          Add Drone
        </button>
        <button
          onClick={handleDecommission}
          disabled={busy}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors text-sm"
        >
          Decommission Base
        </button>
      </div>
    </div>
  );
}
