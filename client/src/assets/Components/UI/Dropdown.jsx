import { useEffect, useRef, useState } from "react";

export default function Dropdown({
  value,
  options,
  placeholder = "Select...",
  disabled = false,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = options.find((option) => option.value === value) ?? null;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} onKeyDown={handleKeyDown} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`w-full flex items-center justify-between gap-2 bg-zinc-100 border-2 rounded-lg px-3 py-2 text-sm text-left transition-colors disabled:cursor-not-allowed disabled:text-slate-400 ${
          open ? "border-accent" : "border-zinc-300 hover:border-slate-400"
        }`}
      >
        <span
          className={
            selected ? "font-semibold text-slate-800" : "text-slate-400"
          }
        >
          {selected ? selected.label : placeholder}
        </span>
        <span
          className={`text-slate-500 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-10 bg-white border-2 border-zinc-300 rounded-lg shadow-lg overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                option.value === value
                  ? "bg-accent/10 font-semibold text-slate-800"
                  : "text-slate-700 hover:bg-zinc-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
