import { useEffect, useState } from "react";
import useAction from "../useAction.js";
import { fetchDroneTrip } from "../api.js";
import { formatDistance, formatDuration } from "../format.js";
import Dialog from "./UI/Dialog.jsx";
import NumberField from "./UI/NumberField.jsx";

const number = (value) => (value.trim() === "" ? NaN : Number(value));

const inRange = (value, min, max) => value >= min && value <= max;

export default function MovePanel({ drone, destination, onCancel, onConfirm }) {
  const [latitude, setLatitude] = useState(destination.latitude.toFixed(4));
  const [longitude, setLongitude] = useState(destination.longitude.toFixed(4));
  const [altitude, setAltitude] = useState(
    String(drone.currentLocation.altitude),
  );
  const [horizontalSpeed, setHorizontalSpeed] = useState(
    String(drone.maxHorizontalSpeed),
  );
  const [verticalSpeed, setVerticalSpeed] = useState(
    String(drone.maxVerticalSpeed),
  );

  const { busy, error, run } = useAction();

  const lat = number(latitude);
  const lon = number(longitude);
  const alt = number(altitude);
  const speedH = number(horizontalSpeed);
  const speedV = number(verticalSpeed);

  const invalid = {
    latitude: !inRange(lat, -90, 90),
    longitude: !inRange(lon, -180, 180),
    altitude: !inRange(alt, 0, drone.maxAltitude),
    horizontalSpeed: !(speedH > 0 && speedH <= drone.maxHorizontalSpeed),
    verticalSpeed: !(speedV > 0 && speedV <= drone.maxVerticalSpeed),
  };

  const hasErrors = Object.values(invalid).some(Boolean);

  // distanta si timpul le calculeaza serverul (Distance.cs), deci le recerem
  // cand se schimba planul - cu o pauza, ca sa nu tragem la fiecare tasta
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    if (hasErrors) {
      setTrip(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setTrip(
          await fetchDroneTrip(drone.id, {
            latitude: lat,
            longitude: lon,
            altitude: alt,
            horizontalSpeed: speedH,
            verticalSpeed: speedV,
          }),
        );
      } catch (err) {
        console.error(err);
        setTrip(null);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [drone.id, lat, lon, alt, speedH, speedV, hasErrors]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (hasErrors) return;

    run(onConfirm, {
      latitude: lat,
      longitude: lon,
      altitude: alt,
      horizontalSpeed: speedH,
      verticalSpeed: speedV,
    });
  };

  return (
    <Dialog
      title="Confirm Move"
      onSubmit={handleSubmit}
      onCancel={onCancel}
      busy={busy}
      error={error}
      confirmDisabled={hasErrors}
      confirmLabel="Move"
    >
      <p className="text-sm text-slate-500 font-medium -mt-2 mb-4">
        {drone.name || `Drone #${drone.id}`} ·{" "}
        <span className="font-semibold text-slate-600">{drone.model}</span>
      </p>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          id="move-latitude"
          label="Latitude"
          hint="-90…90"
          unit="°"
          value={latitude}
          onChange={setLatitude}
          min={-90}
          max={90}
          disabled={busy}
          invalid={invalid.latitude}
        />
        <NumberField
          id="move-longitude"
          label="Longitude"
          hint="-180…180"
          unit="°"
          value={longitude}
          onChange={setLongitude}
          min={-180}
          max={180}
          disabled={busy}
          invalid={invalid.longitude}
        />
      </div>

      <div className="mt-3">
        <NumberField
          id="move-altitude"
          label="Altitude"
          hint={`max ${drone.maxAltitude.toLocaleString("en-US")} m`}
          unit="m"
          value={altitude}
          onChange={setAltitude}
          min={0}
          max={drone.maxAltitude}
          disabled={busy}
          invalid={invalid.altitude}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <NumberField
          id="move-horizontal-speed"
          label="Horizontal"
          hint={`max ${drone.maxHorizontalSpeed}`}
          unit="km/h"
          value={horizontalSpeed}
          onChange={setHorizontalSpeed}
          min={1}
          max={drone.maxHorizontalSpeed}
          disabled={busy}
          invalid={invalid.horizontalSpeed}
        />
        <NumberField
          id="move-vertical-speed"
          label="Vertical"
          hint={`max ${drone.maxVerticalSpeed}`}
          unit="m/s"
          value={verticalSpeed}
          onChange={setVerticalSpeed}
          min={1}
          max={drone.maxVerticalSpeed}
          disabled={busy}
          invalid={invalid.verticalSpeed}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 bg-white border-2 border-zinc-300 rounded-lg px-3 py-2">
        <div>
          <h3 className="text-xs font-medium text-slate-500">Distance</h3>
          <p className="text-sm font-bold text-slate-800">
            {trip === null ? "—" : formatDistance(trip.distanceKm)}
          </p>
        </div>
        <div className="w-px h-8 bg-slate-300" />
        <div className="text-right">
          <h3 className="text-xs font-medium text-slate-500">
            Estimated time{trip?.climbMeters > 0 ? " (incl. climb)" : ""}
          </h3>
          <p className="text-sm font-bold text-slate-800">
            {trip === null ? "—" : formatDuration(trip.travelSeconds)}
          </p>
        </div>
      </div>
    </Dialog>
  );
}
