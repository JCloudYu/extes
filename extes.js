(()=>{
"use strict";

const writable=true, configurable=true, enumerable=false;
const IsNodeJS = (typeof Buffer !== "undefined");
function Padding(val, length=2, stuffing='0'){
	val = `${val}`;
	let remain = length - val.length;
	while( remain-- > 0 ) {
		val = stuffing + val;
	}
	return val;
}

function ExtractBytes(content) {
	if( IsNodeJS ){
		if( Buffer.isBuffer(content) ){
			return new Uint8Array(content);
		}
	}
	
	if( ArrayBuffer.isView(content) ){
		return new Uint8Array(content.buffer);
	}
	
	if( content instanceof ArrayBuffer ){
		return new Uint8Array(content);
	}
	
	
	return null;
}
const UTF8_DECODE_CHUNK_SIZE = 100;

/**
 *	Encode given input js string using utf8 format
 *	@param {String} js_str
 *	@returns {Uint8Array}
**/
function UTF8Encode(js_str) {
	if ( typeof js_str !== "string" ) {
		throw new TypeError( "Given input argument must be a js string!" );
	}

	let codePoints = [];
	let i=0;
	while( i < js_str.length ) {
		let codePoint = js_str.codePointAt(i);
		
		// 1-byte sequence
		if( (codePoint & 0xffffff80) === 0 ) {
			codePoints.push(codePoint);
		}
		// 2-byte sequence
		else if( (codePoint & 0xfffff800) === 0 ) {
			codePoints.push(
				0xc0 | (0x1f & (codePoint >> 6)),
				0x80 | (0x3f & codePoint)
			);
		}
		// 3-byte sequence
		else if( (codePoint & 0xffff0000) === 0 ) {
			codePoints.push(
				0xe0 | (0x0f & (codePoint >> 12)),
				0x80 | (0x3f & (codePoint >> 6)),
				0x80 | (0x3f & codePoint)
			);
		}
		// 4-byte sequence
		else if( (codePoint & 0xffe00000) === 0 ) {
			codePoints.push(
				0xf0 | (0x07 & (codePoint >> 18)),
				0x80 | (0x3f & (codePoint >> 12)),
				0x80 | (0x3f & (codePoint >> 6)),
				0x80 | (0x3f & codePoint)
			);
		}
		
		i += (codePoint>0xFFFF) ? 2 : 1;
	}
	return new Uint8Array(codePoints);
}

/**
 *	Decode given input buffer using utf8 format
 *	@param {ArrayBuffer|Uint8Array} raw_bytes
 *	@returns {string}
**/
function UTF8Decode(raw_bytes) {
	if ( raw_bytes instanceof ArrayBuffer ) {
		raw_bytes = new Uint8Array(raw_bytes);
	}

	if ( !(raw_bytes instanceof Uint8Array) ) {
		throw new TypeError( "Given input must be an Uint8Array contains UTF8 encoded value!" );
	}

	let uint8 = raw_bytes;
	let codePoints = [];
	let i = 0;
	while( i < uint8.length ) {
		let codePoint = uint8[i] & 0xff;
		
		// 1-byte sequence (0 ~ 127)
		if( (codePoint & 0x80) === 0 ){
			codePoints.push(codePoint);
			i += 1;
		}
		// 2-byte sequence (192 ~ 223)
		else if( (codePoint & 0xE0) === 0xC0 ){
			codePoint = ((0x1f & uint8[i]) << 6) | (0x3f & uint8[i + 1]);
			codePoints.push(codePoint);
			i += 2;
		}
		// 3-byte sequence (224 ~ 239)
		else if( (codePoint & 0xf0) === 0xe0 ){
			codePoint = ((0x0f & uint8[i]) << 12)
				| ((0x3f & uint8[i + 1]) << 6)
				| (0x3f & uint8[i + 2]);
			codePoints.push(codePoint);
			i += 3;
		}
		// 4-byte sequence (249 ~ )
		else if( (codePoint & 0xF8) === 0xF0 ){
			codePoint = ((0x07 & uint8[i]) << 18)
				| ((0x3f & uint8[i + 1]) << 12)
				| ((0x3f & uint8[i + 2]) << 6)
				| (0x3f & uint8[i + 3]);
			codePoints.push(codePoint);
			i += 4;
		}
		else {
			i += 1;
		}
	}
	
	
	
	let result_string = "";
	while(codePoints.length > 0) {
		const chunk = codePoints.splice(0, UTF8_DECODE_CHUNK_SIZE);
		result_string += String.fromCodePoint(...chunk);
	}
	return result_string;
}

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
(()=>{
	Object.defineProperty(Array.prototype, 'unique', {
		writable, configurable, enumerable,
		value: function(){
			const set = new Set();
			for ( const item of this ) set.add(item);
			return Array.from(set);
		}
	});
	Object.defineProperty(Array.prototype, 'exclude', {
		writable, configurable, enumerable,
		value: function(reject_list) {
			if ( !Array.isArray(reject_list) ) {
				reject_list = [reject_list];
			}
		
			const new_ary = [];
			for(const item of this) {
				let reject = false;
				for(const reject_item of reject_list) {
					if ( item === reject_item ) {
						reject = reject || true;
						break;
					}
				}
				if ( !reject ) {
					new_ary.push(item);
				}
			}
		
			return new_ary;
		}
	});
	
	Object.defineProperty(Array, 'concat', {
		writable, configurable, enumerable,
		value: function(...elements) {
			const result = [];
			for(const element of elements) {
				if ( !Array.isArray(element) ) {
					result.push(element);
					continue;
				}
				
				for(const elm of element) {
					result.push(elm);
				}
			}
			
			return result;
		}
	});
	Object.defineProperty(Array, 'intersect', {
		writable, configurable, enumerable,
		value: function(...arrays) {
			let result = arrays[0]||[];
			if ( !Array.isArray(result) ) {
				throw new TypeError(`Array.intersect only accepts list array arguments!`);
			}
			
			for(let i=1; i<arrays.length; i++) {
				const array = arrays[i];
				if ( !Array.isArray(array) ) {
					throw new TypeError(`Array.intersect only accepts list array arguments!`);
				}
				
				const new_result = new Set();
				for(const elm of result) {
					if ( array.indexOf(elm) >= 0 ) {
						new_result.add(elm);
					}
				}
				
				result = Array.from(new_result);
			}
			return result;
		}
	})
})();
(()=>{
	if ( typeof Blob !== "undefined" ) {
		Object.defineProperty(Blob.prototype, 'arrayBuffer', {
			configurable, writable, enumerable,
			value:function() {
				return new Promise((resolve, reject)=>{
					const reader = new FileReader();
					reader.onerror = reject;
					reader.onload = ()=>resolve(reader.result);
					reader.readAsArrayBuffer(this);
				});
			}
		});
	}
})();
(()=>{
	Object.defineProperty(Date, 'from', {
		writable, configurable, enumerable,
		value: function(...args) {
			if ( args.length === 0 ) {
				throw new Error("Date.from expects at least one arguments!");
			}
			
			try {
				return new Date(...args);
			}
			catch(e) {
				return null;
			}
		}
	});
	Object.defineProperty(Date, 'present', {
		configurable, enumerable,
		get: ()=>new Date()
	});
	Object.defineProperty(Date, 'unix', {
		writable, configurable, enumerable,
		value: function() {
			return Math.floor(Date.now()/1000);
		}
	});
	Object.defineProperty(Date.prototype, 'getUnixTime', {
		writable, configurable, enumerable,
		value: function() {
			return Math.floor(this.getTime()/1000);
		}
	});
	Object.defineProperty(Date.prototype, 'unix', {
		configurable, enumerable,
		get: function() {
			return Math.floor(this.getTime()/1000);
		}
	});
	Object.defineProperty(Date.prototype, 'time', {
		configurable, enumerable,
		get: function() {
			return this.getTime();
		}
	});
	Object.defineProperty(Date.prototype, 'toLocaleISOString', {
		writable, configurable, enumerable,
		value: function(show_milli=true){
			let offset, zone = this.getTimezoneOffset();
			if ( zone === 0 ) {
				offset = 'Z';
			}
			else {
				const sign = zone > 0 ? '-' : '+';
				zone = Math.abs(zone);
				const zone_hour = Math.floor(zone/60);
				const zone_min  = zone%60;
				
				offset = sign + Padding(zone_hour) + Padding(zone_min);
			}
			
			
			const milli = show_milli ? ('.' + Padding(this.getMilliseconds() % 1000, 3)) : '';
			return  this.getFullYear() +
				'-' + Padding(this.getMonth()+1) +
				'-' + Padding(this.getDate()) +
				'T' + Padding(this.getHours()) +
				':' + Padding(this.getMinutes()) +
				':' + Padding(this.getSeconds()) +
				milli + offset;
		}
	});
})();
(()=>{
	if ( typeof Document !== "undefined" ) {
		Object.defineProperties(Document.prototype, {
			parseHTML: {
				configurable, writable, enumerable,
				value: function(html) {
					const shadow = this.implementation.createHTMLDocument();
					const shadowed_body = shadow.body;
					shadowed_body.innerHTML = html;
					if ( shadowed_body.children.length === 0 ) {
						return null;
					}
					
					if ( shadowed_body.children.length === 1 ) {
						const item = shadowed_body.children[0];
						item.remove();
						return item;
					}
					
					
					const elements = Array.prototype.slice.call(shadowed_body.children, 0);
					for(const element of elements) {
						element.remove();
					}
					return elements;
				}
			}
		});
	}
})();
(()=>{
	if ( typeof Element !== "undefined" ) {
		const _ELEMENT_SET_ATTRIBUTE		= Element.prototype.setAttribute;
		const _ELEMENT_REMOVE_ATTRIBUTE		= Element.prototype.removeAttribute;
		const _ELEMENT_SET_ATTRIBUTE_NS		= Element.prototype.setAttributeNS;
		const _ELEMENT_REMOVE_ATTRIBUTE_NS	= Element.prototype.removeAttributeNS;
		
		
		
		Object.defineProperties(Element.prototype, {
			addClass: {
				configurable, enumerable, writable,
				value: function(...classes) {
					const filtered = [];
					for( const class_name of classes ) {
						if ( class_name === undefined || class_name === null || class_name === '' ) {
							continue;
						}
						
						filtered.push(class_name);
					}
					
					this.classList.add(...filtered);
					return this;
				}
			},
			removeClass: {
				configurable, enumerable, writable,
				value: function(...classes) {
					const filtered = [];
					for( const class_name of classes ) {
						if ( class_name === undefined || class_name === null || class_name === '' ) {
							continue;
						}
						
						filtered.push(class_name);
					}
				
					this.classList.remove(...filtered);
					return this;
				}
			},
			setAttribute: {
				configurable, enumerable, writable,
				value: function(name, value) {
					if ( arguments.length < 2 ) { value = ''; }
					_ELEMENT_SET_ATTRIBUTE.call(this, name, value);
					return this;
				}
			},
			removeAttribute: {
				configurable, enumerable, writable,
				value: function(...args) {
					_ELEMENT_REMOVE_ATTRIBUTE.apply(this, args);
					return this;
				}
			},
			setAttributeNS: {
				configurable, enumerable, writable,
				value: function(...args) {
					_ELEMENT_SET_ATTRIBUTE_NS.apply(this, args);
					return this;
				}
			},
			removeAttributeNS: {
				configurable, enumerable, writable,
				value: function(...args) {
					_ELEMENT_REMOVE_ATTRIBUTE_NS.apply(this, args);
					return this;
				}
			},
		});
	}
})();
(()=>{
	if ( typeof Error !== "undefined" ) {
		Object.defineProperty(Error.prototype, 'stack_trace', {
			get: function(){
				if ( !this.stack ) return null;
				return this.stack.split(/\r\n|\n/g).map((item)=>item.trim());
			},
			enumerable, configurable
		});
		
		Object.defineProperty(Error, 'trap', {
			writable, configurable, enumerable,
			value: function(func, default_result=undefined) {
				const args = Array.prototype.slice.call(arguments, 0);
				let result;
				try { result = func();}
				catch(e) { return args.length < 2 ? e : default_result; }
				
				
				
				if ( result instanceof Promise ) {
					return result.catch((e)=>{
						return args.length < 2 ? e : default_result;
					});
				}
				
				return result;
			}
		});
		
		Object.defineProperty(Error, 'trapper', {
			writable, configurable, enumerable,
			value: function(func, callback) {
				return function(...args) {
					let result;
					try { result = func(...args); } catch(e) { callback(e); return; }
					
					
					
					if ( result instanceof Promise ) {
						return result.catch(e=>callback(e));
					}
					
					return result;
				};
			}
		});
	}
})();
(()=>{
	if ( typeof EventTarget !== "undefined" ) {
		Object.defineProperty(EventTarget.prototype, 'on', {
			configurable, writable, enumerable,
			value: function(event_name, callback) {
				// Event name accepts name1#tag1,name2#tag1,name3#tag2
				const inserted = [];
				const events = event_name.split(',');
				for( let evt_name of events ) {
					evt_name = evt_name.trim();
					if ( inserted.indexOf(evt_name) >= 0 ) continue;
					
					inserted.push(evt_name);
					this.addEventListener(evt_name, callback);
				}
				return this;
			}
		});
		Object.defineProperty(EventTarget.prototype, 'off', {
			configurable, writable, enumerable,
			value: function(event_name, callback) {
				const events = event_name.split(',');
				for( let evt_name of events ) {
					evt_name = evt_name.trim();
					this.removeEventListener(evt_name, callback);
				}
				return this;
			}
		});
		Object.defineProperty(EventTarget.prototype, 'emit', {
			configurable, writable, enumerable,
			value: function(event, inits={}) {
				const {bubbles, cancelable, composed, ...event_args} = inits;
				
				if ( typeof event === "string" ) {
					event = new Event(event, {
						bubbles:!!bubbles,
						cancelable:!!cancelable,
						composed:!!composed
					});
				}
				
				if ( !(event instanceof Event) ) {
					throw new TypeError("Argument 1 accepts only string or Event instance!");
				}
				
				
				
				Object.assign(event, event_args);
				this.dispatchEvent(event);
			}
		});
	}
})();
(()=>{
	if ( typeof Error !== "undefined" ) {
		class EError extends Error {
			constructor(message, ...args) {
				super(message, ...args);
				
				if ( Error.captureStackTrace ) {
					Error.captureStackTrace(this, this.constructor);
				}
				
				
				
				const now = Date.now();
				Object.defineProperties(this, {
					name: {
						configurable:false, writable:false, enumerable:false,
						value:this.constructor.name
					},
					time: {
						configurable:false, writable:false, enumerable:false,
						value:Math.floor(now/1000)
					},
					time_milli: {
						configurable:false, writable:false, enumerable:false,
						value:now
					}
				});
			}
		}
		class IndexedError extends EError {
			constructor(error_info, detail=null, ...args) {
				if ( Object(error_info) !== error_info ) {
					throw new TypeError("IndexedError constructor accepts only objects!");
				}
			
				const {code, key, message=null, msg=null} = error_info;
				if ( typeof code !== "number" || typeof key !== "string" ) {
					throw new TypeError("IndexedError error info object must contains a numeric `code` field and a string `key` field");
				}
				
				
				if (message !== null) {
					args.unshift(''+message);
				}
				else
				if (msg !== null) {
					args.unshift(''+msg);
				}
				else {
					args.unshift('');
				}
				
				super(...args);
				
				
				
				Object.defineProperties(this, {
					code:{
						configurable:false, writable:false, enumerable:false,
						value:code
					},
					key:{
						configurable:false, writable:false, enumerable:false,
						value:key
					},
					detail: {
						configurable:false, writable:false, enumerable:false,
						value:detail
					}
				});
			}
			toJSON() {
				const result = {
					code:this.code,
					key:this.key,
					msg:this.message,
					detail:undefined,
					time:this.time,
					time_milli:this.time_milli
				};
				
				if ( this.detail !== null && this.detail !== undefined ) {
					if ( Array.isArray(this.detail) ) {
						result.detail = this.detail.slice(0);
					}
					else
					if ( Object(this.detail) === this.detail ) {
						result.detail = Object.assign({}, this.detail);
					}
					else {
						result.detail = this.detail;
					}
				}
				
				return result;
			}
		}
		
		Object.defineProperties(Error, {
			EError: {
				configurable, writable, enumerable,
				value:EError
			},
			IndexedError: {
				configurable, writable, enumerable,
				value:IndexedError
			}
		});
	}
})();
(()=>{
	const REF = new WeakMap();
	const boot_async={}, boot_sync={};
	REF.set(boot_async, {async:true,  funcs:[]});
	REF.set(boot_sync,  {async:false, funcs:[]});
	
	
	
	Object.defineProperty(Function, 'sequential', {
		configurable, writable, enumerable,
		value: PackSequentialCall.bind(null, false)
	});
	Object.defineProperty(Function.sequential, 'async', {
		configurable: false, writable: false, enumerable: true,
		value: PackSequentialCall.bind(null, true)
	});
	
	
	
	function PackSequentialCall(is_async, func_list) {
		const args = Array.prototype.slice.call(arguments, 0);
		args[0] = is_async?boot_async:boot_sync;
		return PackSequential.call(...args);
	}
	function PackSequential(func_list) {
		const prev_state = REF.get(this);
		const state = {async:prev_state.async, funcs:prev_state.funcs.slice(0)};
		
		if ( arguments.length > 0 ) {
			let func;
			if ( !Array.isArray(func_list) ) { func_list = [func_list]; }
			for( let i = 0; i < func_list.length; i++ ){
				state.funcs.push((typeof (func=func_list[i]) === "function") ? func : ()=>func);
			}
		}
		
		const storage = {};
		REF.set(storage, state);
		const trigger = DoSequentialCall.bind(storage);
		trigger.chain = PackSequential.bind(storage);
		Object.defineProperty(trigger, 'data', {configurable, enumerable:true, writable, value:storage});
		
		return trigger;
	}
	function DoSequentialCall(...spread_args) {
		const {async:is_async, funcs:chain_items} = REF.get(this);
		this.current_call = {};
		
		
		
		let result = undefined;
		if ( !is_async ) {
			for( const func of chain_items ){
				result = func.call(this, ...spread_args, result);
				if( result === false ) break;
			}
			return result;
		}
		else {
			return Promise.resolve().then(async()=>{
				for( const func of chain_items ){
					result = await func.call(this, ...spread_args, result);
					if( result === false ) break;
				}
				return result;
			});
		}
	}
})();
(()=>{
	if ( typeof HTMLElement !== "undefined" ) {
		Object.defineProperties(HTMLElement.prototype, {
			setData: {
				configurable, writable, enumerable,
				value: function(key, value) {
					if ( Object(key) === key ) {
						for(const _key in key) {
							this.dataset[_key] = key[_key];
						}
					}
					else {
						this.dataset[key] = value;
					}
					return this;
				}
			},
			getData: {
				configurable, writable, enumerable,
				value: function(key) {
					return this.dataset[key];
				}
			},
			removeData: {
				configurable, writable, enumerable,
				value: function(...data_names) {
					for( const name of data_names ) {
						delete this.dataset[name];
					}
					return this;
				}
			},
			setContentHtml: {
				configurable, writable, enumerable,
				value: function(html) {
					this.innerHTML = html;
					return this;
				}
			}
		});
	}
})();
(()=>{
	if ( typeof HTMLInputElement !== "undefined" ) {
		Object.defineProperty( HTMLInputElement.prototype, 'setValue', {
			configurable, writable, enumerable,
			value: function(value) {
				this.value = value;
				return this;
			}
		});
	}
})();
(()=>{
	if ( typeof Node !== "undefined" ) {
		Object.defineProperty( Node.prototype, 'prependChild', {
			configurable, writable, enumerable,
			value: function(child) {
				this.insertBefore(child, this.children[0]||null);
				return ( this instanceof DocumentFragment ) ? new DocumentFragment() : child;
			}
		});
		Object.defineProperty( Node.prototype, 'insertNeighborBefore', {
			configurable, writable, enumerable,
			value: function(child) {
				if ( !this.parentNode ) {
					throw new RangeError( "Reference element is currently in detached mode! No way to add neighbors!" );
				}
			
				this.parentNode.insertBefore(child, this);
				return ( this instanceof DocumentFragment ) ? new DocumentFragment() : child;
			}
		});
		Object.defineProperty( Node.prototype, 'insertNeighborAfter', {
			configurable, writable, enumerable,
			value: function(child) {
				if ( !this.parentNode ) {
					throw new RangeError( "Reference element is currently in detached mode! No way to add neighbors!" );
				}
				
				this.parentNode.insertBefore(child, this.nextSibling);
				return ( this instanceof DocumentFragment ) ? new DocumentFragment() : child;
			}
		});
		Object.defineProperty( Node.prototype, 'setContentText', {
			configurable, writable, enumerable,
			value: function(text) {
				this.textContent = text;
				return this;
			}
		});
	}
})();
(()=>{
	const _ObjectDefineProperty = Object.defineProperty;
	const _ObjectDefineProperties = Object.defineProperties;
	
	
	
	_ObjectDefineProperty(Object, 'defineProperty', {
		writable, configurable, enumerable,
		value: ObjectDefineProperty
	});
	_ObjectDefineProperty(Object, 'defineProperties', {
		writable, configurable, enumerable,
		value: ObjectDefineProperties
	});
	Object.defineProperty(Object, 'merge', {
		writable, configurable, enumerable,
		value: ObjectMerge
	});
	Object.defineProperty(Object, 'typeOf', {
		writable, configurable, enumerable,
		value: TypeOf
	});
	Object.defineProperty(Object.prototype, '_decorate', {
		writable, configurable, enumerable,
		value: function(processor, ...args) {
			if ( typeof processor === "function" ) {
				processor.call(this, ...args);
			}
			return this;
		}
	});
	
	
	
	
	
	function ObjectDefineProperty(object, prop_name, prop_attr) {
		_ObjectDefineProperty(object, prop_name, prop_attr);
		return object;
	}
	function ObjectDefineProperties(object, prop_contents) {
		_ObjectDefineProperties(object, prop_contents);
		return object;
	}
	function ObjectMerge(target, source) {
		if ( Object(target) !== target ) {
			throw new Error("Given target is not an object");
		}
		
		if ( Object(source) !== source ) {
			throw new Error("Given source is not an object");
		}
		
		
		for (const key in source) {
			if ( (source.hasOwnProperty && !source.hasOwnProperty(key)) ||
				 (source[key] === undefined)
			) { continue; }
		
			
			
			const tValue = target[key];
			const sValue = source[key];
			const tType	 = TypeOf(tValue);
			const sType	 = TypeOf(sValue);
			
			if ( tType !== "object" || sType !== "object" ) {
				if ( target instanceof Map ) {
					target.set(key, sValue);
				}
				else {
					target[key] = sValue;
				}
				continue;
			}
			
			ObjectMerge(tValue, sValue);
		}
		
		return target;
	}
	function TypeOf(input, resolveObj=false) {
		const type = typeof input;
		switch(type) {
			case "number":
			case "string":
			case "function":
			case "boolean":
			case "undefined":
			case "symbol":
				return type;
		}
		
		if ( input === null ) {
			return "null";
		}
		
		if ( input instanceof String ) {
			return "string";
		}
		
		if ( input instanceof Number ) {
			return "number";
		}
		
		if ( input instanceof Boolean ) {
			return "boolean";
		}
		
		if ( Array.isArray(input) ) {
			return "array";
		}
		
		
		if ( !resolveObj ) {
			return "object";
		}
		
		
		// None-primitive
		if ( input instanceof ArrayBuffer ) {
			return "array-buffer"
		}
		
		if ( input instanceof DataView ) {
			return "data-view";
		}
		
		if ( input instanceof Uint8Array ) {
			return "uint8-array";
		}
		
		if ( input instanceof Uint8ClampedArray ) {
			return "uint8-clamped-array";
		}
		
		if ( input instanceof Int8Array ) {
			return "int8-array";
		}
		
		if ( input instanceof Uint16Array ) {
			return "uint16-array";
		}
		
		if ( input instanceof Int16Array ) {
			return "int16-array";
		}
		
		if ( input instanceof Uint32Array ) {
			return "uint32-array";
		}
		
		if ( input instanceof Int32Array ) {
			return "int32-array";
		}
		
		if ( input instanceof Float32Array ) {
			return "float32-array";
		}
		
		if ( input instanceof Float64Array ) {
			return "float64-array";
		}
		
		if ( input instanceof Map ) {
			return "map";
		}
		
		if ( input instanceof WeakMap ) {
			return "weak-map";
		}
		
		if ( input instanceof Set ) {
			return "set";
		}
		
		if ( input instanceof WeakSet ) {
			return "weak-set";
		}
		
		if ( input instanceof RegExp ) {
			return "regexp"
		}
		
		if ( input instanceof Promise ) {
			return "promise";
		}
		
		return "object";
	}
})();
(()=>{
	const _PROMISE_THEN = Promise.prototype.then;
	const _PROMISE_CATCH = Promise.prototype.catch;
	const _PROMISE_FINALLY = Promise.prototype.finally;
	
	Object.defineProperties(Promise.prototype, {
		then: {
			writable, configurable, enumerable,
			value: function(...args) {
				return DecorateChainedPromise(_PROMISE_THEN.call(this, ...args), this);
			}
		},
		catch: {
			writable, configurable, enumerable,
			value: function(...args) {
				return DecorateChainedPromise(_PROMISE_CATCH.call(this, ...args), this);
			}
		},
		finally: {
			writable, configurable, enumerable,
			value: function(...args) {
				return DecorateChainedPromise(_PROMISE_FINALLY.call(this, ...args), this);
			}
		},
		guard: {
			writable, configurable, enumerable,
			value: function() {
				return DecorateChainedPromise(_PROMISE_CATCH.call(this, (e)=>{
					setTimeout(()=>{
						if ( IsNodeJS ) {
							throw e;
						}
						else {
							const event = new Event('unhandledRejection');
							event.error = e;
							
							window.dispatchEvent(event);
						}
					}, 0);
					
					return e;
				}), this);
			}
		}
	});
	Object.defineProperties(Promise, {
		wait: {
			writable, configurable, enumerable,
			value: PromiseWaitAll
		},
		create: {
			writable, configurable, enumerable,
			value: FlattenedPromise
		}
	});
	
	
	
	
	
	
	function PromiseWaitAll(promise_queue=[]) {
		if ( !Array.isArray(promise_queue) ){
			promise_queue = [promise_queue];
		}
		
		if( promise_queue.length === 0 ) {
			return Promise.resolve([]);
		}
		
		return new Promise((resolve, reject) =>{
			let result_queue=[], ready_count=0, resolved = true;
			for(let idx=0; idx<promise_queue.length; idx++) {
				let item = {resolved:true, seq:idx, result:null};
				
				result_queue.push(item);
				Promise.resolve(promise_queue[idx]).then(
					(result)=>{
						resolved = (item.resolved = true) && resolved;
						item.result = result;
					},
					(error)=>{
						resolved = (item.resolved = false) && resolved;
						item.result = error;
					}
				).then(()=>{
					ready_count++;
					
					if ( promise_queue.length === ready_count ) {
						(resolved?resolve:reject)(result_queue);
					}
				});
			}
		});
	}
	function FlattenedPromise() {
		let _resolve=null, _reject=null;
		const promise = new Promise((resolve, reject)=>{
			_resolve=resolve;
			_reject=reject;
		});
		promise.resolve = _resolve;
		promise.reject = _reject;
		promise.promise = promise;
		return promise;
	}
	function DecorateChainedPromise(next_promise, previous) {
		for( const prop of Object.keys(previous)) {
			next_promise[prop] = previous[prop];
		}
		
		return next_promise;
	}
})();
(()=>{
	const CAMEL_CASE_PATTERN = /(\w)(\w*)(\W*)/g;
	const CAMEL_REPLACER = (match, $1, $2, $3, index, input )=>{
		return `${$1.toUpperCase()}${$2.toLowerCase()}${$3}`;
	};
	
	function StringTemplateResolver(strings, ...dynamics) {
		if ( this instanceof StringTemplateResolver ) {
			
			this.strings = strings;
			this.fields = dynamics;
			return;
		}
	
		return new StringTemplateResolver(strings, ...dynamics);
	}
	StringTemplateResolver.prototype = {
		[Symbol.iterator]() {
			const strings  = this.strings.slice(0).reverse();
			const dynamics = this.fields.slice(0).reverse();
			
			let i=0;
			return {
				next:()=>{
					if ( strings.length === 0 ) {
						return {done:true};
					}
					
					let value;
					if ( i%2===0 ) {
						value = strings.pop();
					}
					else {
						value = dynamics.pop();
					}
					
					i = i+1;
					return {value};
				}
			};
		},
		toString() {
			let str = '';
			for(const item of this) {
				str += '' + item;
			}
			return str;
		}
	};
	
	
	
	Object.defineProperties(String.prototype, {
		charCount: {
			configurable, enumerable,
			get:function() {
				let i=0, count = 0;
				while(i<this.length) {
					const point  = this.codePointAt(i);
					const length = ( point > 0xFFFF ) ? 2 : 1;
					count ++;
					i += length;
				}
				return count;
			}
		},
		upperCase:{
			configurable, enumerable,
			get:function() {
				return this.toUpperCase();
			}
		},
		localeUpperCase:{
			configurable, enumerable,
			get:function() {
				return this.toLocaleUpperCase();
			}
		},
		lowerCase:{
			configurable, enumerable,
			get:function() {
				return this.toLowerCase();
			}
		},
		localeLowerCase:{
			configurable, enumerable,
			get:function() {
				return this.toLocaleLowerCase();
			}
		},
		toCamelCase: {
			configurable, enumerable,
			value:function() {
				return this.replace(CAMEL_CASE_PATTERN, CAMEL_REPLACER);
			}
		},
		camelCase: {
			configurable, enumerable,
			get:function() {
				return this.replace(CAMEL_CASE_PATTERN, CAMEL_REPLACER);
			}
		},
		pull: {
			configurable, enumerable, writable,
			value:function(token_separator='', from_begin=true) {
				if ( typeof token_separator !== "string" ) {
					throw new TypeError("Given token must be a string");
				}
				
				const length = this.length;
				if ( length === 0 ) {
					return ['', ''];
				}
				
				if ( token_separator === '' ) {
					return from_begin ? [ this[0], this.substring(1) ] : [ this.substring(0, length-1), this[length-1] ];
				}
				
				
				if ( from_begin ) {
					const index = this.indexOf(token_separator, token_separator.length);
					if ( index < 0 ) {
						return [this.substring(0), ''];
					}
					
					return [this.substring(0, index), this.substring(index)];
				}
				else {
					const index = this.lastIndexOf(token_separator);
					if ( index < 0 ) {
						return ['', this.substring(0)];
					}
					
					return [this.substring(0, index), this.substring(index)];
				}
			}
		},
		pop: {
			configurable, enumerable, writable,
			value:function(token_separator='') {
				return this.pull(token_separator, true);
			}
		},
		shift: {
			configurable, enumerable, writable,
			value:function(token_separator='') {
				return this.pull(token_separator, false);
			}
		}
	});
	Object.defineProperties(String, {
		encodeRegExpString: {
			writable, configurable, enumerable,
			value: function(input_string='') {
				return input_string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
			}
		},
		template: {
			writable, configurable, enumerable,
			value:StringTemplateResolver
		},
		from: {
			writable, configurable, enumerable,
			value:(content)=>{
				if ( typeof content === "string" ) return content;
				
				const bytes = ExtractBytes(content);
				if ( bytes !== null ) {
					return UTF8Decode(bytes);
				}
				
				return ''+content;
			}
		}
	});
})();
(()=>{
	Object.defineProperty(setTimeout, 'create', {
		writable, configurable, enumerable,
		value:ThrottledTimeout
	});
	Object.defineProperty(setTimeout, 'idle', {
		writable, configurable, enumerable,
		value:Idle
	});
	Object.defineProperty(setInterval, 'create', {
		writable, configurable, enumerable,
		value:ThrottledTimer
	});
	
	
	
	function ThrottledTimeout() {
		let _scheduled	= null;
		let _executing	= false;
		let _hTimeout	= null;
		const timeout_cb = (cb, delay=0, ...args)=>{
			_scheduled = {cb, delay, args};
			
			if ( _executing ) return;
			
			
			if ( _hTimeout ) {
				clearTimeout(_hTimeout);
				_hTimeout = null;
			}
			__DO_TIMEOUT();
		};
		timeout_cb.clear=()=>{
			_scheduled = null;
			if ( _hTimeout ) {
				clearTimeout(_hTimeout);
				_hTimeout = null;
			}
		};
		return timeout_cb;
		
		
		
		function __DO_TIMEOUT() {
			if ( !_scheduled ) return;
		
			let {cb, delay, args} = _scheduled;
			_hTimeout = setTimeout(()=>{
				_executing = true;
				
				Promise.resolve(cb(...args))
				.then(
					()=>{
						_executing = false;
						_hTimeout = null;
						
						__DO_TIMEOUT();
					},
					(e)=>{
						_executing	= false;
						_hTimeout	= null;
						_scheduled	= null;
						
						throw e;
					}
				);
			}, delay);
			_scheduled = null;
		}
	}
	function Idle(duration=0) {
		return new Promise((resolve)=>{setTimeout(resolve, duration)});
	}
	function ThrottledTimer() {
		const _timeout = ThrottledTimeout();
		const timeout_cb = (cb, interval=0, ...args)=>{
			const ___DO_TIMEOUT=async()=>{
					_timeout(___DO_TIMEOUT, interval);
					
					try {
						await cb(...args);
					}
					catch(e) {
						_timeout.clear();
						throw e;
					}
				};
			_timeout(___DO_TIMEOUT, interval, ...args);
		};
		timeout_cb.clear=()=>{
			_timeout.clear();
		};
		return timeout_cb;
	}
})();
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

})();