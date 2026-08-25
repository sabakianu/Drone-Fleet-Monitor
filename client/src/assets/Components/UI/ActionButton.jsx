// butoanele late din josul panourilor (Rename, Turn On, Destroy, ...)
const VARIANTS = {
  neutral: "bg-slate-500 hover:bg-slate-600",
  accent: "bg-accent hover:bg-accent-deep",
  dark: "bg-slate-700 hover:bg-slate-800",
  danger: "bg-red-600 hover:bg-red-700",
};

export default function ActionButton({
  variant = "neutral",
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      {...props}
      className={`flex-1 ${VARIANTS[variant]} disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors text-sm ${className}`}
    />
  );
}

// randul care le tine: unul singur intr-un rand iese pe toata latimea
export function ActionRow({ children }) {
  return <div className="flex gap-3">{children}</div>;
}
