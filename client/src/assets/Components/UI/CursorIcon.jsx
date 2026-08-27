import { useEffect, useRef } from "react";

export default function CursorIcon({
  cursor,
  hotspotX = 0,
  hotspotY = 0,
  scope = "[data-globe]",
  onCancel,
}) {
  const cancelRef = useRef(null);
  cancelRef.current = onCancel;

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `${scope}, ${scope} * {
      cursor: url("${cursor}") ${hotspotX} ${hotspotY}, crosshair !important;
    }`;
    document.head.appendChild(style);

    const handleKey = (event) => event.key === "Escape" && cancelRef.current();

    const handleContextMenu = (event) => {
      event.preventDefault();
      cancelRef.current();
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      style.remove();
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [cursor, hotspotX, hotspotY, scope]);

  return null;
}
