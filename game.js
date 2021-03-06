var gamejs = require('gramework').gamejs,
    conf = require('./conf'),
    RoadScene = require('./roadscene').RoadScene,
    GameController = require('gramework').input.GameController,
    Biker = require('./biker').Biker,
    animate = require('gramework').animate,
    Road = require('./road').Road,
    Car = require('./road').Car,
    _ = require('underscore');

// Container for the entire game.

var roadSpec = {
    turns: {
        10: {
            angle: 45,
            end: 20
        },
        25: {
            angle: -45,
            end: 35
        },
        40: {
            angle: 45,
            end: 50
        },
        55: {
            angle: -45,
            end: 65
        },
    },

    crossStreets: {
        5: {
            end: 6
        },

        20: {
            end: 21
        },

        25: {
            end: 27
        }
    },

    bikeLanes: {
        0: {
            end: 500
        }
    },

    sidewalks: {
        0: {
            end: 500
        }
    },

    buildings: {

    }
};

var Game = exports.Game = function () {
    var road = new Road({
        roadSpec: roadSpec
    });
    _.range(0,20).forEach(function(value){
        road.addBuilding(value, {
            road: road,
            distance: value,
            height: 200,
            width: 200,
            position: 475,
            side: 'right',
            imageFile: 'hHouse01'
        });
    });

    this.cont = new GameController();
    var bike = new Biker({
        x:120,
        y:150,
        width:64,
        height:70,
        spriteSheet: new animate.SpriteSheet(
            gamejs.image.load(conf.Images.biker),
            64,
            70)
    });

    this.paused = false;

    this.scene = new RoadScene({
        width:320,
        height:240,
        pixelScale: 2,
        road: road,
        image_path: conf.Images.bg_toronto
    });

    this.scene.pushEntity(bike);

    this.initialize();
};

Game.prototype.initialize = function() {
    var game = this;

    this.controlMapDown = {
        left: function () {
            game.scene.tiltLeft();
        },
        up: function () {
            game.scene.accel();
        },
        right: function () {
            game.scene.tiltRight();
        },
        down: function () {
            game.scene.brake();
        },
        action: function() {

        },
        mousePos: function(pos) {

        },
        menu: function() {
            // MENU
            console.log(game.scene.road.currentAngle);
        },
        cancel: function() {
        }
    };

    this.controlMapUp = {
        left: function() {
            game.scene.stopLat();
        },

        right: function() {
            game.scene.stopLat();
        },

        up: function() {
            game.scene.slow();
        }
    }

};

Game.prototype.draw = function(surface) {
    this.scene.draw(surface, {clear: false});
};

Game.prototype.event = function(ev) {
    
    var key = this.cont.handle(ev);

    if (key) {
        if (key.action == 'keyDown') {
            this.controlMapDown[key.label]();
        }
        if (key.action == 'keyUp') {
            this.controlMapUp[key.label]();
        }
    }
};


Game.prototype.update = function(dt) {
    if (dt > 1000 / 3) dt = 1000 / 3;
    this.scene.update(dt);
};
