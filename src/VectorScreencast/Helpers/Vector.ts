module VectorScreencast.Helpers {
    
    /**
     * Immutable two dimensional vector representation with basic operations.     
     * @author  Šimon Rozsíval
     */
    export class Vector2 {
    
        /**
         * X coord
         */
        get X() : number { return this.x; }
        
        /**
         * Y coord
         */
        get Y() : number { return this.y; }
    
        constructor(private x: number, private y: number) { }
    
        /**
         * Compare two vectors 
         */
        isEqualTo(b: Vector2) : boolean {
            return this.X === b.X && this.Y === b.Y;
        }
    
        private size: number;
    
        /**
         * Calculates size of the vector.
         */
        getSize() : number {
            return Math.sqrt(this.getSizeSq());
        };
                
        /**
         * Calculates squared size of the vector.
         */
        getSizeSq() : number {
            return this.x*this.x + this.y*this.y;
        }
    
        /**
         * Distance between this and the other point.
         */
        distanceTo(b: Vector2) : number {
            var dx = this.x - b.X;
            var dy = this.y - b.Y;
            return Math.sqrt(dx*dx+dy*dy);
        };
    
        /**
         * Normalizes the vector.
         * @throws Error
         */
        normalize() : Vector2 {
            var size: number = this.getSize();
            if(size === 0) {
                throw new Error("Can't normalize zero vector.");
            }
    
            this.scale(1/size);
            return this;
        };
    
        /**
         * Creates a normal vector to this vector.
         */
        getNormal(): Vector2 {
            return (new Vector2(-this.y, this.x)).normalize();
        };
    
        /**
         * Create a new two-dimensional vector as a combination of this vector with a specified vector.
         */
        add(b: Vector2): Vector2 {
            this.x += b.X; this.y += b.Y;
            return this;
        };
    
        /**
         * Create a new two-dimensional vector by subtracting a specified vector from this vector.
         */
        subtract(b: Vector2): Vector2 {
            this.x -= b.X; this.y -= b.Y;
            return this;
        };
    
        /**
         * Create a new vector that is scaled by the coeficient c.
         */
        scale(c: number): Vector2 {
            this.x *= c; this.y *= c;
            return this;
        };
        
        /**
         * Calculates a point in between this and the other point.
         */
        pointInBetween(b: Vector2): Vector2 {
            return new Vector2((this.x + b.X) / 2, (this.y + b.Y) / 2);
        }
    
        /**
         * Make a copy of the vector.
         */
        clone() : Vector2 {
            return new Vector2(this.x, this.y);
        };
    }
}
