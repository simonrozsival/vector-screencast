export default class Vector2 {
    private x;
    private y;
    X: number;
    Y: number;
    constructor(x: number, y: number);
    isEqualTo(b: Vector2): boolean;
    getSize(): number;
    getSizeSq(): number;
    distanceTo(b: Vector2): number;
    normalize(): Vector2;
    getNormal(): Vector2;
    add(b: Vector2): Vector2;
    subtract(b: Vector2): Vector2;
    scale(c: number): Vector2;
    pointInBetween(b: Vector2): Vector2;
    clone(): Vector2;
}
