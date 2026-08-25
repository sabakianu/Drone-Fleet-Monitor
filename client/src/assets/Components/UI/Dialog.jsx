import { useEffect } from "react";
import DialogActions from "./DialogActions.jsx";

export default function Dialog({
  title,
  onSubmit,
  onCancel,
  busy = false,
  error,
  confirmDisabled = false,
  cancelLabel,
  confirmLabel,
  children,
}) {
  useEffect(() => {
    const handleKey = (event) => event.key === "Escape" && onCancel();

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  return (
    <div className="absolute inset-0 z-60 flex items-center justify-center bg-slate-900/30">
      <form
        onSubmit={onSubmit}
        className="w-96 bg-zinc-200 shadow-xl rounded-xl p-4 border-2 border-zinc-300 flex flex-col"
      >
        <h1 className="text-xl text-slate-700 font-semibold mb-3">{title}</h1>

        {children}

        {error && (
          <p className="mt-2 text-xs font-medium text-red-600 wrap-break-word">
            {error}
          </p>
        )}

        <DialogActions
          onCancel={onCancel}
          busy={busy}
          confirmDisabled={confirmDisabled}
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
        />
      </form>
    </div>
  );
}
