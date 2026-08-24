async function request(method, url) {
  const res = await fetch(url, { method });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${method} ${url} -> ${res.status} ${detail}`.trim());
  }

  return res.json();
}

export function fetchDrones() {
  return request("GET", "/api/drones");
}

export function fetchBases() {
  return request("GET", "/api/bases");
}

export function fetchBase(id) {
  return request("GET", `/api/bases/${id}`);
}

export function setDroneStatus(id, status) {
  return request("PUT", `/api/drones/${id}/status?status=${status}`);
}

export function destroyDrone(id) {
  return request("DELETE", `/api/drones/${id}`);
}

export function setBaseStatus(id, status) {
  return request("PUT", `/api/bases/${id}/status?status=${status}`);
}

export function decommissionBase(id) {
  return request("DELETE", `/api/bases/${id}`);
}
