import { useState } from "react";
import CancelIcon from "../Icons/Cancel.png";
import OkeyIcon from "../Icons/Okey.png";

export default function RenamePanel({
  title = "Rename",
  currentName = "",
  placeholder = "",
  onCancel,
  onConfirm,
}) {
  const [name, setName] = useState(currentName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const trimmed = name.trim();

  // daca onConfirm pica, dialogul ramane deschis si arata eroarea
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (trimmed.length === 0 || busy) return;

    setBusy(true);
    setError(null);

    try {
      await onConfirm(trimmed);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    // fundalul intunecat nu inchide dialogul: un drag din input care se
    // termina in afara casetei ar anula pe nedrept
    <div className="absolute inset-0 z-60 flex items-center justify-center bg-slate-900/30">
      <form
        onSubmit={handleSubmit}
        onKeyDown={(event) => event.key === "Escape" && onCancel()}
        className="w-80 bg-zinc-200 shadow-xl rounded-xl p-3 border-2 border-zinc-300 flex flex-col"
      >
        <h1 className="text-xl text-slate-700 font-semibold mb-3">{title}</h1>

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
          className="w-full bg-zinc-100 border-2 border-zinc-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#6a6d9b] disabled:text-slate-400 transition-colors"
        />

        {error && (
          <p className="mt-2 text-xs font-medium text-red-600 wrap-break-word">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="disabled:cursor-not-allowed inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border-2 border-[#9b6a6d] text-[#85575a] hover:bg-[#9b6a6d]/10 transition-colors"
          >
            Cancel
            <img
              src={CancelIcon}
              alt=""
              className="w-4 h-4 object-contain shrink-0"
            />
          </button>
          <button
            type="submit"
            disabled={trimmed.length === 0 || busy}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border-2 border-[#6d9b6a] text-[#57855a] hover:bg-[#6d9b6a]/10 disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
          >
            OK
            <img
              src={OkeyIcon}
              alt=""
              className="w-4 h-4 object-contain shrink-0 group-disabled:opacity-40"
            />
          </button>
        </div>
      </form>
    </div>
  );
}
