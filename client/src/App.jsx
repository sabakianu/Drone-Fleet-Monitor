import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import DronePanel from "./assets/Components/DronePanel.jsx";
import BasePanel from "./assets/Components/BasePanel.jsx";
import RenamePanel from "./assets/Components/RenamePanel.jsx";
import {
  fetchDrones,
  fetchBases,
  fetchBase,
  setDroneStatus,
  setDroneName,
  destroyDrone,
  setBaseStatus,
  setBaseName,
  decommissionBase,
} from "./assets/api.js";
import {
  createCamera,
  createControls,
  createRenderer,
  setupResize,
  animate,
} from "./assets/Scene/renderer.js";
import { setupGlobeScene, setupGlobeRotation } from "./assets/Scene/globe.js";
import {
  spawnDrone,
  spawnBase,
  findDroneSprite,
  findBaseMesh,
  removeDroneSprite,
  removeBaseMesh,
} from "./assets/Scene/markers.js";
import { setupHover, setupClick } from "./assets/Scene/interactions.js";

export default function App() {
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [selectedBase, setSelectedBase] = useState(null);

  const [renameTarget, setRenameTarget] = useState(null);
  const mountRef = useRef(null);
  const objectsRef = useRef([]);
  const globeRef = useRef(null);

  // sincronizează drona actualizată în panou, pe glob și în lista bazei
  const applyDroneUpdate = (updated) => {
    setSelectedDrone((current) =>
      current && current.id === updated.id ? updated : current,
    );

    const sprite = findDroneSprite(objectsRef.current, updated.id);
    if (sprite) sprite.userData.drone = updated;

    setSelectedBase((current) => {
      if (!current?.drones?.some((d) => d.id === updated.id)) return current;

      return {
        ...current,
        drones: current.drones.map((d) => (d.id === updated.id ? updated : d)),
      };
    });
  };

  const handleToggleDroneStatus = async (drone) => {
    const nextStatus = drone.status === "offline" ? "online" : "offline";
    applyDroneUpdate(await setDroneStatus(drone.id, nextStatus));
  };

  const openRenameDrone = (drone) => {
    setRenameTarget({
      kind: "drone",
      entity: drone,
      title: "Rename Drone",
      currentName: drone.name,
      placeholder: `Drone #${drone.id}`,
    });
  };

  const openRenameBase = (droneBase) => {
    setRenameTarget({
      kind: "base",
      entity: droneBase,
      title: "Rename Base",
      currentName: droneBase.name,
      placeholder: `Base #${droneBase.id}`,
    });
  };

  const handleRenameConfirm = async (name) => {
    const { kind, entity } = renameTarget;

    if (kind === "drone") {
      applyDroneUpdate(await setDroneName(entity.id, name));
    } else {
      applyBaseUpdate(await setBaseName(entity.id, name));
    }

    setRenameTarget(null);
  };

  const handleDestroyDrone = async (drone) => {
    await destroyDrone(drone.id);

    removeDroneSprite(objectsRef.current, drone.id);
    setSelectedDrone((current) =>
      current && current.id === drone.id ? null : current,
    );

    // contoarele bazei sunt calculate pe server -> reîncărcăm baza afectată
    const baseId = drone.droneBaseId;
    if (baseId == null) return;

    const refreshed = await fetchBase(baseId);

    const baseMesh = findBaseMesh(objectsRef.current, baseId);
    if (baseMesh) baseMesh.userData.droneBase = refreshed;

    setSelectedBase((current) =>
      current && current.id === baseId ? refreshed : current,
    );
  };

  // sincronizează baza actualizată în panou și pe glob
  const applyBaseUpdate = (updated) => {
    setSelectedBase((current) =>
      current && current.id === updated.id ? updated : current,
    );

    const baseMesh = findBaseMesh(objectsRef.current, updated.id);
    if (baseMesh) baseMesh.userData.droneBase = updated;
  };

  const handleToggleBaseStatus = async (droneBase) => {
    const nextStatus = droneBase.status === "offline" ? "online" : "offline";
    applyBaseUpdate(await setBaseStatus(droneBase.id, nextStatus));
  };

  // reciteste flota si aliniaza sprite-urile de pe glob cu ce zice serverul:
  // sterge ce nu mai exista, adauga ce a decolat, actualizeaza restul
  const syncDronesFromServer = async () => {
    const drones = await fetchDrones();
    const byId = new Map(drones.map((d) => [d.id, d]));

    objectsRef.current
      .filter(
        (obj) =>
          obj.userData.type === "drone" && !byId.has(obj.userData.drone.id),
      )
      .forEach((obj) =>
        removeDroneSprite(objectsRef.current, obj.userData.drone.id),
      );

    drones.forEach((drone) => {
      const sprite = findDroneSprite(objectsRef.current, drone.id);

      // dronele parcate in baza nu se randeaza pe glob
      if (drone.isInBase) {
        if (sprite) removeDroneSprite(objectsRef.current, drone.id);
        return;
      }

      if (sprite) {
        sprite.userData.drone = drone;
      } else if (globeRef.current) {
        spawnDrone(globeRef.current, drone, objectsRef.current);
      }
    });

    setSelectedDrone((current) =>
      current ? (byId.get(current.id) ?? null) : current,
    );
  };

  const handleDecommissionBase = async (droneBase) => {
    // dronele parcate sunt sterse pe server odata cu baza
    await decommissionBase(droneBase.id);

    removeBaseMesh(objectsRef.current, droneBase.id);
    setSelectedBase((current) =>
      current && current.id === droneBase.id ? null : current,
    );

    await syncDronesFromServer();
  };

  useEffect(() => {
    if (mountRef.current) {
      mountRef.current.innerHTML = "";
    }

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f5f5f5");
    const camera = createCamera(width, height);
    const renderer = createRenderer(width, height);

    mountRef.current.appendChild(renderer.domElement);

    renderer.render(scene, camera);

    const controls = createControls(camera, renderer);
    const resizeManager = setupResize(camera, renderer);

    // StrictMode monteaza efectul de doua ori: fetch-ul rulei vechi se poate
    // termina dupa cleanup, asa ca nu-l mai lasam sa populeze scena curenta
    let disposed = false;

    const objects = objectsRef.current;
    objects.length = 0;

    const hoverManager = setupHover(camera, renderer, objects);
    const clickManager = setupClick(
      camera,
      renderer,
      objects,
      (clickedObject) => {
        if (clickedObject.userData.type === "drone") {
          setSelectedDrone(clickedObject.userData.drone);
        } else if (clickedObject.userData.type === "base") {
          setSelectedBase(clickedObject.userData.droneBase);
        }
      },
    );

    const stopAnimation = animate(
      renderer,
      controls,
      scene,
      camera,
      hoverManager.updateHover,
    );

    Promise.all([setupGlobeScene(scene), fetchDrones(), fetchBases()])
      .then(([globe, droneList, baseList]) => {
        if (disposed) return;

        globeRef.current = globe;
        setupGlobeRotation(globe, renderer);
        resizeManager.setGlobe(globe);

        // dronele parcate în bază nu se randează pe glob
        droneList
          .filter((d) => !d.isInBase)
          .forEach((d) => spawnDrone(globe, d, objects));

        baseList.forEach((b) => spawnBase(globe, b, objects));
      })
      .catch((err) => console.error("failed to load fleet:", err));

    return () => {
      disposed = true;
      globeRef.current = null;
      stopAnimation();
      resizeManager.cleanup();
      hoverManager.cleanup();
      clickManager.cleanup();

      if (
        mountRef.current &&
        renderer.domElement &&
        mountRef.current.contains(renderer.domElement)
      ) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative  w-screen h-screen overflow-hidden">
      <div ref={mountRef} className="absolute top-0 left-0 w-full h-full z-0" />
      {selectedDrone && (
        <DronePanel
          drone={selectedDrone}
          onClose={() => setSelectedDrone(null)}
          onRename={openRenameDrone}
          onToggleStatus={handleToggleDroneStatus}
          onDestroy={handleDestroyDrone}
        />
      )}

      {selectedBase && (
        <BasePanel
          droneBase={selectedBase}
          onClose={() => setSelectedBase(null)}
          onDroneClick={setSelectedDrone}
          onRename={openRenameBase}
          onToggleStatus={handleToggleBaseStatus}
          onDecommission={handleDecommissionBase}
        />
      )}

      {renameTarget && (
        <RenamePanel
          title={renameTarget.title}
          currentName={renameTarget.currentName}
          placeholder={renameTarget.placeholder}
          onCancel={() => setRenameTarget(null)}
          onConfirm={handleRenameConfirm}
        />
      )}
    </div>
  );
}
