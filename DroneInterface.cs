namespace Drones
{
    public class Location
    {
        public float Latitude { get; set; }
        public float Longitude { get; set; }

        public void SetLocation(float la, float lo)
        {
            Latitude = la;
            Longitude = lo;
        }
    }

    public interface IDrone
    {

        public int Id { get; set; }
        public Location CurrentLocation { get; set; }
        public float BatteryLevel { get; set; }
        float Altitude { get; set; }
        string Status { get; set; }
        float Speed { get; set; }
    }

    public interface ICivilianDrone : IDrone
    {
        string RegistrationNumber { get; set; }
    }

    public interface IMilitaryDrone : IDrone
    {
        string EncryptionKey { get; set; }
    }
}