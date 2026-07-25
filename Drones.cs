namespace Drones
{
    public class DeliveryDrone : CivilianDrone
    {
        public string RegistrationNumber { get; set; } = "";
    }
    public class SurveyDrone : CivilianDrone
    {
        public string RegistrationNumber { get; set; } = "";
    }

    public class ReconDrone : MilitaryDrone
    {
        public string EncryptionKey { get; set; } = "";
    }
    public class CombatDrone : MilitaryDrone
    {
        public string EncryptionKey { get; set; } = "";

    }
}