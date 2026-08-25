// mock: pana cand backendul expune catalogul, specificatiile stau aici.
// "model" e exact ce asteapta POST /api/bases/{id}/drones?type=
export const DRONE_CATALOG = [
  {
    model: "Wingcopter198",
    kind: "Delivery",
    category: "Civilian",
    maxHorizontalSpeed: 240,
    maxVerticalSpeed: 15,
    batteryCapacity: 12000,
  },
  {
    model: "MatternetM2",
    kind: "Delivery",
    category: "Civilian",
    maxHorizontalSpeed: 70,
    maxVerticalSpeed: 5,
    batteryCapacity: 5000,
  },
  {
    model: "Phantom4RTK",
    kind: "Survey",
    category: "Civilian",
    maxHorizontalSpeed: 72,
    maxVerticalSpeed: 6,
    batteryCapacity: 5870,
  },
  {
    model: "MavicEnterprise",
    kind: "Survey",
    category: "Civilian",
    maxHorizontalSpeed: 72,
    maxVerticalSpeed: 6,
    batteryCapacity: 5000,
  },
  {
    model: "BayraktarTB2",
    kind: "Recon",
    category: "Military",
    maxHorizontalSpeed: 220,
    maxVerticalSpeed: 12,
    batteryCapacity: 20000,
  },
  {
    model: "Heron1",
    kind: "Recon",
    category: "Military",
    maxHorizontalSpeed: 207,
    maxVerticalSpeed: 10,
    batteryCapacity: 25000,
  },
  {
    model: "MQ9Reaper",
    kind: "Combat",
    category: "Military",
    maxHorizontalSpeed: 482,
    maxVerticalSpeed: 25,
    batteryCapacity: 30000,
  },
  {
    model: "BayraktarAkinci",
    kind: "Combat",
    category: "Military",
    maxHorizontalSpeed: 361,
    maxVerticalSpeed: 20,
    batteryCapacity: 28000,
  },
];

// categoria e impusa de baza, deci felurile vin deja filtrate
export function kindsFor(category) {
  return [
    ...new Set(
      DRONE_CATALOG.filter((entry) => entry.category === category).map(
        (entry) => entry.kind,
      ),
    ),
  ];
}

export function modelsFor(category, kind) {
  return DRONE_CATALOG.filter(
    (entry) => entry.category === category && entry.kind === kind,
  );
}
