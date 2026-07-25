using System.Collections.Generic;
using System.Linq; //pt cautare

namespace Drones
{
    public class DroneManager
    {
        //private List<ICivilianDrone> _CivilianDroneList;
        //private List<IMilitaryDrone> _MilitaryDroneList;
        private DroneFactory _factory;
        private readonly DroneContext _context;

        public DroneManager(DroneContext context)
        {
            _context = context;
            //_CivilianDroneList = new List<ICivilianDrone>();
            //_MilitaryDroneList = new List<IMilitaryDrone>();
            _factory = new DroneFactory(_context);
        }

        public void AddDrone(string type)
        {
            IDrone newDrone = _factory.CreateDrone(type);
        }

        // public List<ICivilianDrone> GetAllCivilianDrones()
        // {
        //     return _CivilianDroneList;
        // }

        // public List<IMilitaryDrone> GetAllMilitaryDrones()
        // {
        //     return _MilitaryDroneList;
        // }

        // public List<IDrone> GetAllDrones()
        // {
        //     List<IDrone> AllDrones = [.. _CivilianDroneList, .. _MilitaryDroneList];
        //     return AllDrones;
        // }
        // public IDrone? SearchById(int id)
        // {
        //     IDrone? SearchedDrone = _CivilianDroneList.FirstOrDefault(e => e.Id == id);
        //     if (SearchedDrone != null)
        //     {
        //         return SearchedDrone;
        //     }

        //     SearchedDrone = _MilitaryDroneList.FirstOrDefault(e => e.Id == id);
        //     if (SearchedDrone != null)
        //     {
        //         return SearchedDrone;
        //     }

        //     return null;
        // }

        // public IDrone? DeleteDrone(int id)
        // {
        //     IDrone? SearchedDrone = _CivilianDroneList.FirstOrDefault(e => e.Id == id);
        //     if (SearchedDrone != null)
        //     {
        //         _CivilianDroneList.Remove((ICivilianDrone)SearchedDrone);
        //         return SearchedDrone;
        //     }
        //     SearchedDrone = _MilitaryDroneList.FirstOrDefault(e => e.Id == id);
        //     if (SearchedDrone != null)
        //     {
        //         _MilitaryDroneList.Remove((IMilitaryDrone)SearchedDrone);
        //         return SearchedDrone;
        //     }
        //     return null;
        // }
    }
}