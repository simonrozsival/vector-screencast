/**
 * Created by rozsival on 16/04/15.
 */

var SplineHelper = (function() {

    return {

        /**
         * Convert four consequent points to parameters for cubic Bézier curve.
         * (http://therndguy.com/papers/curves.pdf)
         * @param {Vector2} a
         * @param {Vector2} b
         * @param {Vector2} c
         * @param {Vector2} d
         * @returns {{start: Vector2, startCP: Vector2, end: Vector2, endCP: Vector2}}
         */
        catmullRomToBezier: function(a, b, c, d) {
            return {
                start:    b,
                startCP:  new Vector2((-1/6 * a.getX()) + b.getX() + (1/6 * c.getX()), (-1/6 * a.getY()) + b.getY() + (1/6 * c.getY())),
                end:      c,
                endCP:    new Vector2((1/6 * b.getX()) + c.getX() + (-1/6 * d.getX()), (1/6 * b.getY()) + c.getY() + (-1/6 * d.getY()))
            };
        }

    };

})();