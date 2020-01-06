/**
 *	Author: JCloudYu
 *	Create: 2019/07/25
**/
const configurable=true, writable=true, enumerable=false;

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
