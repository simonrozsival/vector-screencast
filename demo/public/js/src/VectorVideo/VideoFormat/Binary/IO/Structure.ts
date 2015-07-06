

module VideoFormat.Binary.IO {
	
	interface BinaryType<T> {
		name: string,
		read(source: BinaryData): void;
		write(dest: BinaryData): void;
		getValue(): T;
		setValue(value: T): void;
	}
	
	class Int32Type implements BinaryType<number> {
		private value: number;		
		
		constructor(public name?: string) {
			this.value = 0;
		}
		
		read(source: BinaryData): void {
			this.value = source.readInt32();
		}
				
		write(dest: BinaryData): void {
			dest.writeInt32(this.value);
		}
		
		getValue(): number {
			return this.value;
		}
		
		setValue(v: number): void {
			this.value = v;
		}
	}
	
	class Float32Type implements BinaryType<number> {
		private value: number;		
		
		constructor(public name: string) {
			this.value = 0;
		}
		
		read(source: BinaryData): void {
			this.value = source.readInt32();
		}
				
		write(dest: BinaryData): void {
			dest.writeInt32(this.value);
		}
		
		getValue(): number {
			return this.value;
		}
		
		setValue(v: number): void {
			this.value = v;
		}
	}
	
	class BinaryArray<T> implements BinaryType<Array<BinaryType<T>>> {
		private values: Array<BinaryType<T>>;		
		constructor(public name: string, protected field: Field<T>, protected count: number|Int32Type) {
			this.values = [];
		}
		
		read(source: BinaryData): void {
			var count: number = this.count instanceof Int32Type ? (<Int32Type>this.count).getValue() : <number>this.count; 
			for (var i = 0; i < count; i++) {
				var t = this.field(`${this.name}[${i.toString()}]`);
				t.read(source);
				this.values.push(t);
			}
		}
		
		write(dest: BinaryData): void {
			for (var i = 0; i < this.values.length; i++) {
				var element = this.values[i];
				element.write(dest);
			}
		}
		
		getValue(): Array<BinaryType<T>> {
			return this.values;
		}
		
		setValue(values: Array<BinaryType<T>>): void {
			this.values = values;
		}
	}
	
	/**
	 * Fields
	 */
	
	interface Field<T> {
		(name: string): BinaryType<T>;	
	}
	
	function int(name: string): Int32Type {
		return new Int32Type(name);
	}
	
	function array<T>(type: Field<T>, name: string, count: number|Int32Type): BinaryArray<T> {
		return new BinaryArray<T>(name, type, count);
	}
	
	/**
	 * Structure wrapper
	 */
	
	export class Struct implements BinaryType<Array<BinaryType<any>>> {
		
		private fieldMap: {[name: string]: number};
		
		constructor(public name: string, protected fields: Array<BinaryType<any>>) {
			this.setValue(this.fields);
		}
		
		get(field: string): any {
			return (this.fields[this.fieldMap[field]].getValue());
		}
		
		write(dest: BinaryData): void {
			for (var i = 0; i < this.fields.length; i++) {
				var field = this.fields[i];
				field.write(dest);
			}
		}
		
		read(source: BinaryData): void {
			for (var i = 0; i < this.fields.length; i++) {
				var field = this.fields[i];
				field.read(source);
			}
		}
		
		getValue(): Array<BinaryType<any>> {
			return this.fields;
		}
		
		setValue(data: Array<BinaryType<any>>) {
			this.fields = data;			
			this.fieldMap = {};
			for (var i = 0; i < this.fields.length; i++) {
				this.fieldMap[this.fields[i].name] = i;				
			}
		}
		
	}
	
	class BinaryData {
		
		private offset: number;
		
		constructor(protected data: DataView, protected isLittleEndian?: boolean) {
			this.offset = 0;
			if(this.isLittleEndian === undefined) {
				this.isLittleEndian = true;
			}
		}
		
		readInt32(): number {
			var value: number = this.data.getInt32(this.offset, this.isLittleEndian);
			this.offset += 4;
			return value;
		}		
		
		writeInt32(value: number): void {
			this.data.setInt32(this.offset, value, this.isLittleEndian);
			this.offset += 4;
		}
		
		readFloat32(): number {
			var value: number = this.data.getFloat32(this.offset, this.isLittleEndian);
			this.offset += 4;
			return value;
		}		
		
		writeFloat32(value: number): void {
			this.data.setFloat32(this.offset, value, this.isLittleEndian);
			this.offset += 4;
		}
		
	}

	var countOfNumbers = int("countOfNumbers");	
	var s = new Struct("contact", [
		int("name"),
		countOfNumbers,
		array(int, "phoneNumbers", countOfNumbers)
	]);
		
	//s.readFrom(new DataView());
	var name: string = s.get("name"); 
}