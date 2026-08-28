export default function TextField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  maxLength = 40,
  autoFocus = false,
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

      <input
        id={id}
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={`w-full bg-zinc-100 border-2 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:text-slate-400 transition-colors ${
          invalid ? "border-cancel" : "border-zinc-300 focus:border-accent"
        }`}
      />
    </div>
  );
}
