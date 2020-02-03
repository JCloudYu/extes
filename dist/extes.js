(()=>{"use strict";
const writable=true, configurable=true, enumerable=false;
const IsNodeJS = (typeof Buffer !== "undefined");
const ExtES=(()=>{
	const GLOBAL = IsNodeJS ? global : window;
	return GLOBAL.ExtES = Object.create(null);
})();
function Padding(val, length=2, stuffing='0'){
	val = `${val}`;
	let remain = length - val.length;
	while( remain-- > 0 ) {
		val = stuffing + val;
	}
	return val;
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
	"use strict";

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
		value:function(format=16, padding=false){
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
})();
(()=>{
	"use strict";

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
})();
(()=>{
	"use strict";

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
	"use strict";

	Object.defineProperty(Date.prototype, 'toLocaleISOString', {
		writable, configurable, enumerable,
		value: function(){
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
			
			
		
			return  this.getFullYear() +
				'-' + Padding(this.getMonth()+1) +
				'-' + Padding(this.getDate()) +
				'T' + Padding(this.getHours()) +
				':' + Padding(this.getMinutes()) +
				':' + Padding(this.getSeconds()) +
				'.' + (this.getMilliseconds() % 1000) +
				offset;
		}
	});
})();
(()=>{
	"use strict";
	
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
	"use strict";

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
	"use strict";
	
	if ( typeof Error !== "undefined" ) {
		Object.defineProperty(Error.prototype, 'stack_trace', {
			get: function(){
				if ( !this.stack ) return null;
				return this.stack.split(/\r\n|\n/g).map((item)=>item.trim());
			},
			enumerable, configurable
		});
	}
})();
(()=>{
	"use strict";
	
	if ( typeof EventTarget !== "undefined" ) {
	
		Object.defineProperty(EventTarget.prototype, 'on', {
			configurable, writable, enumerable,
			value: function(event_name, callback) {
				// Event name accepts name1#tag1,name2#tag1,name3#tag2
				const inserted = [];
				const events = event_name.split(',');
				for( let evt_name of events ) {
					[evt_name] = evt_name.split('#');
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
				this.removeEventListener(event_name, callback);
				return this;
			}
		});
		Object.defineProperty(EventTarget.prototype, 'emit', {
			configurable, writable, enumerable,
			value: function(event) {
				if ( typeof event === "string" ) {
					event = new Event(event);
				}
				
				if ( event instanceof Event ) {
					throw new TypeError("Argument 1 accepts only string or Event instance!");
				}
				
				this.dispatchEvent(event);
			}
		});
	}
})();
(()=>{
	"use strict";

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
					result.detail = Object.assign({}, this.detail);
				}
				
				return result;
			}
		}
		
		Object.defineProperties(ExtES, {
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
	"use strict";
	
	if ( typeof HTMLElement !== "undefined" ) {
		const _PRIVATES = new WeakMap();
		class _HTMLElementAccessor {
			constructor(element=null) {
				const _PRIVATE = Object.assign(Object.create(null), {
					element:null, exported:Object.create(null),
					func_bind: _HTMLElementAccessor.prototype.bind.bind(this),
					func_relink: _HTMLElementAccessor.prototype.relink.bind(this),
				});
				_PRIVATES.set(this, _PRIVATE);
				
				
				if ( arguments.length === 0 ) return;
				
				this.bind(element);
			}
			bind(element) {
				if ( !(element instanceof Element) ) {
					throw new TypeError( "HTMLElementAccessor constructor only accept Element instances!" );
				}
				
				const _PRIVATE = _PRIVATES.get(this);
				_PRIVATE.element = element;
				_PRIVATE.exported = Object.create(null);
				
				this.relink();
			}
			relink() {
				const _PRIVATE = _PRIVATES.get(this);
				_PRIVATE.exported = Object.create(null);
				
				
				const {element, exported} = _PRIVATE;
				const exported_items = element.querySelectorAll('[elm-export]');
				for( const item of exported_items ) {
					const export_name = item.getAttribute('elm-export');
					exported[export_name] = item;
				}
			}
		}
		const HTMLElementAccessorProxy = {
			getPrototypeOf: function(obj) {
				return Object.getPrototypeOf(obj);
			},
			get: function(obj, prop) {
				const {element, exported, func_bind, func_relink} = _PRIVATES.get(obj);
				if ( prop === 'element' ) return element;
				if ( prop === 'bind' ) return func_bind;
				if ( prop === 'relink' ) return func_relink;
				
				return exported[prop] || obj[prop];
			},
			set: function(obj, prop, value) {
				if ( prop === "element" ) return false;
				if ( prop === "bind" ) return false;
				if ( prop === "relink" ) return false;
				
				const {exported} = _PRIVATES.get(obj);
				if ( !exported[prop] ) {
					obj[prop] = value;
				}
				return true;
			}
		};
		const HTMLElementAccessor = new Proxy(_HTMLElementAccessor, {
			construct(target, args) {
				const inst = new target(...args);
				return new Proxy(inst, HTMLElementAccessorProxy);
			},
			apply() {
				throw new TypeError( "Class constructor a cannot be invoked without 'new'" );
			}
		});
		class HTMLElementTemplate {
			constructor(element) {
				if ( typeof element === "string" ) {
					var tmp = document.implementation.createHTMLDocument();
					tmp.body.innerHTML = element;
					if ( tmp.body.children.length !== 1 ) {
						throw new TypeError( "HTMLTemplate constructor only html string that is resolved as single Element instance!" );
					}
					
					element = tmp.body.children[0];
				}
				else
				if ( element instanceof Element ){
					element = element.cloneNode(true);
				}
				else {
					throw new TypeError( "HTMLTemplate constructor only accepts an Element instance!" );
				}
				
				
				
				Object.defineProperties(this, {
					_tmpl_elm: {
						configurable:false, writable:false, enumerable:false,
						value:element
					}
				});
			}
			produce() {
				console.warn("HTMLElementTemplate::produce is deprecated! Please use HTMLElementTemplate::duplicate instead!");
				return this.duplicate();
			}
			duplicate() {
				return new HTMLElementAccessor(this._tmpl_elm.cloneNode(true));
			}
		}
		
		
		
		Object.defineProperties(ExtES, {
			HTMLElementTemplate: {
				configurable, writable, enumerable,
				value:HTMLElementTemplate
			},
			HTMLElementAccessor:{
				configurable, writable, enumerable,
				value:HTMLElementAccessor
			}
		});
	}
})();
(()=>{
	"use strict";

	Object.defineProperty(Function, 'sequentialExecutor', {
		configurable, writable, enumerable,
		value: EncapsulateSequentialExecutor.bind(null, false)
	});
	Object.defineProperty(Function.sequentialExecutor, 'async', {
		configurable, writable, enumerable,
		value: EncapsulateSequentialExecutor.bind(null, true)
	});
	
	function EncapsulateSequentialExecutor(force_async, func_list, ...bound_args) {
		if ( !Array.isArray(func_list) ) {
			bound_args.unshift(func_list);
			func_list = bound_args;
			bound_args = [];
		}
	
		const functions = [];
		let async_mode = force_async;
		for ( const func of func_list ) {
			if ( typeof func !== "function" ) {
				functions.push(()=>func);
				continue;
			}
		
			async_mode = async_mode || func.constructor.name === "AsyncFunction";
			functions.push(func);
		}
		
		
		
		const singleton = {};
		return function(...init_args) {
			let should_stop = false;
			const args = [...bound_args, ...init_args];
			const inst = {};
			Object.defineProperties(inst, {
				singleton:{value:singleton, configurable:false, writable:false, enumerable:false},
				stop: {value:()=>{should_stop=true}, configurable:false, writable:false, enumerable:false}
			});
			
			
			
			if ( async_mode ) {
				return Promise.resolve()
				.then(async()=>{
					let result = undefined;
					for ( const func of functions ) {
						result = await func.call(inst, ...args);
						if ( should_stop ) break;
						args.splice(0, args.length);
						args.push(...bound_args);
						if ( result !== undefined ) {
							args.push(result);
						}
					}
					return result;
				});
			}
			
			
			
			let result = undefined;
			for ( const func of functions ) {
				result = func.call(inst, ...args);
				if ( should_stop ) break;
				args.splice(0, args.length);
				args.push(...bound_args);
				if ( result !== undefined ) {
					args.push(result);
				}
			}
			return result;
		};
	}
})();
(()=>{
	"use strict";
	
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
	"use strict";
	
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
	"use strict";

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
		Object.defineProperty( Node.prototype, 'process', {
			configurable, writable, enumerable,
			value: function(processor, ...args) {
				if ( typeof processor === "function" ) {
					processor.call(this, ...args);
				}
				return this;
			}
		});
	}
})();
(()=>{
	"use strict";
	
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
	
	Object.defineProperty(Object, 'assignProperties', {
		writable, configurable, enumerable,
		value: ObjectAssignProperties
	});
	Object.defineProperty(Object, 'assignValues', {
		writable, configurable, enumerable,
		value: ObjectAssignValues
	});
	Object.defineProperty(Object, 'assignConstants', {
		writable, configurable, enumerable,
		value: (dst, src, enumerable=false)=>{
			return ObjectAssignValues(dst, src, {
				configurable:false, writable:false, enumerable
			});
		}
	});
	Object.defineProperty(Object, 'merge', {
		writable, configurable, enumerable,
		value: ObjectMerge
	});
	Object.defineProperty(Object, 'generate', {
		writable, configurable, enumerable,
		value: ObjectGenerate
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
	function ObjectAssignProperties(object, props, attr={configurable:true, enumerable:false, writable:true}) {
		const _i_conf = !!attr.configurable;
		const _i_enum = !!attr.enumerable;
		const _i_writ = !!attr.writable;
		
		for( const prop in props ) {
			const descriptor = props[prop];
			if ( Object(descriptor) !== descriptor ) continue;
			
			
			const is_accessor = (descriptor.get || descriptor.set);
			const is_data = (descriptor.value || descriptor.writable);
			
			if ( is_accessor && is_data ) {
				throw new SyntaxError( "A property descriptor can be either an accessor descriptor or a data descriptor" );
			}
			
			if ( is_accessor ) {
				_ObjectDefineProperty(object, prop, {
					get: descriptor.get,
					set: descriptor.set,
					configurable:descriptor.configurable === undefined ? _i_conf : !!descriptor.configurable,
					enumerable:descriptor.enumerable === undefined ? _i_enum : !!descriptor.enumerable
				});
			}
			else {
				_ObjectDefineProperty(object, prop, {
					value:descriptor.value,
					configurable:descriptor.configurable === undefined ? _i_conf : !!descriptor.configurable,
					enumerable:descriptor.enumerable === undefined ? _i_enum : !!descriptor.enumerable,
					writable:descriptor.writable === undefined ? _i_writ : !!descriptor.writable
				});
			}
		}
		
		return object;
	}
	function ObjectAssignValues(object, props, attr={configurable:true, enumerable:false, writable:true}) {
		const configurable = !!attr.configurable;
		const enumerable = !!attr.enumerable;
		const writable = !!attr.writable;
	
		for ( const prop in props ) {
			const value = props[prop];
			if ( props[prop] === undefined ) continue;
			
			_ObjectDefineProperty(object, prop, {
				value, configurable, enumerable, writable
			});
		}
		
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
	function ObjectGenerate(field, prototype=null) {
		const object = Object.create(prototype);
		if ( Object(field) === field ) {
			Object.assign(object, field);
		}
		return object;
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
	"use strict";
	
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
			if ( prop === "_prev" ) continue;
			next_promise[prop] = previous[prop];
		}
		
		Object.defineProperty(next_promise, '_prev', {
			value:previous, configurable, enumerable, writable
		});
		return next_promise;
	}
})();
(()=>{
	"use strict";
	
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
		upperCase:{
			configurable, enumerable,
			get:function() {
				return this.toUpperCase();
			},
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
		pop: {
			configurable, enumerable, writable,
			value:function(token='') {
				if ( typeof token !== "string" ) {
					throw new TypeError("Given token must be a string");
				}
				
				if ( this === '' ) {
					return ['', ''];
				}
				
				if ( token === '' ) {
					return [ this[0], this.substring(1) ];
				}
			
				const index = this.indexOf(token, token.length);
				if ( index < 0 ) {
					return [this.substring(0), ''];
				}
				
				return [this.substring(0, index), this.substring(index)];
			}
		},
		shift: {
			configurable, enumerable, writable,
			value:function(token='') {
				if ( typeof token !== "string" ) {
					throw new TypeError("Given token must be a string");
				}
				
				const length = this.length;
				if ( length === 0 ) {
					return ['', ''];
				}
				
				if ( token === '' ) {
					return [ this.substring(0, length-1), this[length-1] ];
				}
			
				const index = this.lastIndexOf(token);
				if ( index < 0 ) {
					return ['', this.substring(0)];
				}
				
				return [this.substring(0, index), this.substring(index)];
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
		stringTemplate: {
			writable, configurable, enumerable,
			value:StringTemplateResolver
		}
	});
})();
(()=>{
	"use strict";
	
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

})();