namespace Drones
{
    public abstract class DeliveryDrone : CivilianDrone
    {
        protected DeliveryDrone()
        {
            Kind = DroneKind.Delivery;
        }
    }

    public abstract class SurveyDrone : CivilianDrone
    {
        protected SurveyDrone()
        {
            Kind = DroneKind.Survey;
        }
    }

    public abstract class ReconDrone : MilitaryDrone
    {
        protected ReconDrone()
        {
            Kind = DroneKind.Recon;
        }
    }

    public abstract class CombatDrone : MilitaryDrone
    {
        protected CombatDrone()
        {
            Kind = DroneKind.Combat;
        }
    }
}
