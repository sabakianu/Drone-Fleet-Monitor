export default function NumberField({
  id,
  label,
  hint,
  unit,
  value,
  onChange,
  min,
  max,
  step = "any",
  disabled = false,
  invalid = false,
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        {hint && (
          <span className="text-xs font-medium text-slate-500 shrink-0">
            {hint}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          id={id}
          type="number"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`w-full bg-zinc-100 border-2 rounded-lg px-3 py-2 pr-14 text-sm text-slate-800 focus:outline-none disabled:text-slate-400 transition-colors ${
            invalid ? "border-cancel" : "border-zinc-300 focus:border-accent"
          }`}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
