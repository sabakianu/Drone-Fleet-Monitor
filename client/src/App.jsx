import { useRef } from "react";
import DronePanel from "./assets/Components/DronePanel.jsx";
import BasePanel from "./assets/Components/BasePanel.jsx";
import RenamePanel from "./assets/Components/RenamePanel.jsx";
import RelocatePanel from "./assets/Components/RelocatePanel.jsx";
import AddDronePanel from "./assets/Components/AddDronePanel.jsx";
import ConfirmPanel from "./assets/Components/ConfirmPanel.jsx";
import MovePanel from "./assets/Components/MovePanel.jsx";
import SimClock from "./assets/Components/SimClock.jsx";
import CursorIcon from "./assets/Components/UI/CursorIcon.jsx";
import RelocateCursor from "./assets/Icons/CursorRelocate.png";
import useGlobeScene from "./assets/Scene/useGlobeScene.js";
import useMoveTargets from "./assets/Scene/useMoveTargets.js";
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
    onGlobeClick: dialogs.pickMoveDestination,
  });

  useMoveTargets({ globeRef, orders: dialogs.moveOrders });

  return (
    <div className="relative  w-screen h-screen overflow-hidden">
      <div
        ref={mountRef}
        data-globe
        className="absolute top-0 left-0 w-full h-full z-0"
      />

      <SimClock shifted={fleet.selectedDrone !== null} />

      {fleet.selectedDrone && (
        <DronePanel
          drone={fleet.selectedDrone}
          onClose={() => fleet.setSelectedDrone(null)}
          onRename={dialogs.openRenameDrone}
          onToggleStatus={fleet.toggleDroneStatus}
          onMove={dialogs.startMove}
          onCancelOrder={
            dialogs.moveOrders.some(
              (order) => order.droneId === fleet.selectedDrone.id,
            )
              ? () => dialogs.cancelOrder(fleet.selectedDrone.id)
              : null
          }
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
          distances={dialogs.relocateTarget.distances}
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

      {dialogs.movePlan && (
        <MovePanel
          drone={dialogs.movePlan.drone}
          destination={dialogs.movePlan.destination}
          onDestinationChange={dialogs.updateMoveDestination}
          onCancel={dialogs.closeMove}
          onConfirm={dialogs.confirmMove}
        />
      )}

      {dialogs.moveTarget && (
        <CursorIcon
          cursor={RelocateCursor}
          hotspotX={8}
          hotspotY={16}
          onCancel={dialogs.cancelMove}
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
