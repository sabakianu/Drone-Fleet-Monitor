import { useRef } from "react";
import DronePanel from "./assets/Components/DronePanel.jsx";
import BasePanel from "./assets/Components/BasePanel.jsx";
import RenamePanel from "./assets/Components/RenamePanel.jsx";
import RelocatePanel from "./assets/Components/RelocatePanel.jsx";
import AddDronePanel from "./assets/Components/AddDronePanel.jsx";
import ConfirmPanel from "./assets/Components/ConfirmPanel.jsx";
import MovePanel from "./assets/Components/MovePanel.jsx";
import AddBasePanel from "./assets/Components/AddBasePanel.jsx";
import SimClock from "./assets/Components/SimClock.jsx";
import ActionButton from "./assets/Components/UI/ActionButton.jsx";
import CursorIcon from "./assets/Components/UI/CursorIcon.jsx";
import { RelocateCursor, LocationCursor } from "./assets/cursors.js";
import useGlobeScene from "./assets/Scene/useGlobeScene.js";
import useGlobeMarkers from "./assets/Scene/useGlobeMarkers.js";
import { centerGlobeOn } from "./assets/Scene/globe.js";
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
    onGlobeClick: dialogs.handleGlobeClick,
  });

  useGlobeMarkers({ globeRef, markers: dialogs.globeMarkers });

  // globul poate lipsi pana se incarca harta
  const centerOn = (location) => {
    if (globeRef.current) centerGlobeOn(globeRef.current, location);
  };

  return (
    <div className="relative  w-screen h-screen overflow-hidden">
      <div
        ref={mountRef}
        data-globe
        className="absolute top-0 left-0 w-full h-full z-0"
      />

      <SimClock shifted={fleet.selectedDrone !== null} />

      <div
        className={`absolute bottom-4.5 right-2.25 z-40 flex transition-transform duration-300 ease-out ${
          fleet.selectedBase !== null ? "-translate-x-82.25" : ""
        }`}
      >
        <ActionButton
          variant="dark"
          grow={false}
          className="px-4"
          onClick={dialogs.startAddBase}
        >
          Add Base
        </ActionButton>
      </div>

      {fleet.selectedDrone && (
        <DronePanel
          drone={fleet.selectedDrone}
          onClose={() => fleet.setSelectedDrone(null)}
          onRename={dialogs.openRenameDrone}
          onToggleStatus={fleet.toggleDroneStatus}
          onMove={dialogs.startMove}
          onCenterLocation={centerOn}
          onCancelOrder={
            dialogs.hasOrderFor(fleet.selectedDrone.id)
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
          onCenterLocation={centerOn}
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

      {dialogs.addBasePlan && (
        <AddBasePanel
          location={dialogs.addBasePlan.location}
          onLocationChange={dialogs.updateAddBaseLocation}
          onCancel={dialogs.closeAddBase}
          onConfirm={dialogs.confirmAddBase}
        />
      )}

      {dialogs.moveTarget && (
        <CursorIcon cursor={RelocateCursor} onCancel={dialogs.cancelMove} />
      )}

      {dialogs.addingBase && (
        <CursorIcon cursor={LocationCursor} onCancel={dialogs.cancelAddBase} />
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
