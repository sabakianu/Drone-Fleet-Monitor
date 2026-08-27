namespace Drones
{
    public static class Distance
    {
        const double EarthRadiusKm = 6371.0;

        // haversine: distanta pe suprafata globului intre doua coordonate
        public static double BetweenKm(Location from, Location to)
        {
            var dLat = ToRadians(to.Latitude - from.Latitude);
            var dLon = ToRadians(to.Longitude - from.Longitude);
            var lat1 = ToRadians(from.Latitude);
            var lat2 = ToRadians(to.Latitude);

            var h = Math.Pow(Math.Sin(dLat / 2), 2)
                  + Math.Cos(lat1) * Math.Cos(lat2) * Math.Pow(Math.Sin(dLon / 2), 2);

            return 2 * EarthRadiusKm * Math.Asin(Math.Sqrt(h));
        }

        // urca/coboara pana la altitudinea ceruta, apoi zboara pe orizontala
        public static double TravelSeconds(
            Location from,
            Location to,
            float horizontalSpeedKmh,
            float verticalSpeedMs)
        {
            var cruiseSeconds = BetweenKm(from, to) / horizontalSpeedKmh * 3600.0;
            var climbSeconds = ClimbMeters(from, to) / verticalSpeedMs;

            return cruiseSeconds + climbSeconds;
        }

        public static float ClimbMeters(Location from, Location to) =>
            Math.Abs(to.Altitude - from.Altitude);

        static double ToRadians(double degrees) => degrees * Math.PI / 180.0;
    }
}
