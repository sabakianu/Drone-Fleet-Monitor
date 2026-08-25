import CloseButton from "../../Icons/CloseButton.png";
import IconButton from "./IconButton.jsx";

export default function Panel({
  side = "left",
  title,
  subtitle,
  image,
  imageAlt,
  caption,
  onClose,
  children,
}) {
  const sidePosition = side === "left" ? "left-2.25" : "right-2.25";

  return (
    <div
      className={`absolute top-3.5 bottom-4.5 ${sidePosition} w-80 z-50 bg-zinc-200 shadow-xl rounded-xl p-3 border-2 border-zinc-300 flex flex-col`}
    >
      <div className="relative flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl text-slate-700 font-semibold">{title}</h1>
          {subtitle && (
            <h2 className="text-sm text-slate-500 font-medium">{subtitle}</h2>
          )}
        </div>
        <IconButton icon={CloseButton} label="Close" onClick={onClose} />
      </div>

      <div className="h-36 w-full overflow-hidden rounded-lg">
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="text-sm text-slate-500 font-medium text-center mb-4">
        {caption}
      </div>

      {children}
    </div>
  );
}

export function PanelFooter({ error, children }) {
  return (
    <div className="mt-auto flex flex-col gap-2">
      {error && (
        <p className="text-xs font-medium text-red-600 wrap-break-word">
          {error}
        </p>
      )}
      {children}
    </div>
  );
}
