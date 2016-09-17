var ArgoAppDataStorage = require('./../DAL/argoapp_data_layer');

function argoApp(){
    var argoAppDataStorage = new ArgoAppDataStorage();
    
    this.listPlots = function (callback) {
        argoAppDataStorage.listPlot(callback);
    };
    
    this.addPlot= function(plotNum,groingType, callback) {
        var groingTypeProperties;
        if(groingType === "wheat")
        { 
            groingTypeProperties =
            {
                isInHothouse : false,
                isOverGround : true,
                doesRequireWater : false,
                doesRequireSprinklers : false,
                OptimalEnvironmentalConditions :
                {
                    minSun : 20,
                    maxSun : 60
                }
            };
        }
        else if (groingType === "tomato")
        {
            groingTypeProperties =
            {
                isInHothouse : true,
                isOverGround : true,
                doesRequireWater : true,
                doesRequireSprinklers : true,
                OptimalEnvironmentalConditions :
                {
                    minSun : 20,
                    maxSun : 60,
                    minAirHumidity : 50,
                    maxAirHumidity : 90,
                    minGroundHumidity : 30,
                    maxGroundHumidity : 60
                }
            };
        }
        else if (groingType === "peach")
        {
            groingTypeProperties = 
            {
                isInHothouse : false,
                isOverGround : true,
                doesRequireWater : true,
                doesRequireSprinklers : false,
                OptimalEnvironmentalConditions : 
                {
                   minSun : 10,
                   maxSun : 90,
                   minGroundHumidity : 45,
                   maxGroundHumidity : 70
                }
            };
        }
        else if (groingType === "potato")
        {

            groingTypeProperties = 
            {
                isInHothouse : false,
                isOverGround : false,
                doesRequireWater : true,
                doesRequireSprinklers : false,
                OptimalEnvironmentalConditions :
                {
                    minGroundHumidity : 30,
                    maxGroundHumidity : 60 
                }
            };
        }
        argoAppDataStorage.addPlot(plotNum,groingType,groingTypeProperties,callback) ; 
    };
    
    this.addSensor= function(sensorNum,plotNum,sensorType,reading, callback) {
        
        // find if there is a sensor reading all redy, if so, update the reading
        argoAppDataStorage.findSensorById(sensorNum,function (sensor_list){
            if (sensor_list.length === 1)
            {
                argoAppDataStorage.updateSensorByNum(sensorNum,reading, callback); 
            }
            else
            {
                argoAppDataStorage.addNewSensor(sensorNum,plotNum,sensorType,reading, callback); 
            }
        });
    };
     
    this.calcConditions = function(plotNum,callback) {
        argoAppDataStorage.findPlotById(plotNum,function (plot_list) {
            argoAppDataStorage.findSensorByPlotId(plotNum,function (sensor_list)
            {
                var sensorMinSunAmount = 0;
                var sensorMaxSunAmount = 0;
                var sensorMinAirHumidity = 0;
                var sensorMaxAirHumidity = 0;
                var sensorMinGroundHumidity = 0;
                var sensorMaxGroundHumidity = 0;
                var len = sensor_list.length;
                
                // Check all th sensor parameters
                for (var i = 0 ; i < len; i++) {
                    if(sensor_list[i].sensorType === "sun" && plot_list[0].groingProprties.isOverGround)
                    {
                        if (sensor_list[i].reading > plot_list[0].groingProprties.OptimalEnvironmentalConditions.maxSun)
                        {
                            sensorMaxSunAmount = sensorMaxSunAmount +1;
                        }
                        else if (sensor_list[i].reading < plot_list[0].groingProprties.OptimalEnvironmentalConditions.minSun)
                        {
                            sensorMinSunAmount = sensorMinSunAmount +1;
                        }
                    }
                    else if (sensor_list[i].sensorType === "air" && plot_list[0].groingProprties.doesRequireSprinklers)
                    {
                        if (sensor_list[i].reading > plot_list[0].groingProprties.OptimalEnvironmentalConditions.maxAirHumidity)
                        {
                            sensorMaxAirHumidity = sensorMaxAirHumidity +1;
                        }
                        else if (sensor_list[i].reading < plot_list[0].groingProprties.OptimalEnvironmentalConditions.minAirHumidity)
                        {
                            sensorMinAirHumidity = sensorMinAirHumidity +1;
                        }
                    }
                    else if(sensor_list[i].sensorType === "ground" && plot_list[0].groingProprties.doesRequireWater)
                    {
                        if (sensor_list[i].reading > plot_list[0].groingProprties.OptimalEnvironmentalConditions.maxGroundHumidity)
                        {
                            sensorMaxGroundHumidity = sensorMaxGroundHumidity +1;
                        }
                        else if (sensor_list[i].reading < plot_list[0].groingProprties.OptimalEnvironmentalConditions.minGroundHumidity)
                        {
                            sensorMinGroundHumidity = sensorMinGroundHumidity +1;
                        }
                    }
                }; 
                argoAppDataStorage.calcConditions(plotNum,sensorMinSunAmount,sensorMaxSunAmount,
                                                     sensorMinAirHumidity,sensorMaxAirHumidity,
                                                     sensorMinGroundHumidity,sensorMaxGroundHumidity,
                                                     sensor_list,callback); 
            });        
        });
     };
};
    
module.exports = argoApp;

