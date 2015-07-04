/// <reference path="Path" />
/// <reference path="../Helpers/VideoTimer" />
var Drawing;
(function (Drawing) {
    var Vector2 = Helpers.Vector2;
    var VideoEvents = Helpers.VideoEvents;
    var VideoEventType = Helpers.VideoEventType;
    /**
     * This class is an implementation of the algorithm originally created
     * in 1989 by Paul Haeberli - see http://www.sgi.com/grafica/dyna/index.html
     * The algorithm is based on physical properties of an object which is guided
     * by mouse movement.
     */
    var DynaDraw = (function () {
        /**
         * Initialise new instance of DynaDraw
         */
        function DynaDraw(pathFactory, slowSimulation, minBrushSize, maxBrushSize, timer) {
            var _this = this;
            this.pathFactory = pathFactory;
            this.slowSimulation = slowSimulation;
            this.minBrushSize = minBrushSize;
            this.maxBrushSize = maxBrushSize;
            /** Physical constants */
            this.minMass = 5;
            this.maxMass = 20;
            this.minFriction = 0.3; // 0.4 is experimentaly derived constant, that gives nice results for all weights
            this.maxFriction = 0.45;
            /**
             * Each brush has different properties - larger brushes are heavier and have greater drag
             */
            this.brushes = {};
            this.oneFrame = 1000 / 60; // 60 Hz in milliseconds
            // 						
            //this.cursor = new BrushTip(slowSimulation, timer); // when slow simulation is on, use width adjustments when moving fast
            this.cursor = new BrushTip(true, timer);
            // start the periodical simulation right away!
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
        /**
         * Set current brush size
         * @param   size    The new size of the brush (line thickness)
         */
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
        /**
         * Process next state and
         */
        DynaDraw.prototype.ObserveCursorMovement = function (cursor) {
            try {
                var nextPoint = new Vector2(cursor.X, cursor.Y);
                if (cursor.Pressure > 0) {
                    if (!this.lastState || this.lastState.Pressure === 0) {
                        // start a new path - prepare new chunk		
                        this.path = this.pathFactory();
                        VideoEvents.trigger(VideoEventType.StartPath, this.path);
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
        /**
         * Start drawing a new path with a given color and brush size.
         * @param	{Vector2}		position	Cursor state information
         * @param	{number}		pressure	Cursor pressure
         */
        DynaDraw.prototype.StartPath = function (position, pressure) {
            this.cursor.Reset(position, this.GetBrush(this.currentBrushSize.Size));
            this.position = position;
            this.pressure = pressure;
            this.cursor.StartPath(this.path, position, pressure);
        };
        /**
         * Animate cursor movement
         * @param	{Vector2}		position	Cursor state information
         * @param	{number}		pressure	Cursor pressure
         */
        DynaDraw.prototype.NextPoint = function (position, pressure) {
            this.position = position;
            this.pressure = pressure;
        };
        /**
         * Stop drawing the line when the mouse or digital pen is released.
         * @param	{Vector2}		position	Cursor state information
         * @param	{number}		pressure	Cursor pressure
         */
        DynaDraw.prototype.EndPath = function (position, pressure) {
            this.position = position;
        };
        /**
         * Simulate brush's movement frame by frame as long as it keeps moving.
         * This approach will be more responsive (the path will always reach the cursor before it moves in a different direction),
         * but the resulting curves aren't as nice and smooth as with the regular simulation.
         */
        DynaDraw.prototype.TickWhile = function () {
            var _this = this;
            if (!!this.position) {
                var d2 = 0; // squared distance the brush has traveled
                var step = 0;
                do {
                    d2 = this.cursor.ApplyForce(this.position, 1);
                    step += d2;
                    if (step > this.currentBrushSize.Size) {
                        this.cursor.Draw(this.path, this.pressure);
                        step = 0;
                    }
                } while (d2 > 0);
                // draw the rest
                if (step > 0) {
                    this.cursor.Draw(this.path, this.pressure);
                }
                this.position = null; // skip Apply(..) that will return false next time
            }
            // do the next tick
            requestAnimationFrame(function (time) { return _this.TickWhile(); }); // ~ 60 FPS
        };
        DynaDraw.prototype.Tick = function (time) {
            var _this = this;
            if (!!this.position) {
                if (this.cursor.ApplyForce(this.position, (time - this.lastAnimationTime) / this.oneFrame) > 0) {
                    this.cursor.Draw(this.path, this.pressure);
                }
                else {
                    this.position = null; // skip Apply(..) that will return false next time	
                }
            }
            // do the next tick
            this.lastAnimationTime = time;
            requestAnimationFrame(function (time) { return _this.Tick(time); }); // ~ 60 FPS
            //setTimeout(() => this.Tick(time + 1), 1); // ~ 1000 FPS
            //setTimeout(() => this.Tick(time + 30), 30); // ~ 30 FPS
            //setTimeout(() => this.Tick(time + 200), 200); // ~ 30 FPS
        };
        return DynaDraw;
    })();
    Drawing.DynaDraw = DynaDraw;
    /**
     * Set of brush properties that have effect on the outcome
     */
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
    /**
     * Brush with all it's physical properties
     * - implementation of the "filter" in the original algorithm
     */
    var BrushTip = (function () {
        function BrushTip(calculateSpeed, timer) {
            this.calculateSpeed = calculateSpeed;
            this.timer = timer;
        }
        /**
         * @param	{Vector2}		position	The starting point of the cursor.
         * @param	{BrushInstance} brush  		Physical properties of the brush.
         */
        BrushTip.prototype.Reset = function (position, brush) {
            this.brush = brush;
            this.position = position;
            this.startPosition = position;
            this.previousPosition = position;
            this.previousPressure = -1; // negative means, there is no pressure information yet
            this.mousePosition = position;
            this.acceleration = new Vector2(0, 0);
            this.velocity = new Vector2(0, 0);
            this.firstSegment = true;
        };
        /**
         * Apply force created by mouse movement
         * @param 	{Vector2}	mouse 			Mouse position
         * @param	{number}	elapsedFrames	The number of frames elapsed since last movement
         * @return	{number}					Brush movement distance squared
         */
        BrushTip.prototype.ApplyForce = function (mouse, elapsedFrames) {
            // calculate the force
            var force = mouse.subtract(this.position);
            if (force.getSizeSq() < 1 /* Force */) {
                return 0; // too subtle movement
            }
            // calculate acceleration and velocity
            this.acceleration = force.scale(1 / this.brush.Mass); // derived from the definition of force: (->)a = (->)f / m
            this.velocity = this.velocity.add(this.acceleration);
            if (this.velocity.getSizeSq() < 1 /* Velocity */) {
                return 0; // nearly no movement (a "heavy" brush)
            }
            // destroy unnecessary references
            this.mousePosition = mouse;
            mouse = null;
            force = null;
            this.acceleration = null;
            // calculate the angle of the mouse
            this.angle = this.velocity.getNormal();
            // apply the drag of the digital drawing tool
            this.velocity = this.velocity.scale((1 - this.brush.Friction) * elapsedFrames); // more friction means less movement
            // update position
            this.position = this.position.add(this.velocity);
            return this.velocity.getSizeSq(); // there is something to render
        };
        /**
         * Draw next segment
         */
        BrushTip.prototype.Draw = function (path, pressure) {
            // the quicker the brush moves, the smaller print it leaves 
            var relativeSpeed = this.calculateSpeed === true ? this.velocity.getSize() / (this.brush.Size * this.brush.Size) : 0; // set to 0 if no speed correction is used
            var width = this.getRadius(pressure, relativeSpeed);
            var delta = this.angle.scale(width);
            if (this.firstSegment) {
                path.InitPath(this.startPosition.add(delta), this.startPosition.subtract(delta));
                this.firstSegment = false;
            }
            path.ExtendPath(this.position.add(delta), this.position.subtract(delta));
            path.Draw();
        };
        BrushTip.prototype.StartPath = function (path, pt, pressure) {
            path.StartPath(pt, this.getRadius(pressure, 0));
        };
        /**
         * Calculate current radius from pressure and speed of the cursor.
         */
        BrushTip.prototype.getRadius = function (pressure, speed) {
            // I must interpolate the pressure between the last point and current pressure in the 
            if (this.previousPressure < 0)
                this.previousPressure = pressure;
            var interpolatedPressure = this.interpolatePressure(pressure);
            var radius = this.speedFactor(speed) * this.brush.Size * interpolatedPressure / 2;
            // save for next time
            this.previousPosition = this.position;
            this.previousPressure = interpolatedPressure;
            return radius;
        };
        /**
         * Get current pressure - achieve smooth pressure gradients
         */
        BrushTip.prototype.interpolatePressure = function (mousePressure) {
            var d1 = this.position.distanceTo(this.previousPosition);
            var d2 = this.position.distanceTo(this.mousePosition);
            if (d1 === 0 && d2 === 0) {
                return mousePressure; // I don't have to interpolate
            }
            return (d1 / (d1 + d2)) * (mousePressure - this.previousPressure) + this.previousPressure;
        };
        /**
         * Determine the effect of the speed on thickness of the path
         */
        BrushTip.prototype.speedFactor = function (speed) {
            return Math.max(1 - speed, 0.4);
        };
        /** Mouse movement threshold - ingore too subtle mouse movements */
        BrushTip.threshold = 0.001;
        return BrushTip;
    })();
})(Drawing || (Drawing = {}));
