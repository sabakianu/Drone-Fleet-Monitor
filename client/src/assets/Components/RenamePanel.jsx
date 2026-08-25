import { useState } from "react";
import useAction from "../useAction.js";
import Dialog from "./UI/Dialog.jsx";

export default function RenamePanel({
  title = "Rename",
  currentName = "",
  placeholder = "",
  onCancel,
  onConfirm,
}) {
  const [name, setName] = useState(currentName);
  const { busy, error, run } = useAction();
  const trimmed = name.trim();

  // daca onConfirm pica, dialogul ramane deschis si arata eroarea
  const handleSubmit = (event) => {
    event.preventDefault();
    if (trimmed.length === 0) return;

    run(onConfirm, trimmed);
  };

  return (
    <Dialog
      title={title}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      busy={busy}
      error={error}
      confirmDisabled={trimmed.length === 0}
    >
      <label
        htmlFor="rename-input"
        className="text-sm font-semibold text-slate-700 mb-1"
      >
        New name:
      </label>
      <input
        id="rename-input"
        autoFocus
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={placeholder}
        maxLength={40}
        disabled={busy}
        className="w-full bg-zinc-100 border-2 border-zinc-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-accent disabled:text-slate-400 transition-colors"
      />
    </Dialog>
  );
}
