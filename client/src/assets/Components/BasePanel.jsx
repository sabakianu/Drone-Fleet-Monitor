import droneImg from "../hero.png";
import CloseButton from "../CloseButton.png";
import LocationIcon from "../Location.png";
import BatteryIcon from "../Battery.png";

export default function BasePanel({ droneBase, onClose, onDroneClick }) {
  const drones = droneBase.drones ?? [];

  return (
    <div className="absolute top-3.5 bottom-4.5 right-2.25 w-80 z-50 bg-zinc-200 shadow-xl rounded-xl p-3 border-2 border-zinc-300 flex flex-col">
      <div className="relative flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl text-slate-700 font-semibold">
            {droneBase.name || `Base #${droneBase.id}`}
          </h1>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-800 font-bold px-2 py-1 rounded-lg hover:bg-slate-300/60 transition-colors"
        >
          <img
            src={CloseButton}
            alt="Close"
            className="w-6 h-6 object-contain opacity-70 hover:opacity-100"
          />
        </button>
      </div>

      <div className="h-36 w-full overflow-hidden rounded-lg">
        <img src={droneImg} alt="Hero" className="w-full h-full object-cover" />
      </div>

      <div className="text-sm text-slate-500 font-medium text-center mb-4">
        {droneBase.category} Base
      </div>

      {/* locatie */}
      <div className="flex flex-col gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img
              src={LocationIcon}
              alt="Location"
              className="w-5 h-5 object-contain opacity-70"
            />
            <h3 className="text-sm font-semibold text-slate-700">Location:</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600 pl-7">
            <p>
              Lat:{" "}
              <span className="font-bold text-slate-800">
                {droneBase.currentLocation.latitude.toFixed(4)}
              </span>
            </p>
            <div className="w-px h-3 bg-slate-300"></div>{" "}
            <p>
              Long:{" "}
              <span className="font-bold text-slate-800">
                {droneBase.currentLocation.longitude.toFixed(4)}
              </span>
            </p>
          </div>
        </div>

        {/* capacitate */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">
            Capacity:
          </h3>
          <div className="text-sm text-slate-600 pl-7">
            <span className="font-bold text-slate-800">
              {droneBase.droneCount} / {droneBase.maxDroneCapacity}
            </span>{" "}
            <span className="text-xs text-slate-500">drones</span>
            {droneBase.isFull && (
              <span className="ml-2 text-xs font-bold text-red-600">FULL</span>
            )}
          </div>
        </div>
      </div>

      {/*lista drone*/}
      <div className="flex-1 min-h-0 flex flex-col mb-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">
          Assigned Drones:
        </h3>

        {/* Containerul care face scroll dacă sunt prea multe */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-400">
          {drones.length === 0 && (
            <p className="text-xs text-slate-500 italic">No drones assigned.</p>
          )}

          {drones.map((drone, index) => (
            <div
              key={drone.id}
              onClick={() => onDroneClick(drone)}
              className="flex items-center justify-between bg-zinc-300/60 p-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out hover:bg-zinc-300 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] active:shadow-none"
            >
              <div className="flex items-center gap-3">
                {/* index */}
                <span className="text-xs font-bold text-slate-400 w-3">
                  {index + 1}
                </span>

                {/* name/model */}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 leading-tight">
                    {drone.name || `Drone #${drone.id}`}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {drone.model}
                  </span>
                </div>
              </div>

              {/* battery*/}
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
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <button
          disabled={droneBase.isFull}
          className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors text-sm"
        >
          Add Drone
        </button>
        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm">
          Decommission Base
        </button>
      </div>
    </div>
  );
}
