const writable=true, configurable=true, enumerable=false;
class Tools {
	private static UTF8_DECODE_CHUNK_SIZE:number = 100;
	static Padding(val:any, length:number=2, stuffing:string='0') {
		val = `${val}`;
		let remain = length - val.length;
		while( remain-- > 0 ) { val = stuffing + val; }
		return val;
	}
	static ExtractBytes(content:ArrayBuffer|BufferView):Uint8Array|null {
		if (typeof Buffer !== "undefined") {
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

	static UTF8Encode(js_str:string):Uint8Array {
		if ( typeof js_str !== "string" ) {
			throw new TypeError( "Given input argument must be a js string!" );
		}

		const code_points:number[] = [];
		for(let i=0; i<js_str.length;) {
			const point = js_str.codePointAt(i)!;
			
			// 1-byte sequence
			if( (point & 0xffffff80) === 0 ) {
				code_points.push(point);
			}
			// 2-byte sequence
			else if( (point & 0xfffff800) === 0 ) {
				code_points.push(
					0xc0 | (0x1f & (point >> 6)),
					0x80 | (0x3f & point)
				);
			}
			// 3-byte sequence
			else if( (point & 0xffff0000) === 0 ) {
				code_points.push(
					0xe0 | (0x0f & (point >> 12)),
					0x80 | (0x3f & (point >> 6)),
					0x80 | (0x3f & point)
				);
			}
			// 4-byte sequence
			else if( (point & 0xffe00000) === 0 ) {
				code_points.push(
					0xf0 | (0x07 & (point >> 18)),
					0x80 | (0x3f & (point >> 12)),
					0x80 | (0x3f & (point >> 6)),
					0x80 | (0x3f & point)
				);
			}
			
			i += (point>0xFFFF) ? 2 : 1;
		}
		return new Uint8Array(code_points);
	}
	static UTF8Decode(uint8:ArrayBuffer|Uint8Array):string {
		if ( uint8 instanceof ArrayBuffer ) uint8 = new Uint8Array(uint8);
		if ( !(uint8 instanceof Uint8Array) ) {
			throw new TypeError( "Given input must be an Uint8Array contains UTF8 encoded value!" );
		}
		
		const code_points:number[] = [];
		for(let i=0; i<uint8.length; ) {
			let codePoint = uint8[i] & 0xff;
			
			// 1-byte sequence (0 ~ 127)
			if( (codePoint & 0x80) === 0 ){
				code_points.push(codePoint);
				i += 1;
			}
			// 2-byte sequence (192 ~ 223)
			else if( (codePoint & 0xE0) === 0xC0 ) {
				codePoint = ((0x1f & uint8[i]) << 6) | (0x3f & uint8[i + 1]);
				code_points.push(codePoint);
				i += 2;
			}
			// 3-byte sequence (224 ~ 239)
			else if( (codePoint & 0xf0) === 0xe0 ){
				codePoint = ((0x0f & uint8[i]) << 12)
					| ((0x3f & uint8[i + 1]) << 6)
					| (0x3f & uint8[i + 2]);
				code_points.push(codePoint);
				i += 3;
			}
			// 4-byte sequence (249 ~ )
			else if( (codePoint & 0xF8) === 0xF0 ){
				codePoint = ((0x07 & uint8[i]) << 18)
					| ((0x3f & uint8[i + 1]) << 12)
					| ((0x3f & uint8[i + 2]) << 6)
					| (0x3f & uint8[i + 3]);
				code_points.push(codePoint);
				i += 4;
			}
			else {
				i += 1;
			}
		}
		
		
		
		let result_string = "";
		while(code_points.length > 0) {
			const chunk = code_points.splice(0, this.UTF8_DECODE_CHUNK_SIZE);
			result_string += String.fromCodePoint(...chunk);
		}
		return result_string;
	}
}



type BufferView = Uint8ClampedArray|Uint8Array|Int8Array|Uint16Array|Int16Array|Uint32Array|Int32Array|Float32Array|Float64Array|DataView;



declare module "extes" {
	global {
		// ArrayBuffer and Uint8Array extension
		interface ArrayBuffer { bytes:Uint8Array; }
		interface Uint8ArrayConstructor {
			from(data:ArrayBuffer|BufferView|number[]):Uint8Array;
			from(data:string, conversion:'hex'|'bits'|'utf8'|16|2):Uint8Array;
			compare(a:ArrayBuffer|BufferView, b:ArrayBuffer|BufferView):-1|0|1;
			concat(buffers:(ArrayBuffer|BufferView)[]):Uint8Array;
			dump(buffer:ArrayBuffer|BufferView, format?: 2 | 16, padding?: boolean):string;
		}
	}
}
(()=>{
	const HEX_FORMAT = /^(0x)?([0-9a-fA-F]+)$/;
	const BIT_FORMAT = /^(0b|0B)?([01]+)$/;
	const HEX_MAP	 = "0123456789abcdef";
	const HEX_MAP_R:{[key:string]:number} = {
		"0":0, "1":1, "2":2, "3":3,
		"4":4, "5":5, "6":6, "7":7,
		"8":8, "9":9, "a":10, "b":11,
		"c":12, "d":13, "e":14, "f":15
	};
	
	
	
	Object.defineProperty(ArrayBuffer.prototype, 'bytes', {
		configurable, enumerable,
		get:function():Uint8Array { return new Uint8Array(this); }
	});
	Object.defineProperty(Uint8Array, 'from', {
		configurable, writable, enumerable,
		value: function(input:ArrayBuffer|BufferView|string|number[], conversion_info?:'hex'|'bits'|'utf8'|16|2):Uint8Array {
			if ( Array.isArray(input) ) {
				return new Uint8Array(input);
			}

			if ( typeof input === "string" ) {
				if ( conversion_info === "hex" || conversion_info === 16 ) {
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
					
					return buff;
				}
				else
				if ( conversion_info === "bits" || conversion_info === 2 ) {
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
					
					return buff;
				}
				else {
					return Tools.UTF8Encode(input);
				}
			}



			const result = Tools.ExtractBytes(input);
			if ( !result ) {
				throw new TypeError( "Cannot convert given input data into array buffer!" );
			}

			return result;
		}
	});
	Object.defineProperty(Uint8Array, 'compare', {
		configurable, writable, enumerable,
		value: function(a:ArrayBuffer|BufferView, b:ArrayBuffer|BufferView) {
			let A = Tools.ExtractBytes(a), B = Tools.ExtractBytes(b);
			if ( !A || !B ) {
				throw new TypeError("Given arguments must be instances of ArrayBuffer, TypedArray or DataView!");
			}
			
			const len = Math.max(A.length, B.length);
			for(let i=0; i<len; i++) {
				const val_a = A[i] || 0, val_b = B[i] || 0;
				if ( val_a > val_b ) return 1;
				if ( val_a < val_b ) return -1;
			}
			return 0;
		}
	});
	Object.defineProperty(Uint8Array, 'dump', {
		configurable, writable, enumerable,
		value: function(buffer:ArrayBuffer|BufferView, format:2|16=16, padding:boolean=true):string {
			const bytes = Tools.ExtractBytes(buffer);
			if ( bytes === null ) {
				throw new TypeError("Argument 1 expects an instance of ArrayBuffer, TypedArray or DataView!");
			}
			
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
	})
	Object.defineProperty(Uint8Array, 'concat', {
		configurable, writable, enumerable,
		value: function(incoming_buffers:(ArrayBuffer|BufferView)[]) {
		if ( !Array.isArray(incoming_buffers) ) {
			throw new TypeError("Given argument must be an array of ArrayBuffer, TypedArray or DataView instances!")
		}
		
		let pointer = 0, buffers:Uint8Array[] = [];
		for(const buffer of incoming_buffers) {
			const arg = Tools.ExtractBytes(buffer);
			if ( arg === null ) {
				throw new TypeError("Given argument must be an array of ArrayBuffer, TypedArray or DataView instances!");
			}

			pointer += arg.length;
			buffers.push(arg);
		}
		


		const buff = new Uint8Array(pointer);

		pointer = 0;
		for(const arg of buffers) {
			buff.set(arg, pointer);
			pointer += arg.length;
		}
		
		return buff;
	}
});


	
})();



// Array extension
declare module "extes" {
	global {
		interface Array<T> {
			unique():Array<T>;
			exclude(reject_list:T[]):Array<T>;
		}
	}
}
(()=>{
	Object.defineProperty(Array.prototype, 'unique', {
		writable, configurable, enumerable,
		value: function() {
			const set = new Set();
			for ( const item of this ) set.add(item);
			return Array.from(set);
		}
	});
	Object.defineProperty(Array.prototype, 'exclude', {
		writable, configurable, enumerable,
		value: function(reject_list:any[]) {
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



// Date extension
declare module "extes" {
	global {
		interface DateConstructor {
			present:Date;

			from(value:number|string):Date;
			from(year:number, month:number, date?:number, hours?:number, minutes?:number, seconds?:number, ms?:number):Date;
			unix():number;
			zoneShift():number;
		}

		interface Date {
			unix:number;
			time:number;
			zoneShift:number;
			getUnixTime():number;
			toLocaleISOString(milli?:boolean):string;
		}
	}
}
(()=>{
	Object.defineProperty(Date, 'from', {
		writable, configurable, enumerable,
		value: function(value:number|string, month?:number, date?:number, hours?:number, minutes?:number, seconds?:number, ms?:number) {
			if ( arguments.length === 0 ) {
				throw new Error("Date.from expects at least one arguments!");
			}
			
			try {
				if ( typeof value === "string" || arguments.length === 1 ) {
					return new Date(value);
				}
				else 
				if ( arguments.length === 2 ) {
					return new Date(value, month!);
				}
				else 
				if ( arguments.length === 3 ) {
					return new Date(value, month!, date!);
				}
				else 
				if ( arguments.length === 4 ) {
					return new Date(value, month!, date!, hours!);
				}
				else 
				if ( arguments.length === 5 ) {
					return new Date(value, month!, date!, hours!, minutes!);
				}
				else 
				if ( arguments.length === 6 ) {
					return new Date(value, month!, date!, hours!, minutes!, seconds!);
				}
				else {
					return new Date(value, month!, date!, hours!, minutes!, seconds!, ms!);
				}
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
	Object.defineProperty(Date, 'zoneShift', {
		writable, configurable, enumerable,
		value: function() {
			const date = new Date();
			return date.getTimezoneOffset() * 60000;
		}
	});
	
	Object.defineProperty(Date.prototype, 'getUnixTime', {
		writable, configurable, enumerable,
		value: function() {
			return Math.floor(this.getTime()/1000);
		}
	});
	Object.defineProperty(Date.prototype, 'toLocaleISOString', {
		writable, configurable, enumerable,
		value: function(show_milli:boolean=false){
			let offset, zone = this.getTimezoneOffset();
			if ( zone === 0 ) {
				offset = 'Z';
			}
			else {
				const sign = zone > 0 ? '-' : '+';
				zone = Math.abs(zone);
				const zone_hour = Math.floor(zone/60);
				const zone_min  = zone%60;
				
				offset = sign + Tools.Padding(zone_hour) + Tools.Padding(zone_min);
			}
			
			
			const milli = show_milli ? ('.' + Tools.Padding(this.getMilliseconds() % 1000, 3)) : '';
			return  this.getFullYear() +
				'-' + Tools.Padding(this.getMonth()+1) +
				'-' + Tools.Padding(this.getDate()) +
				'T' + Tools.Padding(this.getHours()) +
				':' + Tools.Padding(this.getMinutes()) +
				':' + Tools.Padding(this.getSeconds()) +
				milli + offset;
		}
	});
	
	// getter
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
	Object.defineProperty(Date.prototype, 'zoneShift', {
		configurable, enumerable,
		get: function() {
			return this.getTimezoneOffset() * 60000;
		}
	});
})();



// Document extension
declare module "extes" {
	global {
		interface Document {
			parseHTML(html:string):DocumentFragment;
		}
	}
}
(()=>{
	if ( typeof Document !== "undefined" ) {
		Object.defineProperties(Document.prototype, {
			parseHTML: {
				configurable, writable, enumerable,
				value: function(html:string) {
					const shadow = this.implementation.createHTMLDocument();
					const shadowed_body = shadow.body;
					shadowed_body.innerHTML = html;


					const fragment = new DocumentFragment();
					if ( shadowed_body.children.length === 0 ) return fragment;

					
					if ( shadowed_body.children.length === 1 ) {
						const item = shadowed_body.children[0];
						item.remove();
						return item;
					}
					
					for(const element of Array.prototype.slice.call(shadowed_body.children, 0)) {
						fragment.appendChild(element);
					}
					return fragment;
				}
			}
		});
	}
})();



// Error extension
declare module "extes" {
	global {
		interface Error {
			stack_trace:string[];
		}
	}
}
(()=>{
	if ( typeof Error !== "undefined" ) {
		Object.defineProperty(Error.prototype, 'stack_trace', {
			get: function(){
				if ( !this.stack ) return [];
				return this.stack.split(/\r\n|\n/g).map((item:string)=>item.trim());
			},
			enumerable, configurable
		});
	}
})();



// EventTarget extension
declare module "extes" {
	global {
		interface EventTarget {
			on(event_name:string, callback:(...args:any[])=>void|Promise<void>):this;
			off(event_name:string, callback:(...args:any[])=>void|Promise<void>):this;
			emit(event:string|Event, inits?:{bubbles?:boolean, cancelable?:boolean, composed?:boolean, [key:string]:any}):boolean;
		}
	}
}
(()=>{
	if ( typeof EventTarget !== "undefined" ) {
		Object.defineProperty(EventTarget.prototype, 'on', {
			configurable, writable, enumerable,
			value: function(event_name:string, callback:(...args:any[])=>void|Promise<void>):EventTarget {
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
			value: function(event_name:string, callback:(...args:any[])=>void|Promise<void>):EventTarget {
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
			value: function(event:string|Event, inits:{bubbles?:boolean, cancelable?:boolean, composed?:boolean, [key:string]:any}={}):boolean {
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
				return this.dispatchEvent(event);
			}
		});
	}
})();



// Function extension
declare module "extes" {
	global {
		interface FunctionConstructor {
			sequential<ReturnType=any, ArgTypes extends any[] = any[]>(func_list:((...args:any[])=>any)[], is_async?:boolean, spread_args?:boolean):(...args:ArgTypes)=>ReturnType;
		}
	}
}
(()=>{
	Object.defineProperty(Function, 'sequential', {
		configurable, writable, enumerable,
		value: function PackSequentialCall(func_list:((...args:any[])=>any|any)[], is_async:boolean=false, spread_args:boolean=false) {
			if ( !Array.isArray(func_list) ) { 
				throw new TypeError("The first argument must be an array of functions!");
			}
			
			
			is_async = !!is_async;
			return function(...incoming_args:any[]):any {
				let prev_result:any = undefined;
				let session_this = {};
				if ( !is_async ) {
					for( const func of func_list ) {
						if ( typeof func !== "function" ) {
							prev_result = func;
							continue;
						}
	
						const args = spread_args ? [...incoming_args, prev_result] : [prev_result];
						prev_result = func.call(session_this, ...args);
					}
					return prev_result;
				}
				else {
					return Promise.resolve().then(async()=>{
						for( const func of func_list ) {
							if ( typeof func !== "function" ) {
								prev_result = func;
								continue;
							}
	
							const args = spread_args ? [...incoming_args, prev_result] : [prev_result];
							prev_result = await func.call(session_this, ...args);
						}
						return prev_result;
					});
				}
			}
		}
	});
})();




// Object extension
declare module "extes" {
	global {
		interface ObjectConstructor {
			merge(target:{[key:string]:any}, ...sources:{[key:string]:any}[]):{[key:string]:any};
			typeOf(data:any):string;
		}
	}
}
(()=>{
	Object.defineProperty(Object, 'merge', {
		writable, configurable, enumerable,
		value: function(target:{[key:string]:any}, ...sources:{[key:string]:any}[]):{[key:string]:any} {
			if ( Object(target) !== target ) {
				throw new TypeError("Argument 1 must be an object!");
			}
			
			for(const source of sources) {
				if ( Object(source) !== source ) continue;
				DeepMerge(target, source);
			}
			
			return target;
		}
	});
	Object.defineProperty(Object, 'typeOf', {
		writable, configurable, enumerable,
		value: TypeOf
	});
	
	
	
	

	
	function DeepMerge(target:{[key:string]:any}, source:{[key:string]:any}) {
		for (const key in source) {
			let is_invalid = false;
			is_invalid = (source.hasOwnProperty && !source.hasOwnProperty(key));
			is_invalid = is_invalid || (source[key] === undefined);
			if ( is_invalid ) continue;
		
			
			
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
			
			DeepMerge(tValue, sValue);
		}
	}
	function TypeOf(input:any, resolveObj=false):string {
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



// Promise extension
declare module "extes" {
	global {
		interface PromiseConstructor{
			create<Type=any>():Promise<Type>&{resolve:(result:any)=>void, reject:(error:any)=>void, promise:Promise<Type>};
			wait<ReturnTypes extends any[] = any[]>():ReturnTypes;
			chain<Type=any>(func:(...args:any[])=>any):Promise<Type>;
		}
	}
}
(()=>{
	Object.defineProperties(Promise, {
		wait: {
			writable, configurable, enumerable,
			value: PromiseWaitAll
		},
		create: {
			writable, configurable, enumerable,
			value: FlattenedPromise
		},
		chain: {
			writable, configurable, enumerable,
			value: (func:(...args:any[])=>any)=>{
				const base_promise = Promise.resolve();
				return ( typeof func !== "function" ) ? base_promise : base_promise.then(func);
			}
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
			let result_queue:any[]=[], ready_count=0, resolved = true;
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

		//@ts-ignore
		promise.resolve = _resolve;
		//@ts-ignore
		promise.reject = _reject;
		//@ts-ignore
		promise.promise = promise;
		return promise;
	}
})();



// String extension
declare module "extes" {
	global {
		interface StringConstructor {
			encodeRegExpString(input_str:string):string;
			from(content:Uint8Array|ArrayBuffer|string):string;
		}
		interface String {
			charCount:number;
			upperCase:string;
			localeUpperCase:string;
			lowerCase:string;
			localeLowerCase:string;
			camelCase:string;

			toCamelCase():string;
			pull(token_separator?:string, from_begin?:boolean):[string|undefined, string|undefined];
			cutin(start:number, deleteCount:number, ...items:any[]):string;
		}
	}
}
(()=>{
	const CAMEL_CASE_PATTERN = /(\w)(\w*)(\W*)/g;
	const CAMEL_REPLACER = (match:string, $1:string, $2:string, $3:string )=>{
		return `${$1.toUpperCase()}${$2.toLowerCase()}${$3}`;
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
		cutin: {
			configurable, enumerable, writable,
			value:function(start:number, deleteCount:number, ...items:any[]) {
				if ( start < 0 ) start = start + this.length;
				if ( deleteCount <= 0 ) deleteCount = 0;
				
				const head = this.substring(0, start);
				const tail = this.substring(start + deleteCount);
				return head + items.join('') + tail;
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
		from: {
			writable, configurable, enumerable,
			value:(content:Uint8Array|ArrayBuffer|string):string=>{
				if ( typeof content === "string" ) return content;
				
				const bytes = Tools.ExtractBytes(content);
				if ( bytes !== null ) {
					return Tools.UTF8Decode(bytes);
				}
				
				return ''+content;
			}
		}
	});
})();



// Timer extension
declare module "extes" {
	global {
		namespace setTimeout {
			function idle(milli:number):Promise<void>;
			function create():(...args:any[])=>void & {clear:()=>void};
		}
		namespace setInterval {
			function create():(...args:any[])=>void & {clear:()=>void};
		}
	}
}
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
		let _scheduled:any		= null;
		let _executing:boolean	= false;
		let _hTimeout:any		= null;
		const timeout_cb = (cb:(...args:any[])=>void, delay:number=0, ...args:any[])=>{
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
		const timeout_cb = (cb:(...args:any[])=>void, interval:number=0, ...args:any[])=>{
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