import { useState } from "react";
import useAction from "../useAction.js";
import Dialog from "./UI/Dialog.jsx";
import Dropdown from "./UI/Dropdown.jsx";
import TextField from "./UI/TextField.jsx";
import OptionButton from "./UI/OptionButton.jsx";

export default function AddDronePanel({
  droneBase,
  catalog,
  onCancel,
  onConfirm,
}) {
  const [kind, setKind] = useState(null);
  const [model, setModel] = useState(null);
  const [name, setName] = useState("");
  const { busy, error, run } = useAction();

  const baseLabel = droneBase.name || `Base #${droneBase.id}`;

  const available = catalog.filter(
    (entry) => entry.category === droneBase.category,
  );

  const kindOptions = [...new Set(available.map((entry) => entry.kind))].map(
    (entry) => ({ value: entry, label: entry }),
  );

  const models = kind ? available.filter((entry) => entry.kind === kind) : [];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (model === null) return;

    run(onConfirm, model, name.trim());
  };

  return (
    <Dialog
      title="Add Drone"
      onSubmit={handleSubmit}
      onCancel={onCancel}
      busy={busy}
      error={error}
      confirmDisabled={model === null}
      confirmLabel="Add"
    >
      <p className="text-sm text-slate-500 font-medium -mt-2 mb-4">
        {baseLabel} ·{" "}
        <span className="font-semibold text-slate-600">
          {droneBase.category}
        </span>{" "}
        <span className="text-xs">(set by the base)</span>
      </p>

      <h3 className="text-sm font-semibold text-slate-700 mb-1">Kind:</h3>
      <Dropdown
        value={kind}
        options={kindOptions}
        placeholder="Pick a kind..."
        disabled={busy}
        onChange={(next) => {
          setKind(next);
          setModel(null);
        }}
      />

      <h3 className="text-sm font-semibold text-slate-700 mt-4 mb-1">
        Model:{" "}
        <span className="text-xs font-medium text-slate-500">
          ({models.length} available)
        </span>
      </h3>

      <div className="max-h-64 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-400">
        {kind === null && (
          <p className="text-xs text-slate-500 italic">Pick a kind first.</p>
        )}

        {models.map((entry) => (
          <OptionButton
            key={entry.model}
            selected={entry.model === model}
            disabled={busy}
            onClick={() => setModel(entry.model)}
          >
            <span className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-700 leading-tight truncate">
                {entry.model}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {entry.kind}
              </span>
            </span>

            <span className="flex flex-col items-end shrink-0">
              <span className="text-xs font-semibold text-slate-600">
                {entry.maxHorizontalSpeed} km/h · {entry.maxVerticalSpeed} m/s
              </span>
              <span className="text-xs font-medium text-slate-500">
                {entry.batteryCapacity.toLocaleString("en-US")} mAh
              </span>
            </span>
          </OptionButton>
        ))}
      </div>

      <div className="mt-4">
        <TextField
          id="add-drone-name"
          label="Name:"
          value={name}
          onChange={setName}
          placeholder="Optional"
          disabled={busy}
        />
      </div>
    </Dialog>
  );
}
