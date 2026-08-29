import NumberField from "./NumberField.jsx";

export default function SpeedFields({
  idPrefix,
  drone,
  horizontal,
  vertical,
  onHorizontalChange,
  onVerticalChange,
  invalidHorizontal = false,
  invalidVertical = false,
  disabled = false,
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <NumberField
        id={`${idPrefix}-horizontal-speed`}
        label="Horizontal"
        hint={`max ${drone.maxHorizontalSpeed}`}
        unit="km/h"
        value={horizontal}
        onChange={onHorizontalChange}
        min={1}
        max={drone.maxHorizontalSpeed}
        disabled={disabled}
        invalid={invalidHorizontal}
      />
      <NumberField
        id={`${idPrefix}-vertical-speed`}
        label="Vertical"
        hint={`max ${drone.maxVerticalSpeed}`}
        unit="m/s"
        value={vertical}
        onChange={onVerticalChange}
        min={1}
        max={drone.maxVerticalSpeed}
        disabled={disabled}
        invalid={invalidVertical}
      />
    </div>
  );
}
