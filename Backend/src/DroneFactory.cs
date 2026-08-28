namespace Drones
{
    public static class DroneFactory
    {
        public static BaseDrone FromModel(DroneModel model)
        {
            BaseDrone drone = model.Kind switch
            {
                DroneKind.Delivery => new DeliveryDrone(),
                DroneKind.Survey => new SurveyDrone(),
                DroneKind.Recon => new ReconDrone(),
                DroneKind.Combat => new CombatDrone(),
                _ => throw new ArgumentException("Unknown Drone Kind!"),
            };

            drone.DroneModel = model;
            return drone;
        }
    }
}
