using System.Text.Json.Serialization;

namespace Drones
{
    public enum DroneStatus
    {
        [JsonStringEnumMemberName("offline")]
        Offline,

        [JsonStringEnumMemberName("online")]
        Online,

        [JsonStringEnumMemberName("crashed")]
        Crashed,
    }
}
