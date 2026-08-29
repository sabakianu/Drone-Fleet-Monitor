import useAction from "../useAction.js";
import Dialog from "./UI/Dialog.jsx";

export default function ConfirmPanel({
  title = "Are you sure?",
  message,
  confirmLabel = "OK",
  onCancel,
  onConfirm,
}) {
  const { busy, error, run } = useAction();

  const handleSubmit = (event) => {
    event.preventDefault();
    run(onConfirm);
  };

  return (
    <Dialog
      title={title}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      busy={busy}
      error={error}
      confirmLabel={confirmLabel}
    >
      <p className="text-sm text-slate-600 wrap-break-word">{message}</p>
    </Dialog>
  );
}
