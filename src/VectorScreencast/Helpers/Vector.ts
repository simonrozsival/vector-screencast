/**
 * Two dimensional vector representation with basic operations between vectors.     
 * @author  Šimon Rozsíval
 */
export default class Vector2 {

	/** X coordinate of the vector. */
	public get X() : number { return this.x; }
	
	/** Y coordinate of the vector. */
	public get Y() : number { return this.y; }

	/**
		* @param   x   X coordinate of the vector.
		* @param   y   Y coordinate of the vector.
		*/
	public constructor(private x: number, private y: number) { }

	/**
		* Compare coordainates of two vectors.
		*/
	public isEqualTo(b: Vector2) : boolean {
		return this.X === b.X && this.Y === b.Y;
	}

	/**
		* Calculates size of the vector.
		* @return      The calculated size of the vector. 
		*/
	public getSize() : number {
		return Math.sqrt(this.getSizeSq());
	};
			
	/**
		* Calculates squared size of the vector.
		* @return      The squared size of the vector.
		*/
	public getSizeSq() : number {
		return this.x*this.x + this.y*this.y;
	}

	/**
		* Distance between this and the other point.
		* @return      Distance between the two vectors.
		*/
	public distanceTo(b: Vector2) : number {
		var dx = this.x - b.X;
		var dy = this.y - b.Y;
		return Math.sqrt(dx*dx+dy*dy);
	};

	/**
		* Normalizes the vector.
		* @throws Error
		* @return  Self
		*/
	public normalize() : Vector2 {
		var size: number = this.getSize();
		if(size === 0) {
			throw new Error("Can't normalize zero vector.");
		}

		this.scale(1/size);
		return this;
	};

	/**
		* Creates a normal vector to this vector.
		* @return      Vector perpendicular to the original vector and normalized.
		*/
	public getNormal(): Vector2 {
		return (new Vector2(-this.y, this.x)).normalize();
	};

	/**
		* Add vector b to this vector.
		* @param   b       The other vector.
		* @return  Self
		*/
	public add(b: Vector2): Vector2 {
		this.x += b.X; this.y += b.Y;
		return this;
	};

	/**
		* Subtract vector b from this vector.
		* @param   b       The other vector.
		* @return  Self
		*/
	public subtract(b: Vector2): Vector2 {
		this.x -= b.X; this.y -= b.Y;
		return this;
	};

	/**
		* Scale this vector with a given number.
		* @param   c       Scale factor.
		* @return  Self
		*/
	public scale(c: number): Vector2 {
		this.x *= c; this.y *= c;
		return this;
	};
	
	/**
		* Calculates a point in between this and the other point.
		* @return  New point in between this and the other point.
		*/
	public pointInBetween(b: Vector2): Vector2 {
		return new Vector2((this.x + b.X) / 2, (this.y + b.Y) / 2);
	}

	/**
		* Make a copy of the vector.
		* @return  Clone of this vector.
		*/
	public clone() : Vector2 {
		return new Vector2(this.x, this.y);
	};
}