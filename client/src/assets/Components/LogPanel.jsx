import { useEffect, useRef, useState } from "react";
import { fetchLog } from "../api.js";

const POLL_MS = 1000;
const MAX_ENTRIES = 200;

const KIND_COLOR = {
  crashed: "text-cancel-deep",
  destroyed: "text-cancel-deep",
  takeoff: "text-accent-deep",
  arrived: "text-accent-deep",
  parked: "text-confirm-deep",
  landed: "text-confirm-deep",
};

export default function LogPanel() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState([]);

  const cursorRef = useRef(0);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    let stopped = false;

    const poll = async () => {
      try {
        const fresh = await fetchLog(cursorRef.current);
        if (stopped || fresh.length === 0) return;

        cursorRef.current = fresh[fresh.length - 1].id;
        setEntries((current) => [...current, ...fresh].slice(-MAX_ENTRIES));
      } catch (err) {
        console.error("failed to load log:", err);
      }
    };

    poll();
    const timer = setInterval(poll, POLL_MS);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [open]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [entries]);

  return (
    <div className="absolute bottom-4.5 left-86 right-86 z-40 flex flex-col items-center pointer-events-none">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        title={open ? "Hide log" : "Show log"}
        aria-expanded={open}
        className={`pointer-events-auto px-6 py-0.5 bg-zinc-200 border-2 border-zinc-300 text-slate-500 hover:text-slate-800 font-bold leading-none transition-colors ${
          open ? "rounded-t-xl border-b-0" : "rounded-xl shadow-xl"
        }`}
      >
        {open ? "▼" : "▲"}
      </button>

      <div
        className={`w-full max-w-3xl overflow-hidden transition-[max-height] duration-300 ease-out ${
          open ? "max-h-72" : "max-h-0"
        }`}
      >
        <div className="pointer-events-auto bg-zinc-200 shadow-xl rounded-xl rounded-t-none border-2 border-t-0 border-zinc-300 p-3">
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-400"
          >
            {entries.length === 0 && (
              <p className="text-xs text-slate-500 italic">
                Nothing logged yet.
              </p>
            )}

            {entries.map((entry) => (
              <p key={entry.id} className="text-xs text-slate-600">
                <span className="font-digital text-slate-500">
                  {entry.time}
                </span>{" "}
                <span
                  className={`font-semibold ${KIND_COLOR[entry.kind] ?? "text-slate-700"}`}
                >
                  {entry.message}
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
