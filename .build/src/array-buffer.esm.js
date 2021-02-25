/**
 *	Author: JCloudYu
 *	Create: 2019/07/19
**/
import {UTF8Encode} from "_helper/utf8.esm.js";
import {ExtractBytes} from "_helper/misc.esm.js";
const configurable=true, writable=true, enumerable=false;

//@export
(()=>{
	const HEX_FORMAT = /^(0x)?([0-9a-fA-F]+)$/;
	const BIT_FORMAT = /^(0b|0B)?([01]+)$/;
	const HEX_MAP	 = "0123456789abcdef";
	const HEX_MAP_R	 = {
		"0":0, "1":1, "2":2, "3":3,
		"4":4, "5":5, "6":6, "7":7,
		"8":8, "9":9, "a":10, "b":11,
		"c":12, "d":13, "e":14, "f":15
	};
	
	
	
	Object.defineProperty(ArrayBuffer.prototype, 'bytes', {
		configurable, enumerable,
		get:function(){ return new Uint8Array(this); }
	});
	Object.defineProperty(ArrayBuffer.prototype, 'toString', {
		configurable, writable, enumerable,
		value:function(format=16, padding=true){
			const bytes = new Uint8Array(this);
			
			let result = '';
			switch(format) {
				case 16:
					for(let i=0; i<bytes.length; i++) {
						const value = bytes[i];
						result += HEX_MAP[(value&0xF0)>>>4] + HEX_MAP[value&0x0F];
					}
					break;
					
				case 2:
					for(let i=0; i<bytes.length; i++) {
						const value = bytes[i];
						for (let k=7; k>=0; k--) {
							result += ((value >>> k) & 0x01) ? '1' : '0';
						}
					}
					break;
				
				default:
					throw new RangeError( "Unsupported numeric representation!" );
			}
			
			return padding ? result : result.replace(/^0+/, '');
		}
	});
	Object.defineProperty(ArrayBuffer.prototype, 'compare', {
		configurable, writable, enumerable,
		value:function(array_buffer) {
			if ( !(array_buffer instanceof ArrayBuffer) ) {
				throw new TypeError("An ArrayBuffer can only be compared with another ArrayBuffer");
			}
			
			const a = new Uint8Array(this);
			const b = new Uint8Array(array_buffer);
			const len = Math.max(a.length, b.length);
			for(let i=0; i<len; i++) {
				const val_a = a[i] || 0, val_b = b[i] || 0;
				if ( val_a > val_b ) return 1;
				if ( val_a < val_b ) return -1;
			}
			return 0;
		}
	});
	
	Object.defineProperty(ArrayBuffer, 'extract', {
		configurable, writable, enumerable,
		value: function(input) {
			if ( typeof Buffer !== "undefined" ) {
				if ( input instanceof Buffer ) {
					let buff = Buffer.alloc(input.length);
					input.copy(buff, 0);
					return buff.buffer;
				}
			}
			
			if ( ArrayBuffer.isView(input) ) {
				return input.buffer;
			}
			
			if ( input instanceof ArrayBuffer ) {
				return input;
			}
			
			throw new TypeError( "Cannot convert given input data into array buffer" );
		}
	});
	Object.defineProperty(ArrayBuffer, 'from', {
		configurable, writable, enumerable,
		value: function(input, conversion_info=null) {
			if ( typeof Buffer !== "undefined" ) {
				if ( input instanceof Buffer ) {
					let buff = Buffer.alloc(input.length);
					input.copy(buff, 0);
					return buff.buffer;
				}
			}
			
			if ( ArrayBuffer.isView(input) ) {
				return input.buffer.slice(0);
			}
			
			if ( input instanceof ArrayBuffer ) {
				return input.slice(0);
			}
			
			if ( Array.isArray(input) ) {
				const buffer = new Uint8Array(input);
				return buffer.buffer;
			}
			
			if ( typeof input === "number" ) {
				let data_buffer = null;
				switch(conversion_info) {
					case 'int8':
						data_buffer = new Int8Array([input]);
						break;
					
					case 'uint8':
						data_buffer = new Uint8Array([input]);
						break;
						
					case 'int16':
						data_buffer = new Int16Array([input]);
						break;
						
					case 'uint16':
						data_buffer = new Uint16Array([input]);
						break;
						
					case 'int32':
						data_buffer = new Int32Array([input]);
						break;
						
					case 'int64':{
						const negative = input < 0;
						if ( negative ) { input = -input; }
						
						let upper = Math.floor(input/0xFFFFFFFF);
						let lower = input & 0xFFFFFFFF;
						if ( negative ) {
							lower = ((~lower)>>>0) + 1;
							upper = (~upper) + Math.floor(lower/0xFFFFFFFF);
						}
						
						data_buffer = new Uint32Array([lower, upper]);
						break;
					}
					
					case 'uint64': {
						const upper = Math.floor(input/0xFFFFFFFF);
						const lower = input & 0xFFFFFFFF;
						data_buffer = new Uint32Array([lower, upper]);
						break;
					}
					
					case 'float32':
						data_buffer = new Float32Array([input]);
						break;
					
					case 'float64':
						data_buffer = new Float64Array([input]);
						break;
						
					case 'uint32':
					default:
						data_buffer = new Uint32Array([input]);
						break;
				}
				
				return data_buffer.buffer;
			}
			
			if ( typeof input === "string" ) {
				if ( conversion_info === "hex" ) {
					const matches = input.match(HEX_FORMAT);
					if ( !matches ) {
						throw new RangeError( "Input argument is not a valid hex string!" );
					}
				
					let [,,hex_string] = matches;
					if ( hex_string.length % 2 === 0 ) {
						hex_string = hex_string.toLowerCase();
					}
					else {
						hex_string = '0' + hex_string.toLowerCase();
					}
					
					
					
					const buff = new Uint8Array((hex_string.length/2)|0);
					for ( let i=0; i<buff.length; i++ ) {
						const offset = i * 2;
						buff[i] = HEX_MAP_R[hex_string[offset]]<<4 | (HEX_MAP_R[hex_string[offset+1]] & 0x0F);
					}
					
					return buff.buffer;
				}
				else
				if ( conversion_info === "bits" ) {
					const matches = input.match(BIT_FORMAT);
					if ( !matches ) {
						throw new RangeError( "Input argument is not a valid bit string!" );
					}
					
					let [,,bit_string] = matches;
					if ( bit_string.length % 8 !== 0 ) {
						bit_string = '0'.repeat(bit_string.length%8) + bit_string;
					}
					
					
					
					const buff = new Uint8Array((bit_string.length/8)|0);
					for ( let i=0; i<buff.length; i++ ) {
						const offset = i * 8;
						let value = (bit_string[offset]==='1'?1:0);
						for (let k=1; k<8; k++) {
							value = (value << 1) | (bit_string[offset + k]==='1'?1:0);
						}
						buff[i] = value;
					}
					
					return buff.buffer;
				}
				else {
					return UTF8Encode(input).buffer;
				}
			}
			
			throw new TypeError( "Cannot convert given input data into array buffer!" );
		}
	});
	Object.defineProperty(ArrayBuffer, 'compare', {
		configurable, writable, enumerable,
		value: function(a, b) {
			if ( !(a instanceof ArrayBuffer) || !(b instanceof ArrayBuffer) ) {
				throw new TypeError("ArrayBuffer.compare only accepts two array buffers!");
			}
			
			return a.compare(b);
		}
	});
	Object.defineProperty(ArrayBuffer, 'concat', {
		configurable, writable, enumerable,
		value: function(...args) {
		if ( Array.isArray(args[0]) ) {
			args = args[0];
		}
		
		let temp = 0;
		for(let i=0; i<args.length; i++) {
			let arg = args[i] = ExtractBytes(args[i]);
			if (!(arg instanceof Uint8Array)) {
				throw new TypeError("ArrayBuffer.combine accept only ArrayBuffer, TypeArray and DataView.");
			}
			temp += arg.length;
		}
		
		const buff = new Uint8Array(temp);
		
		
		
		temp = 0;
		for(const arg of args) {
			buff.set(arg, temp);
			temp += arg.length;
		}
		
		return buff.buffer;
	}
	});
})();
//@endexport
