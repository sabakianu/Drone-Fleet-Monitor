async function request(method, url) {
  const res = await fetch(url, { method });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${method} ${url} -> ${res.status} ${detail}`.trim());
  }

  return res.json();
}

export function fetchSimulationClock() {
  return request("GET", "/api/simulation/clock");
}

export function setSimulationSpeed(value) {
  return request("PUT", `/api/simulation/speed?value=${value}`);
}

export function fetchDrones() {
  return request("GET", "/api/drones");
}

export function fetchBases() {
  return request("GET", "/api/bases");
}

// specificatiile modelelor
export function fetchDroneCatalog() {
  return request("GET", "/api/drones/catalog");
}

export function fetchBase(id) {
  return request("GET", `/api/bases/${id}`);
}

export function setDroneStatus(id, status) {
  return request("PUT", `/api/drones/${id}/status?status=${status}`);
}

export function setDroneName(id, name) {
  return request(
    "PUT",
    `/api/drones/${id}/name?name=${encodeURIComponent(name)}`,
  );
}

// schimba doar baza de care apartine drona, nu si pozitia ei
export function relocateDrone(id, baseId) {
  return request("PUT", `/api/drones/${id}/base?baseId=${baseId}`);
}

export function fetchDroneTrip(id, plan) {
  const query = new URLSearchParams({
    latitude: plan.latitude,
    longitude: plan.longitude,
    altitude: plan.altitude,
    horizontalSpeed: plan.horizontalSpeed,
    verticalSpeed: plan.verticalSpeed,
  });

  return request("GET", `/api/drones/${id}/trip?${query}`);
}

export function fetchDroneDistances(id) {
  return request("GET", `/api/drones/${id}/distances`);
}

export function destroyDrone(id) {
  return request("DELETE", `/api/drones/${id}`);
}

export function addDrone(baseId, model, name = "") {
  const nameParam = name ? `&name=${encodeURIComponent(name)}` : "";

  return request(
    "POST",
    `/api/bases/${baseId}/drones?type=${encodeURIComponent(model)}${nameParam}`,
  );
}

export function setBaseStatus(id, status) {
  return request("PUT", `/api/bases/${id}/status?status=${status}`);
}

export function setBaseName(id, name) {
  return request(
    "PUT",
    `/api/bases/${id}/name?name=${encodeURIComponent(name)}`,
  );
}

export function decommissionBase(id) {
  return request("DELETE", `/api/bases/${id}`);
}
