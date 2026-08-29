import { useState } from "react";
import LocationIcon from "../Icons/Location.png";
import { resolveImage } from "../images.js";
import useAction from "../useAction.js";
import ActionButton, { ActionRow } from "./UI/ActionButton.jsx";
import IconButton from "./UI/IconButton.jsx";
import Panel, { PanelFooter } from "./UI/Panel.jsx";
import DroneListRow from "./DroneListRow.jsx";
import SectionHeading from "./UI/SectionHeading.jsx";

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
  onCenterLocation,
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
      <div className="flex flex-col gap-3 mb-4">
        <div>
          <SectionHeading
            icon={LocationIcon}
            iconLabel="Center the globe here"
            onIconClick={() => onCenterLocation(droneBase.currentLocation)}
          >
            Location:
          </SectionHeading>
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

      <div className="flex-1 min-h-0 flex flex-col mb-4">
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

        <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-400">
          {visibleDrones.length === 0 && (
            <p className="text-xs text-slate-500 italic">{view.empty}</p>
          )}

          {visibleDrones.map((drone, index) => (
            <DroneListRow
              key={drone.id}
              drone={drone}
              index={index}
              disabled={busy}
              onClick={() => onDroneClick(drone)}
              onRelocate={() => run(onRelocateDrone, drone)}
            />
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
            onClick={() => run(onAddDrone, droneBase)}
            disabled={busy || droneBase.isFull || droneBase.isParkingFull}
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
