const VARIANTS = {
  neutral: "bg-slate-500 hover:bg-slate-600",
  accent: "bg-accent hover:bg-accent-deep",
  dark: "bg-slate-700 hover:bg-slate-800",
  danger: "bg-red-600 hover:bg-red-700",
};

const SIZES = {
  default: "py-2 text-sm rounded-lg",
  small: "px-2 py-0.5 text-[11px] rounded-md",
};

export default function ActionButton({
  variant = "neutral",
  size = "default",
  grow = true,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      {...props}
      className={`${grow ? "flex-1" : ""} ${VARIANTS[variant]} ${SIZES[size]} disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold transition-colors ${className}`}
    />
  );
}

export function ActionRow({ children }) {
  return <div className="flex gap-3">{children}</div>;
}
