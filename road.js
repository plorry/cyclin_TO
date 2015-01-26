var gamejs = require('gramework').gamejs,
    Entity = require('gramework').Entity,
    _ = require('underscore'),
    conf = require('./conf');

ANGLE_SCALE_CONSTANT = 100;

var Building = exports.Building = Entity.extend({
    initialize: function(options) {
        this.type = 'building';
        this.height = options.height;
        this.width = options.width;
        this.color = options.color;
        this.distance = options.distance;
        this.currentDistance = 0;
        this.road = options.road;
        this.diffDistance = this.distance - this.road.currentDistance;
        this.scaleFactor;
        this.image = this.road.images[options.image];
    },

    update: function(dt) {
    },

    draw: function(display, offset, height) {
        this.diffDistance = this.distance - this.road.currentDistance;

        this.scaleFactor = 1 / (this.diffDistance);
        this.buildingAngleOffset = thisLine.angleOffset * this.scaleFactor;
        var buildingWidth = this.width * this.scaleFactor;
        var buildingHeight = this.height * this.scaleFactor;
        var buildingCenter = this.position || 0;
        if (this.side == 'left') {

        }
        this.rect = new gamejs.Rect(
            [(this.road.displayWidth/2) + (0 - this.road.center + buildingCenter) * this.scaleFactor - this.buildingAngleOffset, height - buildingHeight],
            [buildingWidth, buildingHeight]
        );
        if (this.image) {
            display.blit(this.image, this.rect);
        } else {
            gamejs.draw.rect(display, "rgb(200,0,0)", this.rect);
        }
    }
});

var Road = exports.Road = function(options) {
    this.init(options);
};

Road.prototype = {
    init: function(options) {
        this.length = options.length;
        this.loadRoad(options.roadSpec);
        this.currentAngle = 0;
        this.currentDistance = 0;
        this.center = 0;
        this.displayWidth;
        this.displayHeight;
        this.lineProperties = [];
        this.viewProperties = this.getRoadPropertiesAt(this.currentDistance);
        this.toDraw = {};
        this.buildings = [];
        var imageKeys = [];
        this.images = {};
        for (building in this.currentRoad.buildings) {
            buildings[building].forEach(function(thing){
                if (imageKeys.indexOf(thing.imageFile) < 0) {
                    imageKeys.push(thing.imageFile);
                }
            }, this);
        }
        imageKeys.forEach(function(key){
            this.images[key] = gamejs.image.load(conf.Images[key]);
        }, this);

        /*
        for (building in buildings) {
            if (Array.isArray(buildings[building])) {
                buildings[building].forEach(function(thing){
                    if (thing.side === 'left') {
                        thing.image = gamejs.transform.flip(this.images[thing.imageFile], true);
                    } else {
                        thing.image = this.images[thing.imageFile];
                    }
                }, this);
            } else if (buildings[building].imageFile) {
                if (buildings[building].side === 'left') {
                    buildings[building].image = gamejs.transform.flip(this.images[buildings[building].imageFile], true);
                } else {
                    buildings[building].image = this.images[buildings[building].imageFile];
                }
            }
        }
        */

        var scanlines = _.range(0,201),
            line;
        this.lines = [];

        scanlines.forEach(function(lineNo) {
            this.lineProperties[lineNo] = {
                diffDistance: 100 / (201 - lineNo)
            };

            line = new Line({
                road: this,
                lineNo: lineNo
            });

            this.lines.push(line);
            this.toDraw[line.diffDistance] = [line];
        }, this);
    },

    addBuilding: function(distance, options) {
        if (!options.image in this.images){
            // Image not yet stored, must load
            this.images[options.image] = gamejs.image.load(conf.Images[options.image]);
        }

        var building = new Building(options);
        if (this.buildings[distance]) {
            this.buildings[distance].push(building);
        } else {
            this.buildings[distance] = [building];
        }
    },

    setDistance: function(distance) {
        this.currentDistance = distance;
    },

    setCenter: function(center) {
        this.center = center;
    },

    loadRoad: function(roadSpec) {
        this.currentRoad = roadSpec;
    },

    // Helper Methods to get the road properties at a given distance
    getAngleAt: function(distance) {
        var angle = 0;
        for (d in this.upcomingTurns) {
            turn = this.upcomingTurns[d];
            if (distance >= d && distance <= turn.end) {
                angle = turn.angle * (distance - d) / (turn.end - d);
                this.lastTurn = turn;
                break;
            }
        }
        for (d in this.currentRoad.turns) {
            turn = this.currentRoad.turns[d];
            if (distance > turn.end) {
                angle += turn.angle;
            }
            if (d > this.currentDistance + 200) {
                break;
            }
        }
        return angle * 0.017;
    },

    getAngleOffsetAt: function(distance) {

    },

    getDeltaAngle: function() {
        return this.lineProperties[1].angle - this.lineProperties[0].angle || 0;
    },

    getAltitudeAt: function(distance) {
        return 0;
    },

    getWidthAt: function(distance) {
        return 10;
    },

    isCrossStreet: function(distance) {
        var crossStreets = this.currentRoad.crossStreets,
            street;
        for (street in crossStreets) {
            if (distance >= street && distance <= crossStreets[street].end) {
                return true;
            }
            if (street > this.currentDistance + 200) {
                break;
            }
        }
        return false;
    },

    isBikeLane: function(distance) {
        var bikeLanes = this.currentRoad.bikeLanes,
            lane;
        for (lane in bikeLanes) {
            if (distance >= lane && distance <= bikeLanes[lane].end) {
                return true;
            }
            if (lane > this.currentDistance + 200) {
                break;
            }
        }
        return false;
    },

    isSidewalk: function(distance) {
        var sidewalks = this.currentRoad.sidewalks,
            sidewalk;
        for (sidewalk in sidewalks) {
            if (distance >= sidewalk && distance <= sidewalks[sidewalk].end) {
                return true;
            }
            if (sidewalk > this.currentDistance + 200) {
                break;
            }
        }
        return false;
    },

    getRoadPropertiesAt: function(distance) {
        var road = this;
        var properties = {
            distance: distance,
            width: road.getWidthAt(distance),
            altitude: road.getAltitudeAt(distance),
            angle: road.getAngleAt(distance)
        };
        return properties;
    },

    collectBuildings: function(distance) {
        currentBuildings = {};
        for (i in this.buildings) {
            if (i < distance) {

            }
            if (i >= distance && i <= distance + 100) {
                currentBuildings[i] = this.buildings[i];
            } 
            if (i > this.currentDistance + 100) {
                break;
            }
        }
        return currentBuildings;
    },

    collectTurns: function(distance) {
        var upcomingTurns = {};
        for (i in this.currentRoad.turns) {
            turn = this.currentRoad.turns[i];
            if (turn.end + 1 >= distance && i <= distance + 200) {
                upcomingTurns[i] = this.currentRoad.turns[i];
            }
        }
        return upcomingTurns;
    },

    collectProperties: function() {
        var scanlines = _.range(0, 201);

        scanlines.forEach(function(lineNo) {
            thisLine = this.lineProperties[lineNo];
            lastLine = this.lineProperties[lineNo - 1];
            thisLine.distance = this.currentDistance + thisLine.diffDistance;
            thisLine.angle = this.getAngleAt(thisLine.distance);
            thisLine.altitude = this.getAltitudeAt(thisLine.distance);
            thisLine.width = this.getWidthAt(thisLine.distance);

            var deltaAngle = this.viewProperties.angle - thisLine.angle; 
            
            if (lastLine) {
                var deltaDistance = lastLine.diffDistance - thisLine.diffDistance;
                thisLine.angleOffset = lastLine.angleOffset + Math.tan(deltaAngle) * deltaDistance * ANGLE_SCALE_CONSTANT;
            } else {
                thisLine.angleOffset = 0;
            }
        }, this);
    },

    update: function(dt) {
        this.drawBuildings = this.collectBuildings(this.currentDistance);
        this.upcomingTurns = this.collectTurns(this.currentDistance);
        this.currentAngle = this.getAngleAt(this.currentDistance);
        this.viewProperties = this.getRoadPropertiesAt(this.currentDistance);
        this.collectProperties();
        for (i in this.toDraw) {

        }
    },

    drawLine: function(display, lineNo) {
        var thisLine = this.lineProperties[lineNo];
        var diffDistance = thisLine.diffDistance;
        var distance = thisLine.distance;
        var nextDistance = this.lineProperties[lineNo - 1].distance;

        var buildings = [];
        var scaleFactor = 1 / diffDistance;

        var altitude = thisLine.altitude;
        var angle = thisLine.angle;

        var diffAlt = altitude - this.viewProperties.altitude;

        var height = 300 - lineNo + (diffAlt / diffDistance);
        var width = thisLine.width * 30 / diffDistance;

        var offset = (this.center + thisLine.angleOffset) / diffDistance;
        // Check buildings
        for (i in this.drawBuildings) {
            if (i >= nextDistance && i <= distance) {
                if (Array.isArray(this.drawBuildings[i])) {
                    this.drawBuildings[i].forEach(function(building){
                        buildings.push(building);
                    });
                } else {
                    buildings.push(this.drawBuildings[i]);
                }
            }
            if (i > distance) {
                break;
            }
        }
        //Now we draw
        var stripe = Math.floor(Math.cos(distance * 3));
        // Draw the grass
        var grassRect = new gamejs.Rect([0,height], [this.displayWidth,300])
        gamejs.draw.rect(display, "rgb(0,200,0)", grassRect);
        // Draw the road
        gamejs.draw.line(display, "rgb(50,50,50)", [(this.displayWidth/2)-width-offset,height], [(this.displayWidth/2)+width-offset,height],2);
        gamejs.draw.rect(display, "rgb(50,50,50)", new gamejs.Rect(
            [(this.displayWidth/2)-(width)-offset,height], [2*width,this.displayHeight]));

        if (stripe) {
            gamejs.draw.line(display, "#fff", [(this.displayWidth/2)-(width/50)-offset,height], [(this.displayWidth/2)+(width/50)-offset,height],2);
        }
        
        if (this.isCrossStreet(distance)) {
            gamejs.draw.line(display, "rgb(50,50,50)", [0,height],[this.displayWidth, height],2);
        }

        if (this.isBikeLane(distance)) {
            gamejs.draw.line(display, "#fff", [(this.displayWidth/2)-(width/50)-offset-width+(100/diffDistance),height], [(this.displayWidth/2)+(width/50)-offset-width+(100/diffDistance),height],2);
            gamejs.draw.line(display, "#fff", [(this.displayWidth/2)-(width/50)-offset+width-(100/diffDistance),height], [(this.displayWidth/2)+(width/50)-offset+width-(100/diffDistance),height],2);
        }

        if (this.isSidewalk(distance)) {
            gamejs.draw.line(display, "#aaa", [(this.displayWidth/2)-(width/10)-offset-width-(width/10)-(50/diffDistance),height + 1], [(this.displayWidth/2)+(width/10)-offset-width+(width/10)-(50/diffDistance),height + 1],2);
            gamejs.draw.line(display, "#aaa", [(this.displayWidth/2)-(width/10)-offset+width-(50/diffDistance),height + 1], [(this.displayWidth/2)+(width/10)-offset+width+(width/10)+(50/diffDistance),height + 1],2);
        }
        
        buildings.forEach(function(building){
            var buildingScale = 1 / (building.distance - this.viewProperties.distance);
            var buildingAngleOffset = thisLine.angleOffset * buildingScale;
            var buildingWidth = building.width * buildingScale;
            var buildingHeight = building.height * buildingScale;
            var buildingCenter = building.position || 0;
            if (building.side == 'left') {

            }
            var buildingRect = new gamejs.Rect(
                [(this.displayWidth/2) + (0 - this.center + buildingCenter) * buildingScale - buildingAngleOffset, height - buildingHeight],
                [buildingWidth, buildingHeight]
                );

            if (building.image) {
                display.blit(building.image, buildingRect);
            } else {
                gamejs.draw.rect(display, "rgb(200,0,0)", buildingRect);
            }
        }, this);
    },

    draw: function(display) {
        // Render the road at the given distance
        if (!this.displayWidth && !this.displayHeight) {
            this.displayWidth = display.getSize()[0];
            this.displayHeight = display.getSize()[1];
        }
        var scanlines = _.range(200,0,-1),
            distanceVal, i,
            distanceVals = [];
        /*
        scanlines.forEach(function(line) {
            this.drawLine(display, line);
        }, this);
        
        */
        for (distanceVal in this.toDraw) {
            distanceVals.push(distanceVal);
        }

        distanceVals.sort(function(a, b) {
            return a - b;
        });

        for (i = distanceVals.length - 1; i > 0; i--) {
            distanceVal = distanceVals[i];
            this.toDraw[distanceVal].forEach(function(item) {
                item.draw(display);
            });
        }

    }


};

var Line = function(options) {
    this.init(options);
};

Line.prototype = {
    init: function(options) {
        this.road = options.road;
        this.lineNo = options.lineNo;
        this.diffDistance = 100 / (201 - this.lineNo);
        this.absDistance = this.diffDistance + this.road.currentDistance;
        this.dz = this.road.currentDistance + (100 / (200 - this.lineNo));
        this.toDraw = [];
    },

    clearToDraw: function() {
        this.toDraw = [];
    },

    collectToDraw: function() {
        for (distance in this.road.currentBuildings) {
            if (distance > this.absDistance && distance <= this.dz) {
            }
        }
    },

    update: function(dt) {
        this.absDistance = this.diffDistance + this.road.currentDistance;
    },

    draw: function(display) {
        var thisLine = this.road.lineProperties[this.lineNo];

        var diffDistance = thisLine.diffDistance;
        var distance = thisLine.distance;

        var nextDistance = this.road.lineProperties[this.lineNo - 1].distance;

        var buildings = [];
        var scaleFactor = 1 / diffDistance;

        var altitude = thisLine.altitude;
        var angle = thisLine.angle;

        var diffAlt = altitude - this.road.viewProperties.altitude;

        var height = 300 - this.lineNo + Math.floor(diffAlt / diffDistance);
        var width = thisLine.width * 30 / diffDistance;

        var offset = (this.road.center + thisLine.angleOffset) / diffDistance;
        // Check buildings
        
        for (i in this.road.drawBuildings) {
            if (i >= nextDistance && i <= distance) {
                this.road.drawBuildings[i].forEach(function(building){
                    this.toDraw.push(building);
                }, this);
            }
            if (i > distance) {
                break;
            }
        }
        //Now we draw
        var stripe = Math.floor(Math.cos(distance * 3));
        // Draw the grass
        var grassRect = new gamejs.Rect([0,height], [this.road.displayWidth,300])
        gamejs.draw.rect(display, "rgb(0,200,0)", grassRect);
        // Draw the road
        gamejs.draw.line(display, "rgb(50,50,50)", [(this.road.displayWidth/2)-width-offset,height+0.5], [(this.road.displayWidth/2)+width-offset,height+0.5],1);
        //gamejs.draw.rect(display, "rgb(50,50,50)", new gamejs.Rect(
        //    [(this.road.displayWidth/2)-(width)-offset,height], [2*width,this.road.displayHeight]));

        if (stripe) {
            gamejs.draw.line(display, "#fff", [(this.road.displayWidth/2)-(width/50)-offset,height+0.5], [(this.road.displayWidth/2)+(width/50)-offset,height+0.5],1);
        }

        if (this.road.isBikeLane(distance)) {
            gamejs.draw.line(display, "#fff", [(this.road.displayWidth/2)-(width/50)-offset-width+(100/diffDistance),height+0.5], [(this.road.displayWidth/2)+(width/50)-offset-width+(100/diffDistance),height+0.5],1);
            gamejs.draw.line(display, "#fff", [(this.road.displayWidth/2)-(width/50)-offset+width-(100/diffDistance),height+0.5], [(this.road.displayWidth/2)+(width/50)-offset+width-(100/diffDistance),height+0.5],1);
        }

        if (this.road.isSidewalk(distance)) {
            gamejs.draw.line(display, "#aaa", [(this.road.displayWidth/2)-(width/10)-offset-width-(width/10)-(50/diffDistance),height + 0.5], [(this.road.displayWidth/2)+(width/10)-offset-width+(width/10)-(50/diffDistance),height + 0.5],1);
            gamejs.draw.line(display, "#aaa", [(this.road.displayWidth/2)-(width/10)-offset+width-(50/diffDistance),height + 0.5], [(this.road.displayWidth/2)+(width/10)-offset+width+(width/10)+(50/diffDistance),height + 0.5],1);
        }

        if (this.road.isCrossStreet(distance)) {
            gamejs.draw.line(display, "rgb(50,50,50)", [0,height+0.5],[this.road.displayWidth, height+0.5],1);
        }

        this.toDraw.forEach(function(item) {
            item.draw(display, offset, height);
        }, this);

        this.clearToDraw();
    }
};

var Car = exports.Car = _.extend(Building, {

});