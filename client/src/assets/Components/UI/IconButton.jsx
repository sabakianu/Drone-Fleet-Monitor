export default function IconButton({
  icon,
  label,
  iconClassName = "w-6 h-6",
  className = "px-2 py-1",
  children,
  ...props
}) {
  return (
    <button
      type="button"
      aria-label={label}
      {...props}
      className={`text-slate-500 hover:text-slate-800 font-bold rounded-lg hover:bg-slate-300/60 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {icon ? (
        <img
          src={icon}
          alt={label}
          className={`${iconClassName} object-contain opacity-70 hover:opacity-100`}
        />
      ) : (
        children
      )}
    </button>
  );
}
