import { useState } from "react";
import useAction from "../useAction.js";
import { formatDuration } from "../format.js";
import Dialog from "./UI/Dialog.jsx";
import NumberField from "./UI/NumberField.jsx";
import SpeedFields from "./UI/SpeedFields.jsx";

const number = (value) => (value.trim() === "" ? NaN : Number(value));

const MIN_ALTITUDE = 1;

export default function AltitudePanel({ drone, onCancel, onConfirm }) {
  const [altitude, setAltitude] = useState(
    String(Math.max(MIN_ALTITUDE, drone.currentLocation.altitude)),
  );
  const [horizontalSpeed, setHorizontalSpeed] = useState(
    String(drone.maxHorizontalSpeed),
  );
  const [verticalSpeed, setVerticalSpeed] = useState(
    String(drone.maxVerticalSpeed),
  );

  const { busy, error, run } = useAction();

  const alt = number(altitude);
  const speedH = number(horizontalSpeed);
  const speedV = number(verticalSpeed);

  const invalid = {
    altitude: !(alt >= MIN_ALTITUDE && alt <= drone.maxAltitude),
    horizontalSpeed: !(speedH > 0 && speedH <= drone.maxHorizontalSpeed),
    verticalSpeed: !(speedV > 0 && speedV <= drone.maxVerticalSpeed),
  };

  const hasErrors = Object.values(invalid).some(Boolean);

  const climbMeters = Math.abs(alt - drone.currentLocation.altitude);
  const seconds = hasErrors ? null : climbMeters / speedV;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (hasErrors) return;

    run(onConfirm, {
      altitude: alt,
      horizontalSpeed: speedH,
      verticalSpeed: speedV,
    });
  };

  return (
    <Dialog
      title="Change Altitude"
      onSubmit={handleSubmit}
      onCancel={onCancel}
      busy={busy}
      error={error}
      confirmDisabled={hasErrors}
      confirmLabel="Apply"
    >
      <p className="text-sm text-slate-500 font-medium -mt-2 mb-4">
        {drone.name || `Drone #${drone.id}`} · now at{" "}
        <span className="font-semibold text-slate-600">
          {drone.currentLocation.altitude} m
        </span>
      </p>

      <NumberField
        id="altitude-target"
        label="New altitude"
        hint={`${MIN_ALTITUDE}…${drone.maxAltitude.toLocaleString("en-US")} m`}
        unit="m"
        value={altitude}
        onChange={setAltitude}
        min={MIN_ALTITUDE}
        max={drone.maxAltitude}
        disabled={busy}
        invalid={invalid.altitude}
      />

      <div className="mt-3">
        <SpeedFields
          idPrefix="altitude"
          drone={drone}
          horizontal={horizontalSpeed}
          vertical={verticalSpeed}
          onHorizontalChange={setHorizontalSpeed}
          onVerticalChange={setVerticalSpeed}
          invalidHorizontal={invalid.horizontalSpeed}
          invalidVertical={invalid.verticalSpeed}
          disabled={busy}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 bg-white border-2 border-zinc-300 rounded-lg px-3 py-2">
        <div>
          <h3 className="text-xs font-medium text-slate-500">Climb</h3>
          <p className="text-sm font-bold text-slate-800">
            {Number.isNaN(climbMeters) ? "—" : `${Math.round(climbMeters)} m`}
          </p>
        </div>
        <div className="w-px h-8 bg-slate-300" />
        <div className="text-right">
          <h3 className="text-xs font-medium text-slate-500">Estimated time</h3>
          <p className="text-sm font-bold text-slate-800">
            {seconds === null ? "—" : formatDuration(seconds)}
          </p>
        </div>
      </div>
    </Dialog>
  );
}
