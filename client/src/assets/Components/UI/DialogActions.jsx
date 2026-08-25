import CancelIcon from "../../Icons/Cancel.png";
import OkeyIcon from "../../Icons/Okey.png";

// perechea Cancel / OK din josul dialogurilor
export default function DialogActions({
  onCancel,
  busy = false,
  confirmDisabled = false,
  cancelLabel = "Cancel",
  confirmLabel = "OK",
}) {
  return (
    <div className="flex justify-end gap-3 mt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="disabled:cursor-not-allowed inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border-2 border-[#9b6a6d] text-[#85575a] hover:bg-[#9b6a6d]/10 transition-colors"
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
        className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white border-2 border-[#6d9b6a] text-[#57855a] hover:bg-[#6d9b6a]/10 disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
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
