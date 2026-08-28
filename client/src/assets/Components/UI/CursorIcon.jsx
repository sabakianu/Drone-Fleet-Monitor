import { useEffect, useRef } from "react";

export default function CursorIcon({
  cursor,
  scope = "[data-globe]",
  onCancel,
}) {
  const cancelRef = useRef(null);
  cancelRef.current = onCancel;

  useEffect(() => {
    const { image, hotspotX, hotspotY } = cursor;

    const style = document.createElement("style");
    style.textContent = `${scope}, ${scope} * {
      cursor: url("${image}") ${hotspotX} ${hotspotY}, crosshair !important;
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
  }, [cursor, scope]);

  return null;
}
