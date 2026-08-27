export function formatDistance(km) {
  return km < 10
    ? `${km.toFixed(1)} km`
    : `${Math.round(km).toLocaleString("en-US")} km`;
}

export function formatDuration(seconds) {
  const total = Math.round(seconds);

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${rest}s`;

  return `${rest}s`;
}
