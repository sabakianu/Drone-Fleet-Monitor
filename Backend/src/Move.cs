namespace Drones
{
    public record MovePlan(
        float Latitude,
        float Longitude,
        float Altitude,
        float HorizontalSpeed,
        float VerticalSpeed,
        int? ParkAtBaseId = null
    );

    public static class Move
    {
        public const float MinimumFlightAltitude = 1f;

        public const float SurvivableAltitude = 3f;

        public const double LandingRadiusKm = 100.0;

        public static bool SurvivesFall(Location location) =>
            location.Altitude <= SurvivableAltitude;

        public static DroneBase? BaseInRange(Location location, IEnumerable<DroneBase> bases) =>
            bases.FirstOrDefault(b =>
                !b.IsParkingFull
                && Distance.BetweenKm(location, b.CurrentLocation) <= LandingRadiusKm);

        public static void Fall(BaseDrone drone, IEnumerable<DroneBase> bases)
        {
            drone.CurrentSpeed.SetSpeed(0f, 0f);

            var survives = SurvivesFall(drone.CurrentLocation);
            drone.CurrentLocation.Altitude = 0f;

            if (!survives)
            {
                drone.Status = "crashed";
                return;
            }

            drone.Status = "offline";

            var landingBase = BaseInRange(drone.CurrentLocation, bases);
            if (landingBase != null) drone.ParkedAtBaseId = landingBase.Id;
        }

        const double ArrivalKm = 0.001;
        const float ArrivalMeters = 0.1f;

        public static bool HasArrived(Location current, MovePlan plan) =>
            Distance.BetweenKm(current, Destination(plan)) <= ArrivalKm
            && Math.Abs(plan.Altitude - current.Altitude) <= ArrivalMeters;

        public static Location Destination(MovePlan plan)
        {
            var destination = new Location();
            destination.SetLocation(plan.Latitude, plan.Longitude, plan.Altitude);

            return destination;
        }

        public static void Step(Location current, MovePlan plan, double simSeconds)
        {
            StepHorizontally(current, plan, simSeconds);

            var arrived = Distance.BetweenKm(current, Destination(plan)) <= ArrivalKm;
            var target = arrived
                ? plan.Altitude
                : Math.Max(plan.Altitude, MinimumFlightAltitude);

            StepVertically(current, target, plan.VerticalSpeed, simSeconds);
        }

        static void StepHorizontally(Location current, MovePlan plan, double simSeconds)
        {
            var remaining = Distance.BetweenKm(current, Destination(plan));

            if (remaining <= ArrivalKm)
            {
                current.Latitude = plan.Latitude;
                current.Longitude = plan.Longitude;
                return;
            }

            var step = plan.HorizontalSpeed * simSeconds / 3600.0;

            if (step >= remaining)
            {
                current.Latitude = plan.Latitude;
                current.Longitude = plan.Longitude;
                return;
            }

            Interpolate(current, plan, step / remaining);
        }

        static void StepVertically(
            Location current, float target, float verticalSpeed, double simSeconds)
        {
            var remaining = target - current.Altitude;

            if (Math.Abs(remaining) <= ArrivalMeters)
            {
                current.Altitude = target;
                return;
            }

            var step = (float)(verticalSpeed * simSeconds);

            current.Altitude = Math.Abs(remaining) <= step
                ? target
                : current.Altitude + Math.Sign(remaining) * step;
        }

        static void Interpolate(Location current, MovePlan plan, double fraction)
        {
            var (ax, ay, az) = ToUnitVector(current.Latitude, current.Longitude);
            var (bx, by, bz) = ToUnitVector(plan.Latitude, plan.Longitude);

            var dot = Math.Clamp(ax * bx + ay * by + az * bz, -1.0, 1.0);
            var omega = Math.Acos(dot);
            var sinOmega = Math.Sin(omega);

            if (sinOmega < 1e-9)
            {
                current.Latitude = plan.Latitude;
                current.Longitude = plan.Longitude;
                return;
            }

            var scaleA = Math.Sin((1 - fraction) * omega) / sinOmega;
            var scaleB = Math.Sin(fraction * omega) / sinOmega;

            var x = scaleA * ax + scaleB * bx;
            var y = scaleA * ay + scaleB * by;
            var z = scaleA * az + scaleB * bz;

            current.Latitude = (float)(Math.Asin(Math.Clamp(z, -1.0, 1.0)) * 180.0 / Math.PI);
            current.Longitude = (float)(Math.Atan2(y, x) * 180.0 / Math.PI);
        }

        static (double X, double Y, double Z) ToUnitVector(double latitude, double longitude)
        {
            var lat = latitude * Math.PI / 180.0;
            var lon = longitude * Math.PI / 180.0;

            return (
                Math.Cos(lat) * Math.Cos(lon),
                Math.Cos(lat) * Math.Sin(lon),
                Math.Sin(lat));
        }
    }
}
