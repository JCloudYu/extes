/**
 *	Author: JCloudYu
 *	Create: 2019/07/25
**/
const _PRIVATES = new WeakMap();
const CAMEL_CASE_PATTERN = /(\w)(\w*)(\W*)/g;
const CAMEL_REPLACER = (match, $1, $2, $3, index, input )=>{
	return `${$1.toUpperCase()}${$2.toLowerCase()}${$3}`;
};



function TemplateStorage(strings, ...dynamics) {
	if ( this instanceof TemplateStorage ) return;

	const tmpl_inst = new TemplateStorage();
	_PRIVATES.set(tmpl_inst, {
		strings, dynamics
	});
	return tmpl_inst;
}
TemplateStorage.prototype = {
	[Symbol.iterator]() {
		const iterator = Object.create(null);
		const {strings, dynamics} = _PRIVATES.get(this);
		
		let i=-1;
		iterator.next=()=>{
			const max = (strings.length-1) * 2;
			if ( i >= max ) return {done:true};
			return (++i%2===0) ? {value:strings[i/2]} : {value:dynamics[(i-1)/2]};
		};
		
		return iterator;
	},
	imprint(cb) {
		if ( typeof cb !== "function" ) {
			return undefined;
		}
		
		const {strings, dynamics} = _PRIVATES.get(this);
		return cb(strings.slice(0), ...dynamics);
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
		value:TemplateStorage
	}
});
