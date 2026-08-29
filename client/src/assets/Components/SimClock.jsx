import { useEffect, useRef, useState } from "react";
import { fetchSimulationClock, setSimulationSpeed } from "../api.js";
import StopIcon from "../Icons/Stop.png";
import NormalSpeedIcon from "../Icons/NormalSpeed.png";
import DoubleSpeedIcon from "../Icons/DoubleSpeed.png";
import TripleSpeedIcon from "../Icons/TripleSpeed.png";

const SPEED_ICONS = [
  StopIcon,
  NormalSpeedIcon,
  DoubleSpeedIcon,
  TripleSpeedIcon,
];

const DAY_SECONDS = 24 * 3600;

const pad = (value) => String(Math.floor(value)).padStart(2, "0");

function formatClock(totalSeconds) {
  return [
    pad(totalSeconds / 3600),
    pad((totalSeconds % 3600) / 60),
    pad(totalSeconds % 60),
  ].join(":");
}

export default function SimClock({ shifted = false }) {
  const timeRef = useRef(null);

  const simRef = useRef(null);
  const rateRef = useRef(0);

  const [clock, setClock] = useState(null);
  const lastSpeedRef = useRef(1);

  const apply = (state) => {
    simRef.current = state.simSeconds;
    rateRef.current = state.simSecondsPerRealSecond;

    if (state.speed !== 0) lastSpeedRef.current = state.speed;

    setClock(state);
  };

  useEffect(() => {
    fetchSimulationClock()
      .then(apply)
      .catch((err) => console.error("failed to load clock:", err));
  }, []);

  useEffect(() => {
    let previous = performance.now();
    let frameId;

    const tick = () => {
      const current = performance.now();
      const delta = (current - previous) / 1000;
      previous = current;

      if (simRef.current !== null) {
        simRef.current =
          (simRef.current + delta * rateRef.current) % DAY_SECONDS;

        if (timeRef.current) {
          timeRef.current.textContent = formatClock(simRef.current);
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    tick();

    return () => cancelAnimationFrame(frameId);
  }, []);

  const pushSpeed = (value) =>
    setSimulationSpeed(value)
      .then(apply)
      .catch((err) => console.error("failed to set speed:", err));

  const togglePause = () =>
    pushSpeed(clock?.speed === 0 ? lastSpeedRef.current : 0);

  useEffect(() => {
    const handleKey = (event) => {
      const tag = event.target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        event.target.isContentEditable
      ) {
        return;
      }

      if (event.key === " ") {
        event.preventDefault();
        togglePause();
        return;
      }

      const index = Number(event.key);
      if (index >= 1 && index <= 3 && clock) {
        const speed = clock.speeds[index];
        if (speed !== undefined) pushSpeed(speed);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [clock]);

  return (
    <div
      className={`absolute top-3.5 left-2.25 z-40 w-48 bg-zinc-200 shadow-xl rounded-xl p-3 border-2 border-zinc-300 flex flex-col gap-2 transition-transform duration-300 ease-out ${
        shifted ? "translate-x-82.25" : ""
      }`}
    >
      <span
        ref={timeRef}
        className="block text-center font-digital text-3xl leading-none tracking-wider text-slate-800"
      >
        --:--:--
      </span>

      <div className="flex gap-1.5">
        {(clock?.speeds ?? []).map((value, index) => {
          const selected = clock.speed === value;

          return (
            <button
              key={value}
              type="button"
              title={
                value === 0 ? "Pause (Space)" : `${value}× speed (${index})`
              }
              aria-label={value === 0 ? "Pause" : `${value}x speed`}
              aria-pressed={selected}
              onClick={() => (value === 0 ? togglePause() : pushSpeed(value))}
              className={`flex-1 flex items-center justify-center py-1 rounded-md border-2 transition-colors ${
                selected
                  ? "bg-accent/10 border-accent"
                  : "bg-white border-zinc-300 hover:border-slate-400"
              }`}
            >
              <img
                src={SPEED_ICONS[index] ?? TripleSpeedIcon}
                alt=""
                className={`w-4 h-4 object-contain ${
                  selected ? "opacity-100" : "opacity-60"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
