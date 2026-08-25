// optiune selectabila dintr-o lista (baze, modele de drona)
export default function OptionButton({
  selected = false,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      {...props}
      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border-2 text-left transition-colors disabled:cursor-not-allowed ${
        selected
          ? "bg-accent/10 border-accent"
          : "bg-white border-zinc-300 hover:border-slate-400 disabled:bg-zinc-100 disabled:border-zinc-200 disabled:hover:border-zinc-200"
      } ${className}`}
    />
  );
}
