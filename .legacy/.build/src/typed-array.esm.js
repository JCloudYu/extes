/**
 *	Author: JCloudYu
 *	Create: 2020/08/18
**/
const configurable=true, writable=true, enumerable=false;

//@export
(()=>{
	const TYPED_ARRAYS = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
	const ARRAY_BUFFER_VIEWS = [DataView, ...TYPED_ARRAYS];


	const REF = new WeakMap();
	for(const type of ARRAY_BUFFER_VIEWS) {
		REF.set(type, {
			from: type.from,
			toString: type.toString
		});
		
		Object.defineProperty(type, 'from', {
			value: function(input) {
				const original = REF.get(type).from;
				if (input instanceof ArrayBuffer) {
					return new type(input);
				}
				
				return original.call(type, input);
			},
			configurable, enumerable, writable
		});
		Object.defineProperty(type.prototype, 'toString', {
			value: function(...args) {
				const original = REF.get(type).toString;
				if ( args.length === 0 ) {
					return original.call(this, ...args);
				}
				
				return this.buffer.toString(...args);
			},
			configurable, enumerable, writable
		});
		
	}
})();
//@endexport

