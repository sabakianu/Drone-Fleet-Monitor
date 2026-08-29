import { useEffect, useRef } from "react";
import DronePanel from "./assets/Components/DronePanel.jsx";
import BasePanel from "./assets/Components/BasePanel.jsx";
import RenamePanel from "./assets/Components/RenamePanel.jsx";
import RelocatePanel from "./assets/Components/RelocatePanel.jsx";
import AddDronePanel from "./assets/Components/AddDronePanel.jsx";
import ConfirmPanel from "./assets/Components/ConfirmPanel.jsx";
import MovePanel from "./assets/Components/MovePanel.jsx";
import AddBasePanel from "./assets/Components/AddBasePanel.jsx";
import AltitudePanel from "./assets/Components/AltitudePanel.jsx";
import SimClock from "./assets/Components/SimClock.jsx";
import ActionButton from "./assets/Components/UI/ActionButton.jsx";
import CursorIcon from "./assets/Components/UI/CursorIcon.jsx";
import { RelocateCursor, LocationCursor } from "./assets/cursors.js";
import useGlobeScene from "./assets/Scene/useGlobeScene.js";
import useGlobeMarkers from "./assets/Scene/useGlobeMarkers.js";
import { centerGlobeOn } from "./assets/Scene/globe.js";
import useFleet from "./assets/useFleet.js";
import useMarkers from "./assets/dialogs/useMarkers.js";
import useFlightOrders from "./assets/dialogs/useFlightOrders.js";
import useBaseCreation from "./assets/dialogs/useBaseCreation.js";
import useEntityDialogs from "./assets/dialogs/useEntityDialogs.js";
import useConfirm from "./assets/dialogs/useConfirm.js";

export default function App() {
  const objectsRef = useRef([]);
  const globeRef = useRef(null);

  const fleet = useFleet({ objectsRef, globeRef });
  const markers = useMarkers();
  const flight = useFlightOrders(fleet, markers);
  const newBase = useBaseCreation(fleet, markers);
  const dialogs = useEntityDialogs(fleet);
  const confirm = useConfirm(fleet);

  const picking = flight.moveTarget !== null || newBase.picking;

  const handleGlobeClick = (geo) => {
    if (flight.moveTarget !== null) return flight.pickDestination(geo);
    if (newBase.picking) return newBase.pickLocation(geo);
  };

  const cancelPick = () => {
    flight.cancelMove();
    newBase.cancel();
  };

  const mountRef = useGlobeScene({
    objectsRef,
    globeRef,
    onSelectDrone: fleet.setSelectedDrone,
    onSelectBase: fleet.setSelectedBase,
    onGlobeClick: handleGlobeClick,
    picking: picking,
    onCancelPick: cancelPick,
  });

  useGlobeMarkers({
    globeRef,
    markers: markers.list,
    drones: fleet.drones,
  });

  useEffect(() => {
    markers.dropArrived(fleet.drones);
  }, [fleet.drones]);

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
          onClick={newBase.start}
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
          onMove={flight.startMove}
          onCenterLocation={centerOn}
          onChangeAltitude={flight.openChangeAltitude}
          onTowBack={fleet.towDrone}
          onOpenBase={fleet.openBase}
          onCancelOrder={
            flight.hasOrderFor(fleet.selectedDrone.id)
              ? () => flight.cancelOrder(fleet.selectedDrone)
              : null
          }
          onDestroy={confirm.askDestroyDrone}
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
          onDecommission={confirm.askDecommissionBase}
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

      {flight.movePlan && (
        <MovePanel
          drone={flight.movePlan.drone}
          destination={flight.movePlan.destination}
          onDestinationChange={flight.updateDestination}
          onCancel={flight.closeMove}
          onConfirm={flight.confirmMove}
        />
      )}

      {flight.altitudeTarget && (
        <AltitudePanel
          drone={flight.altitudeTarget.drone}
          onCancel={flight.closeAltitude}
          onConfirm={flight.confirmAltitude}
        />
      )}

      {newBase.plan && (
        <AddBasePanel
          location={newBase.plan.location}
          onLocationChange={newBase.updateLocation}
          onCancel={newBase.close}
          onConfirm={newBase.confirm}
        />
      )}

      {flight.moveTarget && (
        <CursorIcon cursor={RelocateCursor} onCancel={flight.cancelMove} />
      )}

      {newBase.picking && (
        <CursorIcon cursor={LocationCursor} onCancel={newBase.cancel} />
      )}

      {confirm.target && (
        <ConfirmPanel
          title={confirm.target.title}
          message={confirm.target.message}
          confirmLabel={confirm.target.confirmLabel}
          onCancel={confirm.close}
          onConfirm={confirm.confirm}
        />
      )}
    </div>
  );
}
