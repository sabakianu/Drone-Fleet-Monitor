import { useState } from "react";
import useAction from "../useAction.js";
import Dialog from "./UI/Dialog.jsx";
import TextField from "./UI/TextField.jsx";

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
      <TextField
        id="rename-input"
        label="New name:"
        autoFocus
        value={name}
        onChange={setName}
        placeholder={placeholder}
        disabled={busy}
      />
    </Dialog>
  );
}
