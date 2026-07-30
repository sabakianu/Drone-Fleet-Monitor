import droneImg from "../hero.png";
import CloseButton from "../CloseButton.png";

export default function DronePanel({ onClose }) {
  return (
    <div className="absolute top-3.5 bottom-4.5 left-2.25 w-80 z-50 bg-zinc-200 shadow-xl rounded-xl p-3 border-2 border-zinc-300 flex flex-col">
      <div className="relative flex items-center justify-between mb-4">
        <h1 className="text-xl text-slate-700 font-semibold text-center">
          Nume Drona Test
        </h1>
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
    </div>
  );
}
