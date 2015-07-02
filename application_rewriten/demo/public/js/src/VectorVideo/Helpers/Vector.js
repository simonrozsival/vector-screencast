var Helpers;
(function (Helpers) {
    /**
     * Immutable two dimensional vector representation with basic operations.
     * @author  Šimon Rozsíval
     */
    var Vector2 = (function () {
        function Vector2(x, y) {
            this.x = x;
            this.y = y;
        }
        Object.defineProperty(Vector2.prototype, "X", {
            /**
             * X coord
             */
            get: function () { return this.x; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector2.prototype, "Y", {
            /**
             * Y coord
             */
            get: function () { return this.y; },
            enumerable: true,
            configurable: true
        });
        /**
         * Compare two vectors
         */
        Vector2.prototype.isEqualTo = function (b) {
            return this.X === b.X && this.Y === b.Y;
        };
        /**
         * Calculates size of the vector.
         */
        Vector2.prototype.getSize = function () {
            return Math.sqrt(this.getSizeSq());
        };
        ;
        /**
         * Calculates squared size of the vector.
         */
        Vector2.prototype.getSizeSq = function () {
            return this.x * this.x + this.y * this.y;
        };
        /**
         * Distance between this and the other point.
         */
        Vector2.prototype.distanceTo = function (b) {
            var dx = this.x - b.X;
            var dy = this.y - b.Y;
            return Math.sqrt(dx * dx + dy * dy);
        };
        ;
        /**
         * Normalizes the vector.
         * @throws Error
         */
        Vector2.prototype.normalize = function () {
            var size = this.getSize();
            if (size === 0) {
                throw new Error("Can't normalize zero vector.");
            }
            this.scale(1 / size);
            return this;
        };
        ;
        /**
         * Creates a normal vector to this vector.
         */
        Vector2.prototype.getNormal = function () {
            return (new Vector2(-this.y, this.x)).normalize();
        };
        ;
        /**
         * Create a new two-dimensional vector as a combination of this vector with a specified vector.
         */
        Vector2.prototype.add = function (b) {
            this.x += b.X;
            this.y += b.Y;
            return this;
        };
        ;
        /**
         * Create a new two-dimensional vector by subtracting a specified vector from this vector.
         */
        Vector2.prototype.subtract = function (b) {
            this.x -= b.X;
            this.y -= b.Y;
            return this;
        };
        ;
        /**
         * Create a new vector that is scaled by the coeficient c.
         */
        Vector2.prototype.scale = function (c) {
            this.x *= c;
            this.y *= c;
            return this;
        };
        ;
        /**
         * Calculates a point in between this and the other point.
         */
        Vector2.prototype.pointInBetween = function (b) {
            return new Vector2((this.x + b.X) / 2, (this.y + b.Y) / 2);
        };
        /**
         * Make a copy of the vector.
         */
        Vector2.prototype.clone = function () {
            return new Vector2(this.x, this.y);
        };
        ;
        return Vector2;
    })();
    Helpers.Vector2 = Vector2;
})(Helpers || (Helpers = {}));
