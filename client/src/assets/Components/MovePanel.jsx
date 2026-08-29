import { useEffect, useRef, useState } from "react";
import useAction from "../useAction.js";
import { fetchDroneTrip } from "../api.js";
import { formatDistance, formatDuration } from "../format.js";
import { number, inRange } from "../validation.js";
import ActionButton from "./UI/ActionButton.jsx";
import Dialog from "./UI/Dialog.jsx";
import NumberField from "./UI/NumberField.jsx";
import SpeedFields from "./UI/SpeedFields.jsx";

const MIN_ALTITUDE = 0;
const DEFAULT_ALTITUDE = 1;

export default function MovePanel({
  drone,
  destination,
  onDestinationChange,
  onCancel,
  onConfirm,
}) {
  const [latitude, setLatitude] = useState(destination.latitude.toFixed(4));
  const [longitude, setLongitude] = useState(destination.longitude.toFixed(4));
  const [altitude, setAltitude] = useState(
    String(Math.max(DEFAULT_ALTITUDE, drone.currentLocation.altitude)),
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
    altitude: !inRange(alt, MIN_ALTITUDE, drone.maxAltitude),
    horizontalSpeed: !(speedH > 0 && speedH <= drone.maxHorizontalSpeed),
    verticalSpeed: !(speedV > 0 && speedV <= drone.maxVerticalSpeed),
  };

  const hasErrors = Object.values(invalid).some(Boolean);

  const notifyRef = useRef(null);
  notifyRef.current = onDestinationChange;

  useEffect(() => {
    if (invalid.latitude || invalid.longitude) return;

    notifyRef.current({ latitude: lat, longitude: lon });
  }, [lat, lon, invalid.latitude, invalid.longitude]);

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

  const submit = (extra) =>
    run(onConfirm, {
      latitude: lat,
      longitude: lon,
      altitude: alt,
      horizontalSpeed: speedH,
      verticalSpeed: speedV,
      ...extra,
    });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (hasErrors) return;

    submit();
  };

  const handlePark = () =>
    submit({ altitude: 0, parkAtBaseId: trip.parkableBaseId });

  return (
    <Dialog
      title="Confirm Move"
      onSubmit={handleSubmit}
      onCancel={onCancel}
      busy={busy}
      error={error}
      confirmDisabled={hasErrors}
      confirmLabel="Move"
      extraAction={
        trip?.parkableBaseId != null && (
          <ActionButton
            variant="accent"
            grow={false}
            className="px-4"
            onClick={handlePark}
            disabled={busy || hasErrors}
          >
            Park at {trip.parkableBaseName}
          </ActionButton>
        )
      }
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
          hint={`0…${drone.maxAltitude.toLocaleString("en-US")} m`}
          unit="m"
          value={altitude}
          onChange={setAltitude}
          min={MIN_ALTITUDE}
          max={drone.maxAltitude}
          disabled={busy}
          invalid={invalid.altitude}
        />
      </div>

      <div className="mt-3">
        <SpeedFields
          idPrefix="move"
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
