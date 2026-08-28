import { useEffect, useRef, useState } from "react";
import useAction from "../useAction.js";
import Dialog from "./UI/Dialog.jsx";
import Dropdown from "./UI/Dropdown.jsx";
import NumberField from "./UI/NumberField.jsx";
import TextField from "./UI/TextField.jsx";

const CATEGORIES = [
  { value: "Civilian", label: "Civilian" },
  { value: "Military", label: "Military" },
];

const number = (value) => (value.trim() === "" ? NaN : Number(value));

const inRange = (value, min, max) => value >= min && value <= max;

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

  const { busy, error, run } = useAction();

  const lat = number(latitude);
  const lon = number(longitude);
  const trimmed = name.trim();

  const invalid = {
    name: trimmed.length === 0,
    category: category === null,
    latitude: !inRange(lat, -90, 90),
    longitude: !inRange(lon, -180, 180),
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
    </Dialog>
  );
}
