namespace Drones
{
    public class DroneFactory
    {
        private int _idCurent = 0;
        public IDrone CreateDrone(string type)
        {
            _idCurent++;

            switch (type.ToLower())
            {
                case "delivery":
                    return new DeliveryDrone
                    {
                        Id = _idCurent
                    };
                case "survey":
                    return new SurveyDrone
                    {
                        Id = _idCurent
                    };
                case "recon":
                    return new ReconDrone
                    {
                        Id = _idCurent
                    };
                case "combat":
                    return new CombatDrone
                    {
                        Id = _idCurent
                    };
                default:
                    throw new ArgumentException("Unknown Drone!");
            }
        }
    }
}