/**
 *	Author: JCloudYu
 *	Create: 2019/07/19
**/
import {UTF8Encode} from "./_helper/utf8.esm.js";

Object.defineProperty(ArrayBuffer.prototype, 'bytes', {
	get:function(){ return new Uint8Array(this); },
	configurable:true, enumerable:false
});

ArrayBuffer.extract = function(input) {
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
};
ArrayBuffer.from = function(input, conversion_info=null) {
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
		return UTF8Encode(input).buffer;
	}
	
	throw new TypeError( "Cannot convert given input data into array buffer" );
};
