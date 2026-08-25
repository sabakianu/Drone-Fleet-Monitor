import BatteryIcon from "../Icons/Battery.png";
import LocationIcon from "../Icons/Location.png";
import AltitudeIcon from "../Icons/Altitude.png";
import { resolveImage } from "../images.js";
import useAction from "../useAction.js";
import ActionButton, { ActionRow } from "./UI/ActionButton.jsx";
import Panel, { PanelFooter } from "./UI/Panel.jsx";

export default function DronePanel({
  drone,
  onClose,
  onRename,
  onToggleStatus,
  onDestroy,
}) {
  const batteryMah = Math.round(
    (drone.batteryLevel / 100) * drone.batteryCapacity,
  );

  const droneImg = resolveImage(drone.imagePath);

  const { busy, error, run } = useAction();

  return (
    <Panel
      side="left"
      title={drone.name || `Drone #${drone.id}`}
      subtitle={`Model: ${drone.model}`}
      image={droneImg}
      imageAlt={drone.model}
      caption={`${drone.category} ${drone.kind} Drone`}
      onClose={onClose}
    >
      {/* baterie */}
      <div className="flex items-center gap-2 mb-4">
        <img
          src={BatteryIcon}
          alt="Battery"
          className="w-6 h-6 object-contain"
        />
        <p className="text-lg font-bold text-slate-900">
          Battery: {Math.round(drone.batteryLevel)}%
        </p>
        <span className="text-xs text-slate-500">
          ({batteryMah} / {drone.batteryCapacity} mAh)
        </span>
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
                {drone.currentLocation.latitude.toFixed(4)}
              </span>
            </p>
            <div className="w-px h-3 bg-slate-300"></div>{" "}
            <p>
              Long:{" "}
              <span className="font-bold text-slate-800">
                {drone.currentLocation.longitude.toFixed(4)}
              </span>
            </p>
          </div>
        </div>

        {/* altitudine */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img
              src={AltitudeIcon}
              alt="Altitude"
              className="w-5 h-5 object-contain opacity-70"
            />
            <h3 className="text-sm font-semibold text-slate-700">Altitude:</h3>
          </div>
          <div className="text-sm text-slate-600 pl-7">
            <span className="font-bold text-slate-800">
              {drone.currentLocation.altitude}m
            </span>{" "}
            <span className="text-xs text-slate-500">
              (max {drone.maxAltitude}m)
            </span>
          </div>
        </div>

        {/* viteza */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-700">Speed:</h3>
          </div>
          <div className="flex flex-col gap-1 text-sm text-slate-600 pl-7">
            <p>
              Horiz:{" "}
              <span className="font-bold text-slate-800">
                {drone.currentSpeed.horizontal} km/h
              </span>{" "}
              <span className="text-xs text-slate-500">
                (max {drone.maxHorizontalSpeed} km/h)
              </span>
            </p>
            <p>
              Vert:{" "}
              <span className="font-bold text-slate-800">
                {drone.currentSpeed.vertical} m/s
              </span>{" "}
              <span className="text-xs text-slate-500">
                (max {drone.maxVerticalSpeed} m/s)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* status */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          Status: {drone.status}
        </h3>
      </div>

      <PanelFooter error={error}>
        <ActionRow>
          <ActionButton onClick={() => onRename(drone)} disabled={busy}>
            Rename
          </ActionButton>
          <ActionButton
            variant="accent"
            onClick={() => run(onToggleStatus, drone)}
            disabled={busy}
          >
            {drone.status === "offline" ? "Turn On" : "Turn Off"}
          </ActionButton>
        </ActionRow>
        <ActionRow>
          <ActionButton variant="dark">Move</ActionButton>
          <ActionButton
            variant="danger"
            onClick={() => onDestroy(drone)}
            disabled={busy}
          >
            Destroy
          </ActionButton>
        </ActionRow>
      </PanelFooter>
    </Panel>
  );
}
