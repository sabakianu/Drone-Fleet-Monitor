import IconButton from "./IconButton.jsx";

export default function SectionHeading({
  icon,
  iconLabel,
  onIconClick,
  children,
}) {
  return (
    <div className="flex items-center gap-2 mb-1">
      {icon &&
        (onIconClick ? (
          <IconButton
            icon={icon}
            label={iconLabel}
            iconClassName="w-5 h-5"
            className="p-0.5"
            onClick={onIconClick}
          />
        ) : (
          <img
            src={icon}
            alt=""
            className="w-5 h-5 object-contain opacity-70"
          />
        ))}

      <h3 className="text-sm font-semibold text-slate-700">{children}</h3>
    </div>
  );
}
