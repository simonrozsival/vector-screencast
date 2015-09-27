var Vector2 = (function () {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    Object.defineProperty(Vector2.prototype, "X", {
        get: function () { return this.x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector2.prototype, "Y", {
        get: function () { return this.y; },
        enumerable: true,
        configurable: true
    });
    Vector2.prototype.isEqualTo = function (b) {
        return this.X === b.X && this.Y === b.Y;
    };
    Vector2.prototype.getSize = function () {
        return Math.sqrt(this.getSizeSq());
    };
    ;
    Vector2.prototype.getSizeSq = function () {
        return this.x * this.x + this.y * this.y;
    };
    Vector2.prototype.distanceTo = function (b) {
        var dx = this.x - b.X;
        var dy = this.y - b.Y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    ;
    Vector2.prototype.normalize = function () {
        var size = this.getSize();
        if (size === 0) {
            throw new Error("Can't normalize zero vector.");
        }
        this.scale(1 / size);
        return this;
    };
    ;
    Vector2.prototype.getNormal = function () {
        return (new Vector2(-this.y, this.x)).normalize();
    };
    ;
    Vector2.prototype.add = function (b) {
        this.x += b.X;
        this.y += b.Y;
        return this;
    };
    ;
    Vector2.prototype.subtract = function (b) {
        this.x -= b.X;
        this.y -= b.Y;
        return this;
    };
    ;
    Vector2.prototype.scale = function (c) {
        this.x *= c;
        this.y *= c;
        return this;
    };
    ;
    Vector2.prototype.pointInBetween = function (b) {
        return new Vector2((this.x + b.X) / 2, (this.y + b.Y) / 2);
    };
    Vector2.prototype.clone = function () {
        return new Vector2(this.x, this.y);
    };
    ;
    return Vector2;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Vector2;
