/**
 *	Author: JCloudYu
 *	Create: 2019/07/25
**/
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
		get:function() {
			return this.toUpperCase();
		}, configurable:true, enumerable:false
	},
	localeUpperCase:{
		get:function() {
			return this.toLocaleUpperCase();
		}, configurable:true, enumerable:false
	},
	lowerCase:{
		get:function() {
			return this.toLowerCase();
		}, configurable:true, enumerable:false
	},
	localeLowerCase:{
		get:function() {
			return this.toLocaleLowerCase();
		}, configurable:true, enumerable:false
	},
	toCamelCase: {
		value:function() {
			return this.replace(CAMEL_CASE_PATTERN, CAMEL_REPLACER);
		}, configurable:true, enumerable:false
	},
	camelCase: {
		get:function() {
			return this.replace(CAMEL_CASE_PATTERN, CAMEL_REPLACER);
		}, configurable:true, enumerable:false
	}
});
Object.defineProperties(String, {
	encodeRegExpString: {
		writable:true, configurable:true, enumerable:false,
		value: function(input_string='') {
  			return input_string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
		}
	},
	stringTemplate: {
		writable:true, configurable:true, enumerable:false,
		value:StringTemplateResolver
	}
});
