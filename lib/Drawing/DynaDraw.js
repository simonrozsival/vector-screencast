var Vector_1 = require('../Helpers/Vector');
var VideoEvents_1 = require('../Helpers/VideoEvents');
var DynaDraw = (function () {
    function DynaDraw(events, pathFactory, slowSimulation, minBrushSize, maxBrushSize, timer) {
        var _this = this;
        this.events = events;
        this.pathFactory = pathFactory;
        this.slowSimulation = slowSimulation;
        this.minBrushSize = minBrushSize;
        this.maxBrushSize = maxBrushSize;
        this.minMass = 1;
        this.maxMass = 10;
        this.minFriction = 0.4;
        this.maxFriction = 0.6;
        this.brushes = {};
        this.oneFrame = 1000 / 60;
        this.cursor = new BrushTip(true, timer);
        if (slowSimulation === true) {
            requestAnimationFrame(function (time) {
                _this.lastAnimationTime = time;
                _this.Tick(time);
            });
        }
        else {
            requestAnimationFrame(function () { return _this.TickWhile(); });
        }
    }
    DynaDraw.prototype.SetBrushSize = function (size) {
        this.currentBrushSize = size;
    };
    DynaDraw.prototype.interpolateMass = function (brushSize) {
        return this.minMass + (this.maxMass - this.minMass) * (brushSize - this.minBrushSize) / (this.maxBrushSize - this.minBrushSize);
    };
    DynaDraw.prototype.interpolateFriction = function (brushSize) {
        return this.maxFriction - (this.maxFriction - this.minFriction) * (brushSize - this.minBrushSize) / (this.maxBrushSize - this.minBrushSize);
    };
    DynaDraw.prototype.GetBrush = function (brushSize) {
        if (!this.brushes[brushSize]) {
            this.brushes[brushSize] = new BrushInstance(this.interpolateMass(brushSize), this.interpolateFriction(brushSize), brushSize);
        }
        return this.brushes[brushSize];
    };
    DynaDraw.prototype.ObserveCursorMovement = function (cursor) {
        try {
            var nextPoint = new Vector_1.default(cursor.X, cursor.Y);
            if (cursor.Pressure > 0) {
                if (!this.lastState || this.lastState.Pressure === 0) {
                    this.path = this.pathFactory();
                    this.events.trigger(VideoEvents_1.VideoEventType.StartPath, this.path);
                    this.StartPath(nextPoint, cursor.Pressure);
                }
                else {
                    this.NextPoint(nextPoint, cursor.Pressure);
                }
            }
            else if (this.lastState && this.lastState.Pressure > 0) {
                this.EndPath(nextPoint, this.lastState.Pressure);
            }
        }
        catch (err) {
            console.log("ProcessNewState error: ", err);
        }
        this.lastState = cursor;
    };
    DynaDraw.prototype.StartPath = function (position, pressure) {
        this.cursor.Reset(position, this.GetBrush(this.currentBrushSize.Size));
        this.position = position;
        this.pressure = pressure;
        this.cursor.StartPath(this.path, position, pressure);
    };
    DynaDraw.prototype.NextPoint = function (position, pressure) {
        this.position = position;
        this.pressure = pressure;
    };
    DynaDraw.prototype.EndPath = function (position, pressure) {
        this.position = position;
    };
    DynaDraw.prototype.TickWhile = function () {
        var _this = this;
        if (!!this.position) {
            var d2 = 0;
            var step = 0;
            do {
                d2 = this.cursor.ApplyForce(this.position);
                step += d2;
                if (step > this.currentBrushSize.Size) {
                    this.cursor.Draw(this.path, this.pressure);
                    step = 0;
                }
            } while (d2 > 0);
            if (step > 0) {
                this.cursor.Draw(this.path, this.pressure);
            }
            this.position = null;
        }
        requestAnimationFrame(function (time) { return _this.TickWhile(); });
    };
    DynaDraw.prototype.Tick = function (time) {
        var _this = this;
        if (!!this.path) {
            if (this.cursor.ApplyForce(this.position) > 0) {
                this.cursor.Draw(this.path, this.pressure);
            }
            else {
                if (!this.position) {
                    this.path = null;
                }
            }
        }
        this.lastAnimationTime = time;
        requestAnimationFrame(function (time) { return _this.Tick(time); });
    };
    return DynaDraw;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DynaDraw;
var BrushInstance = (function () {
    function BrushInstance(mass, friction, size) {
        this.mass = mass;
        this.friction = friction;
        this.size = size;
    }
    Object.defineProperty(BrushInstance.prototype, "Mass", {
        get: function () { return this.mass; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BrushInstance.prototype, "Friction", {
        get: function () { return this.friction; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BrushInstance.prototype, "Size", {
        get: function () { return this.size; },
        enumerable: true,
        configurable: true
    });
    return BrushInstance;
})();
var Threshold;
(function (Threshold) {
    Threshold[Threshold["Velocity"] = 1] = "Velocity";
})(Threshold || (Threshold = {}));
var BrushTip = (function () {
    function BrushTip(calculateSpeed, timer) {
        this.calculateSpeed = calculateSpeed;
        this.timer = timer;
    }
    BrushTip.prototype.Reset = function (position, brush) {
        this.brush = brush;
        this.position = position.clone();
        this.startPosition = position.clone();
        this.previousPosition = position.clone();
        this.previousPressure = -1;
        this.mousePosition = position.clone();
        this.acceleration = new Vector_1.default(0, 0);
        this.velocity = new Vector_1.default(0, 0);
        this.firstSegment = true;
    };
    BrushTip.prototype.ApplyForce = function (mouse) {
        if (mouse !== null) {
            var force = mouse.clone().subtract(this.position);
            this.acceleration = force.clone().scale(1 / this.brush.Mass);
            this.velocity.add(this.acceleration);
            this.mousePosition = mouse;
        }
        this.velocity.scale(1 - this.brush.Friction);
        if (this.velocity.getSizeSq() < 1) {
            return 0;
        }
        mouse = null;
        force = null;
        this.acceleration = null;
        this.angle = this.velocity.getNormal();
        this.position.add(this.velocity);
        return this.velocity.getSizeSq();
    };
    BrushTip.prototype.Draw = function (path, pressure) {
        var relativeSpeed = this.calculateSpeed === true ? this.velocity.getSize() / (this.brush.Size * this.brush.Size) : 0;
        var width = this.getRadius(pressure, relativeSpeed);
        this.angle.scale(width);
        if (this.firstSegment) {
            path.InitPath(this.startPosition.clone().add(this.angle), this.startPosition.clone().subtract(this.angle));
            this.firstSegment = false;
        }
        path.ExtendPath(this.position.clone().add(this.angle), this.position.clone().subtract(this.angle));
        path.Draw();
    };
    BrushTip.prototype.StartPath = function (path, pt, pressure) {
        path.StartPath(pt, this.getRadius(pressure, 0));
    };
    BrushTip.prototype.getRadius = function (pressure, speed) {
        if (this.previousPressure < 0)
            this.previousPressure = pressure;
        var interpolatedPressure = this.interpolatePressure(pressure);
        var radius = this.speedFactor(speed) * this.brush.Size * interpolatedPressure / 2;
        this.previousPosition = this.position.clone();
        this.previousPressure = interpolatedPressure;
        return radius;
    };
    BrushTip.prototype.interpolatePressure = function (mousePressure) {
        var d1 = this.position.distanceTo(this.previousPosition);
        var d2 = this.position.distanceTo(this.mousePosition);
        if (d1 === 0 && d2 === 0) {
            return mousePressure;
        }
        return (d1 / (d1 + d2)) * (mousePressure - this.previousPressure) + this.previousPressure;
    };
    BrushTip.prototype.speedFactor = function (speed) {
        return Math.max(1 - speed, 0.4);
    };
    BrushTip.threshold = 0.001;
    return BrushTip;
})();
