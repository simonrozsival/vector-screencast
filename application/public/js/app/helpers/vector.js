/**
 * Created by rozsival on 11/04/15.
 */

/**
 * Immutable two dimensional vector representation with basic operations.
 * @class
 * @property    {number} x
 * @property    {number} y
 */
var Vector2 = (function() {

    /**
     * Math vector
     * @param {number} x
     * @param {number} y
     * @constructor
     */
    function Vector2(x, y) {
        /**
         * X coordinate getter.
         * @returns {number}    x
         */
        this.getX = function() {
            return x;
        };

        /**
         * Y coordinate getter.
         * @returns {number}    y
         */
        this.getY = function() {
            return y;
        };
    }

    /**
     * Calculates size of the vector.
     * @returns {number}
     */
    Vector2.prototype.getSize = function() {
        return Math.sqrt(this.getX()*this.getX() + this.getY()*this.getY());
    };

    /**
     * Distance between this and the other point.
     * @param {Vector2} b
     * @return number
     */
    Vector2.prototype.distanceTo = function(b) {
        return this.subtract(b).getSize();
    };

    /**
     * Normalizes the vector.
     * @throws Exception
     */
    Vector2.prototype.normalize = function() {
        var size = this.getSize();
        if(size === 0) {
            throw new Exception("Can't normalize zero vector.");
        }

        return this.scale(1/size);
    };

    /**
     * Creates a normal vector to this vector.
     * @returns {Vector2}
     */
    Vector2.prototype.getNormal = function() {
        return new Vector2(-this.getY(), this.getX()).normalize();
    };

    /**
     * Create a new two-dimensional vector as a combination of this vector with a specified vector.
     * @param {Vector2} b   The other vector
     * @return {Vector2}    Result of addition
     */
    Vector2.prototype.add = function(b) {
        return new Vector2(this.getX() + b.getX(), this.getY() + b.getY());
    };

    /**
     * Create a new two-dimensional vector as a combination of this vector with a specified vector.
     * @param {Vector2} b   The other vector
     * @return {Vector2}    Result of addition
     */
    Vector2.prototype.subtract = function(b) {
        return new Vector2(this.getX() - b.getX(), this.getY() - b.getY());
    };

    /**
     * Create a new two-dimensional vector as a combination of this vector with a specified vector.
     * @param {number} c    Scaling coeficient
     * @return {Vector2}    Result of addition
     */
    Vector2.prototype.scale = function(c) {
        return new Vector2(this.getX() * c, this.getY() * c);
    };

    /**
     * Make a copy of the vector.
     * @returns {Vector2} Copy.
     */
    Vector2.prototype.clone = function() {
        return new Vector2(this.getX(), this.getY());
    };

    return Vector2;

})();