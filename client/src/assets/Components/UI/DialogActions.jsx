import CancelIcon from "../../Icons/Cancel.png";
import OkeyIcon from "../../Icons/Okey.png";

// perechea Cancel / OK din josul dialogurilor
export default function DialogActions({
  onCancel,
  busy = false,
  confirmDisabled = false,
  cancelLabel = "Cancel",
  confirmLabel = "OK",
  extraAction,
}) {
  return (
    <div className="flex items-center justify-end gap-3 mt-4">
      {extraAction && <div className="mr-auto">{extraAction}</div>}

      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="disabled:cursor-not-allowed inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border-2 border-cancel text-cancel-deep hover:bg-cancel/10 transition-colors"
      >
        {cancelLabel}
        <img
          src={CancelIcon}
          alt=""
          className="w-4 h-4 object-contain shrink-0"
        />
      </button>
      <button
        type="submit"
        disabled={busy || confirmDisabled}
        className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border-2 border-confirm text-confirm-deep hover:bg-confirm/10 disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
      >
        {confirmLabel}
        <img
          src={OkeyIcon}
          alt=""
          className="w-4 h-4 object-contain shrink-0 group-disabled:opacity-40"
        />
      </button>
    </div>
  );
}
