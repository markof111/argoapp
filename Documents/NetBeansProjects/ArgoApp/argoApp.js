var express = require('express')
    , util = require('util')
    , config = require('./config/auth')
    , argoApp_BL = require('./BL/argoApp_BL');
    
    
function Server() {
    var argoApp = new argoApp_BL();
    var app = express();

    this.start = function () {
        addPaths();
        app.listen(3000);
    };

    function addPaths() {
        addAuthPaths();
        addPlotPaths();
        addSensorPaths();
        addCalcPaths();

        app.use(express.static('public'));
        app.get('/example', function (req, res) {
            res.sendFile(__dirname + '/public/example.html');
        });
    }

    function addPlotPaths() {
        // Show all plots in the system
        app.get('/plots', function (req, res) {
            argoApp.listPlots(function (plots) {
                res.end(JSON.stringify(plots));
            });
        });

        // Add anew plot
        app.get('/plot', function (req, res) {
            if (!(req.query.plotId && req.query.groingType))
                return res.end(JSON.stringify({err: true, message: "Parameter is missing"}));
            else if(!(req.query.groingType === "wheat" ||
                    req.query.groingType === "tomato" ||
                    req.query.groingType === "peach" ||
                    req.query.groingType === "potato"))
                return res.end(JSON.stringify({err: true,
                                        message: "Groing type can be: wheat, tomato, peach or potato"}));

            argoApp.addPlot(req.query.plotId,req.query.groingType,
            function (response) {
                res.end(JSON.stringify(response));
            });
        });
    }
               
    function addSensorPaths() {
        app.get('/sensor', function (req, res) {
            if (!(req.query.sensorNum, req.query.plotId && req.query.sensorType && req.query.reading ))
                return res.end(JSON.stringify({err: true, message: "Parameter is missing"}));
            else if (!(0 <= req.query.reading <= 100))
            {
                return res.end(JSON.stringify({err: true, message: "Reading must be between 0 to 100"})); 
            }
            else if(!(req.query.sensorType === "sun" ||
                    req.query.sensorType === "air" ||
                    req.query.sensorType === "ground"))
            {
               return res.end(JSON.stringify({err: true,
                            message: "Sensor type can be: sun, air or ground"})); 
            }
            argoApp.addSensor(req.query.sensorNum,req.query.plotId,req.query.sensorType,req.query.reading,
            function (response) {
                res.end(JSON.stringify(response));
            });
        });
    }

    function addCalcPaths()
    {
        app.get('/calc', function(req,res){
            if (!(req.query.plotId))
            {
               return res.end(JSON.stringify({err: true, message: "Parameter is missing"})); 
            }
            argoApp.calcConditions(req.query.plotId,function (response) {
                res.end(JSON.stringify(response));
            });
        });
    }

    function addAuthPaths() {
        app.get('/', function (req, res) {
            //res.end(JSON.stringify({user: req.user}));
            res.redirect('/plots');
        });
    }
}
new Server().start();
