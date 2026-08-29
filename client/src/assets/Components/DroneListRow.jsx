import BatteryIcon from "../Icons/Battery.png";
import RelocateIcon from "../Icons/Relocate.png";
import IconButton from "./UI/IconButton.jsx";

export default function DroneListRow({
  drone,
  index,
  onClick,
  onRelocate,
  disabled = false,
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between bg-zinc-300/60 p-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:bg-zinc-300 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] active:shadow-none"
    >
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-400 w-3">
          {index + 1}
        </span>

        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700 leading-tight">
            {drone.name || `Drone #${drone.id}`}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {drone.model}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <img
            src={BatteryIcon}
            alt="Battery"
            className="w-4 h-4 object-contain opacity-80"
          />
          <span className="text-sm font-bold text-slate-800">
            {Math.round(drone.batteryLevel)}%
          </span>
        </div>

        <IconButton
          icon={RelocateIcon}
          label="Relocate drone"
          iconClassName="w-4 h-4"
          className="p-1"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onRelocate();
          }}
        />
      </div>
    </div>
  );
}
