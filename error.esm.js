/**
 *	Author: JCloudYu
 *	Create: 2019/11/29
**/
const enumerable = false, configurable = true, writable = true;

//@export
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
//@endexport
