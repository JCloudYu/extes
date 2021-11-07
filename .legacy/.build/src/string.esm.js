/**
 *	Author: JCloudYu
 *	Create: 2019/07/25
**/
import {UTF8Decode} from "_helper/utf8.esm.js";
import {ExtractBytes} from "_helper/misc.esm.js";
const configurable=true, writable=true, enumerable=false;

//@export
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
		},
		cutin: {
			configurable, enumerable, writable,
			value:function(start, deleteCount, ...items) {
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
//@endexport
