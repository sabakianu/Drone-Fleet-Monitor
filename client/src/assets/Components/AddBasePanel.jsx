import { useEffect, useRef, useState } from "react";
import useAction from "../useAction.js";
import { number, inRange, wholeAtLeast } from "../validation.js";
import Dialog from "./UI/Dialog.jsx";
import Dropdown from "./UI/Dropdown.jsx";
import NumberField from "./UI/NumberField.jsx";
import TextField from "./UI/TextField.jsx";

const CATEGORIES = [
  { value: "Civilian", label: "Civilian" },
  { value: "Military", label: "Military" },
];

export default function AddBasePanel({
  location,
  onLocationChange,
  onCancel,
  onConfirm,
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(null);
  const [latitude, setLatitude] = useState(location.latitude.toFixed(4));
  const [longitude, setLongitude] = useState(location.longitude.toFixed(4));
  const [droneCapacity, setDroneCapacity] = useState("5");
  const [parkingCapacity, setParkingCapacity] = useState("7");

  const { busy, error, run } = useAction();

  const lat = number(latitude);
  const lon = number(longitude);
  const drones = number(droneCapacity);
  const parking = number(parkingCapacity);
  const trimmed = name.trim();

  const invalid = {
    name: trimmed.length === 0,
    category: category === null,
    latitude: !inRange(lat, -90, 90),
    longitude: !inRange(lon, -180, 180),
    droneCapacity: !wholeAtLeast(drones, 1),
    parkingCapacity: !wholeAtLeast(parking, 1),
  };

  const hasErrors = Object.values(invalid).some(Boolean);

  const notifyRef = useRef(null);
  notifyRef.current = onLocationChange;

  useEffect(() => {
    if (invalid.latitude || invalid.longitude) return;

    notifyRef.current({ latitude: lat, longitude: lon });
  }, [lat, lon, invalid.latitude, invalid.longitude]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (hasErrors) return;

    run(onConfirm, {
      name: trimmed,
      category,
      latitude: lat,
      longitude: lon,
      maxDroneCapacity: drones,
      maxParkingCapacity: parking,
    });
  };

  return (
    <Dialog
      title="Add Base"
      onSubmit={handleSubmit}
      onCancel={onCancel}
      busy={busy}
      error={error}
      confirmDisabled={hasErrors}
      confirmLabel="Create"
    >
      <TextField
        id="add-base-name"
        label="Base name:"
        autoFocus
        value={name}
        onChange={setName}
        placeholder="e.g. Constanța Port"
        disabled={busy}
        invalid={invalid.name && name.length > 0}
      />

      <h3 className="text-sm font-semibold text-slate-700 mt-4 mb-1">
        Category:
      </h3>
      <Dropdown
        value={category}
        options={CATEGORIES}
        placeholder="Pick a category..."
        disabled={busy}
        onChange={setCategory}
      />

      <div className="grid grid-cols-2 gap-3 mt-4">
        <NumberField
          id="add-base-latitude"
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
          id="add-base-longitude"
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

      <div className="grid grid-cols-2 gap-3 mt-3">
        <NumberField
          id="add-base-drone-capacity"
          label="Assigned"
          hint="min 1"
          unit="drones"
          value={droneCapacity}
          onChange={setDroneCapacity}
          min={1}
          step={1}
          disabled={busy}
          invalid={invalid.droneCapacity}
        />
        <NumberField
          id="add-base-parking-capacity"
          label="Parked"
          hint="min 1"
          unit="slots"
          value={parkingCapacity}
          onChange={setParkingCapacity}
          min={1}
          step={1}
          disabled={busy}
          invalid={invalid.parkingCapacity}
        />
      </div>
    </Dialog>
  );
}
