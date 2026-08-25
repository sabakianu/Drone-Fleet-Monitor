import { useState } from "react";
import LocationIcon from "../Icons/Location.png";
import BatteryIcon from "../Icons/Battery.png";
import RelocateIcon from "../Icons/Relocate.png";
import { resolveImage } from "../images.js";
import useAction from "../useAction.js";
import ActionButton, { ActionRow } from "./UI/ActionButton.jsx";
import IconButton from "./UI/IconButton.jsx";
import Panel, { PanelFooter } from "./UI/Panel.jsx";

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
  onAddDrone,
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

  const { busy, error, run } = useAction();

  return (
    <Panel
      side="right"
      title={droneBase.name || `Base #${droneBase.id}`}
      image={baseImg}
      imageAlt={`${droneBase.category} Base`}
      caption={`${droneBase.category} Base`}
      onClose={onClose}
    >
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
          <IconButton
            label="Previous list"
            className="px-2 py-0.5"
            onClick={() => cycleView(-1)}
          >
            ‹
          </IconButton>

          <h3 className="text-sm font-semibold text-slate-700">
            {view.label}{" "}
            <span className="text-xs font-medium text-slate-500">
              ({visibleDrones.length})
            </span>
          </h3>

          <IconButton
            label="Next list"
            className="px-2 py-0.5"
            onClick={() => cycleView(1)}
          >
            ›
          </IconButton>
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

                <IconButton
                  icon={RelocateIcon}
                  label="Relocate drone"
                  iconClassName="w-4 h-4"
                  className="p-1"
                  disabled={busy}
                  onClick={(event) => {
                    event.stopPropagation();
                    run(onRelocateDrone, drone);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <PanelFooter error={error}>
        <ActionRow>
          <ActionButton onClick={() => onRename(droneBase)} disabled={busy}>
            Rename Base
          </ActionButton>
          <ActionButton
            variant="accent"
            onClick={() => run(onToggleStatus, droneBase)}
            disabled={busy}
          >
            {droneBase.status === "offline" ? "Activate" : "Deactivate"}
          </ActionButton>
        </ActionRow>
        <ActionRow>
          <ActionButton
            variant="dark"
            onClick={() => onAddDrone(droneBase)}
            disabled={busy || droneBase.isFull}
          >
            Add Drone
          </ActionButton>
        </ActionRow>
        <ActionRow>
          <ActionButton
            variant="danger"
            onClick={() => onDecommission(droneBase)}
            disabled={busy}
          >
            Decommission Base
          </ActionButton>
        </ActionRow>
      </PanelFooter>
    </Panel>
  );
}
