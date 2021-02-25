/**
 *	Author: JCloudYu
 *	Create: 2019/11/29
**/
const enumerable = false, configurable = true, writable = true;

//@export
(()=>{
	if ( typeof Error !== "undefined" ) {
		Object.defineProperty(Error.prototype, 'stack_trace', {
			get: function(){
				if ( !this.stack ) return null;
				return this.stack.split(/\r\n|\n/g).map((item)=>item.trim());
			},
			enumerable, configurable
		});
		
		Object.defineProperty(Error, 'trap', {
			writable, configurable, enumerable,
			value: function(func, default_result=undefined) {
				const args = Array.prototype.slice.call(arguments, 0);
				let result;
				try { result = func();}
				catch(e) { return args.length < 2 ? e : default_result; }
				
				
				
				if ( result instanceof Promise ) {
					return result.catch((e)=>{
						return args.length < 2 ? e : default_result;
					});
				}
				
				return result;
			}
		});
		
		Object.defineProperty(Error, 'trapper', {
			writable, configurable, enumerable,
			value: function(func, callback) {
				return function(...args) {
					let result;
					try { result = func(...args); } catch(e) { callback(e); return; }
					
					
					
					if ( result instanceof Promise ) {
						return result.catch(e=>callback(e));
					}
					
					return result;
				};
			}
		});
	}
})();
//@endexport
