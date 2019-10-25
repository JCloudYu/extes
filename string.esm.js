/**
 *	Author: JCloudYu
 *	Create: 2019/07/25
**/
const CAMEL_CASE_PATTERN = /(\w)(\w*)(\W*)/g;
const CAMEL_REPLACER = (match, $1, $2, $3, index, input )=>{
	return `${$1.toUpperCase()}${$2.toLowerCase()}${$3}`;
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



