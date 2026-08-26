import { useRef } from "react";
import DronePanel from "./assets/Components/DronePanel.jsx";
import BasePanel from "./assets/Components/BasePanel.jsx";
import RenamePanel from "./assets/Components/RenamePanel.jsx";
import RelocatePanel from "./assets/Components/RelocatePanel.jsx";
import AddDronePanel from "./assets/Components/AddDronePanel.jsx";
import ConfirmPanel from "./assets/Components/ConfirmPanel.jsx";
import useGlobeScene from "./assets/Scene/useGlobeScene.js";
import useFleet from "./assets/useFleet.js";
import useDialogs from "./assets/useDialogs.js";

export default function App() {
  // sprite-urile si globul sunt partajate intre scena si actiunile pe flota
  const objectsRef = useRef([]);
  const globeRef = useRef(null);

  const fleet = useFleet({ objectsRef, globeRef });
  const dialogs = useDialogs(fleet);

  const mountRef = useGlobeScene({
    objectsRef,
    globeRef,
    onSelectDrone: fleet.setSelectedDrone,
    onSelectBase: fleet.setSelectedBase,
  });

  return (
    <div className="relative  w-screen h-screen overflow-hidden">
      <div ref={mountRef} className="absolute top-0 left-0 w-full h-full z-0" />

      {fleet.selectedDrone && (
        <DronePanel
          drone={fleet.selectedDrone}
          onClose={() => fleet.setSelectedDrone(null)}
          onRename={dialogs.openRenameDrone}
          onToggleStatus={fleet.toggleDroneStatus}
          onDestroy={dialogs.askDestroyDrone}
        />
      )}

      {fleet.selectedBase && (
        <BasePanel
          droneBase={fleet.selectedBase}
          onClose={() => fleet.setSelectedBase(null)}
          onDroneClick={fleet.setSelectedDrone}
          onRename={dialogs.openRenameBase}
          onAddDrone={dialogs.openAddDrone}
          onRelocateDrone={dialogs.openRelocateDrone}
          onToggleStatus={fleet.toggleBaseStatus}
          onDecommission={dialogs.askDecommissionBase}
        />
      )}

      {dialogs.renameTarget && (
        <RenamePanel
          title={dialogs.renameTarget.title}
          currentName={dialogs.renameTarget.currentName}
          placeholder={dialogs.renameTarget.placeholder}
          onCancel={dialogs.closeRename}
          onConfirm={dialogs.confirmRename}
        />
      )}

      {dialogs.relocateTarget && (
        <RelocatePanel
          drone={dialogs.relocateTarget.drone}
          bases={dialogs.relocateTarget.bases}
          onCancel={dialogs.closeRelocate}
          onConfirm={dialogs.confirmRelocate}
        />
      )}

      {dialogs.addDroneTarget && (
        <AddDronePanel
          droneBase={dialogs.addDroneTarget.droneBase}
          catalog={dialogs.addDroneTarget.catalog}
          onCancel={dialogs.closeAddDrone}
          onConfirm={dialogs.confirmAddDrone}
        />
      )}

      {dialogs.confirmTarget && (
        <ConfirmPanel
          title={dialogs.confirmTarget.title}
          message={dialogs.confirmTarget.message}
          confirmLabel={dialogs.confirmTarget.confirmLabel}
          onCancel={dialogs.closeConfirm}
          onConfirm={dialogs.confirmAction}
        />
      )}
    </div>
  );
}
