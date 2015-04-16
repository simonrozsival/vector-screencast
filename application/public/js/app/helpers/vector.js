/**
 * Created by rozsival on 11/04/15.
 */

/**
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
        this.x = x;
        this.y = y;
    }

    /**
     * Calculates size of the vector.
     * @returns {number}
     */
    Vector2.prototype.getSize = function() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
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

        this.x /= size;
        this.y /= size;
    };

    /**
     * Creates a normal vector to this vector.
     * @returns {Vector2}
     */
    Vector2.prototype.getNormal = function() {
        var n = new Vector2(-this.y, this.x);
        n.normalize();
        return n;
    };

    return Vector2;

})();