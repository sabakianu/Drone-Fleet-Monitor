namespace Drones
{
    public class DroneFactory
    {
        private readonly DroneContext _context;

        public DroneFactory(DroneContext context)
        {
            _context = context;
        }

        public IDrone CreateDrone(string type)
        {
            BaseDrone newDrone;
            switch (type.ToLower())
            {
                case "delivery":
                    newDrone = new DeliveryDrone();
                    break;

                case "survey":
                    newDrone = new SurveyDrone();

                    break;

                case "recon":
                    newDrone = new ReconDrone();
                    break;

                case "combat":
                    newDrone = new CombatDrone();
                    break;

                default:
                    throw new ArgumentException("Unknown Drone!");
            }

            _context.Drones.Add(newDrone);
            _context.SaveChanges();

            return newDrone;
        }
    }
}