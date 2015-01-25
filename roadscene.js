var Scene = require('gramework').Scene,
    gamejs = require('gramework').gamejs;

var RoadScene = exports.RoadScene = Scene.extend({
    initialize: function(options) {
        this.distance = 0;
        this.center = 0;
        this.speed = 0;
        this.maxSpeed = 0.2;
        this._accel = 0;
        this.road = options.road;
        this.image = gamejs.image.load(options.image_path)
        this.latSpeed = 0;
    },

    tiltLeft: function() {
        this.latSpeed = -5;
    },

    tiltRight: function() {
        this.latSpeed = 5;
    },

    stopLat: function() {
        this.latSpeed = 0;
    },

    accel: function() {
        this._accel = 0.001;
    },

    brake: function() {
        this._accel = -0.01;
    },

    slow: function() {
        this._accel = -0.001;
    },

    update: function(dt) {
        this.center += this.latSpeed + (this.road.getDeltaAngle() * this.speed * 200000);
        if (this.speed <= this.maxSpeed) {
            this.speed += this._accel;
        }
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < 0) {
            this.speed = 0;
        }
        this.distance += this.speed;
        this.road.update(dt);
        this.road.setDistance(this.distance);
        this.road.setCenter(this.center);
        RoadScene.super_.prototype.update.call(this, dt);
    },

    draw: function(display, options) {
        this.view.clear();
        display.clear();        
        this.view.blit(this.image);
        this.road.draw(this.view);
        RoadScene.super_.prototype.draw.call(this, display, options);
    }
});