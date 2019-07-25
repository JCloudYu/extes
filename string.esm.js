/**
 *	Author: JCloudYu
 *	Create: 2019/07/25
**/
const CAMEL_CASE_PATTERN = /(\w)(\w*)(\W*)/g;
const CAMEL_REPLACER = (match, $1, $2, $3, index, input )=>{
	return `${$1.toUpperCase()}${$2.toLowerCase()}${$3}`;
};

Object.defineProperties(String.prototype, {
	lowerCase:{
		get:function() {
			return this.toLowerCase();
		}, configurable:false, enumerable:false
	},
	localeLowerCase:{
		get:function() {
			return this.toLocaleLowerCase();
		}, configurable:false, enumerable:false
	},
	camelCase: {
		get:function() {
			return this.replace(CAMEL_CASE_PATTERN, CAMEL_REPLACER);
		}, configurable:false, enumerable:false
	}
});



