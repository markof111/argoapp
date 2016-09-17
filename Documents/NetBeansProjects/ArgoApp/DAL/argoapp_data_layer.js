var mongoose = require('mongoose');

function ArgoAppDataStorage() {
    var DB_URL = 'mongodb://localhost:27017/argoapp';
    
    var PLOT_COLLECTION_NAME = 'plots';
    var SENSOR_COLLECTION_NAME = 'sensors';
    var SENSOR_AVG_READING_COLLECTION_NAME = 'sensoravgreadings';
    
    mongoose.connect(DB_URL);
    mongoose.Promise = global.Promise;
    var db = mongoose.connection;
    db.on("error", console.error.bind(console, 'connection error:'));

    var plotSchema = mongoose.Schema({
        plotNum : {type : Number, unique : true},
        groingType : String,
        groingProprties : {
            isInHothouse : Boolean,
            isOverGround : Boolean,
            doesRequireWater : Boolean,
            doesRequireSprinklers : Boolean,
            OptimalEnvironmentalConditions : {
                minSun : Number,
                maxSun : Number,
                minAirHumidity : Number,
                maxAirHumidity : Number,
                minGroundHumidity : Number,
                maxGroundHumidity : Number}
        }
    });
    var sensorSchem = mongoose.Schema({
        sensorNum : Number,
        plotNum : Number,
        sensorType : String,
        reading : Number
    });
    var sensorAvgReadingSchem = mongoose.Schema({
        plotNum :  Number,
        dateTime : Date,
        sensorAggregation : {
            sensorMinSunAmount : Number,
            sensorMaxSunAmount : Number,
            sensorMinAirHumidity : Number,
            sensorMaxAirHumidity : Number,
            sensorMinGroundHumidity : Number,
            sensorMaxGroundHumidity : Number
        },
        sensorArray : [sensorSchem]
    });
    sensorAvgReadingSchem.index({plotNum : 1,dateTime : 1}, {unique: true});
    
    var Plot = mongoose.model(PLOT_COLLECTION_NAME, plotSchema);
    var Sensor = mongoose.model(SENSOR_COLLECTION_NAME, sensorSchem);
    var SensorAvgReading = mongoose.model(SENSOR_AVG_READING_COLLECTION_NAME, sensorAvgReadingSchem);
    
    this.listPlot = function (callback) {
        Plot.find(function (err, plots) {
            if (err) return console.error(err);
            callback ? callback(plots) : console.log(plots);
        });
    };
    
    this.findPlotById = function(plotNum,callback) {
        Plot.find({plotNum : plotNum},function (err, plots) {
            if (err) return console.error(err);
                callback ? callback(plots) : console.log(plots);
        });  
    };
    
    // add a new plot to the system
    this.addPlot = function(plotNum, groingType, extraData, callback){   
        var newPlot = new Plot({"plotNum" : plotNum, "groingType" : groingType,
                                "groingProprties" : {isInHothouse : extraData.isInHothouse,
                                    isOverGround : extraData.isOverGround, doesRequireWater : extraData.doesRequireWater,
                                    doesRequireSprinklers : extraData.doesRequireSprinklers,
                                    OptimalEnvironmentalConditions : {minSun : extraData.OptimalEnvironmentalConditions.minSun,
                                        maxSun : extraData.OptimalEnvironmentalConditions.maxSun,
                                        minAirHumidity : extraData.OptimalEnvironmentalConditions.minAirHumidity,
                                        maxAirHumidity : extraData.OptimalEnvironmentalConditions.maxAirHumidity,
                                        minGroundHumidity : extraData.OptimalEnvironmentalConditions.minGroundHumidity,
                                        maxGroundHumidity : extraData.OptimalEnvironmentalConditions.maxGroundHumidity
                                    }
                                }
            });
        newPlot.save(function (err, newPlot) {
            if (callback) callback(err, newPlot);
        });
    };
    
    this.addNewSensor= function(sensorNum, plotNum,sensorType,reading,callback) {
        var newSensor = new Sensor({sensorNum: sensorNum, plotNum : plotNum, sensorType: sensorType, reading : reading});
        newSensor.save(function (err,newSensor) {
            if (callback) callback(err,newSensor);
        });
    };
    
    this.updateSensorByNum = function(sensorNum,reading,callback){
        Sensor.update({sensorNum : sensorNum},{reading : reading}, callback);
    };
    
    this.findSensorById = function(sensorNum,callback) { 
        Sensor.find({sensorNum : sensorNum}, function (err, sensors) {
            if (err) return console.error(err);
                callback ? callback(sensors) : console.log(sensors);
        }); 
    };
    
    this.findSensorByPlotId = function(plotNum,callback) { 
        Sensor.find({plotNum : plotNum},function (err, sensors) {
            if (err) return console.error(err);
                callback ? callback(sensors) : console.log(sensors);
        }); 
    };

    this.calcConditions = function(plotNum,sensorMinSunAmount,sensorMaxSunAmount,
                                            sensorMinAirHumidity,sensorMaxAirHumidity,
                                            sensorMinGroundHumidity,sensorMaxGroundHumidity,
                                            sensor_list,callback) {
        var dateTime = new Date();
        var newAvgReading = new SensorAvgReading({
            plotNum :  plotNum,
            dateTime : dateTime,
            sensorAggregation : {
                sensorMinSunAmount : sensorMinSunAmount,
                sensorMaxSunAmount : sensorMaxSunAmount,
                sensorMinAirHumidity : sensorMinAirHumidity,
                sensorMaxAirHumidity : sensorMaxAirHumidity,
                sensorMinGroundHumidity : sensorMinGroundHumidity,
                sensorMaxGroundHumidity : sensorMaxGroundHumidity
            },
            sensorArray : sensor_list 
        });
        
        newAvgReading.save(function (err,newAvgReading) {
            if (callback) callback(err,newAvgReading);
        });       
    };
};

module.exports = ArgoAppDataStorage;


