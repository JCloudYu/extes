/**
 *	Author: JCloudYu
 *	Create: 2020/01/27
**/
import {ExtES} from "./_helper/misc.esm.js";

if ( typeof Error !== "undefined" ) {
	const configurable = true, writable = true, enumerable = false;
	
	
	
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
			
			if ( this.detail !== null || this.detail !== undefined ) {
				result.detail = Object.assign({}, this.detail);
			}
			
			return result;
		}
	}
	

	
	Object.defineProperties(ExtES, {
		ExtError: {
			configurable, writable, enumerable,
			value:EError
		},
		IndexedError: {
			configurable, writable, enumerable,
			value:IndexedError
		}
	});
}
