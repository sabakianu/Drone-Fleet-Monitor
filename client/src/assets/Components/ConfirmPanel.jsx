import { useEffect, useState } from "react";
import DialogActions from "./UI/DialogActions.jsx";

export default function ConfirmPanel({
  title = "Are you sure?",
  message,
  confirmLabel = "OK",
  onCancel,
  onConfirm,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleKey = (event) => event.key === "Escape" && onCancel();

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      await onConfirm();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 z-60 flex items-center justify-center bg-slate-900/30">
      <form
        onSubmit={handleSubmit}
        className="w-96 bg-zinc-200 shadow-xl rounded-xl p-4 border-2 border-zinc-300 flex flex-col"
      >
        <h1 className="text-xl text-slate-700 font-semibold mb-3">{title}</h1>

        <p className="text-sm text-slate-600 wrap-break-word">{message}</p>

        {error && (
          <p className="mt-2 text-xs font-medium text-red-600 wrap-break-word">
            {error}
          </p>
        )}

        <DialogActions
          onCancel={onCancel}
          busy={busy}
          confirmLabel={confirmLabel}
        />
      </form>
    </div>
  );
}
