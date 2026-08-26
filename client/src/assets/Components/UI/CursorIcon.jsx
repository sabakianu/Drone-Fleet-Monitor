import { useEffect, useRef } from "react";

// transforma cursorul in ala de ales la relocat
export default function CursorIcon({
  cursor,
  hotspotX = 0,
  hotspotY = 0,
  onCancel,
}) {
  const cancelRef = useRef(null);
  cancelRef.current = onCancel;

  useEffect(() => {
    // !important bate si cursorul pus inline pe canvas de interactions.js,
    const style = document.createElement("style");
    style.textContent = `*, *::before, *::after {
      cursor: url("${cursor}") ${hotspotX} ${hotspotY}, crosshair !important;
    }`;
    document.head.appendChild(style);

    const handleKey = (event) => event.key === "Escape" && cancelRef.current();

    window.addEventListener("keydown", handleKey);

    return () => {
      style.remove();
      window.removeEventListener("keydown", handleKey);
    };
  }, [cursor, hotspotX, hotspotY]);

  return null;
}
