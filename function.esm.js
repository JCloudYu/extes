/**
 *	Author: JCloudYu
 *	Create: 2020/01/01
**/
const writable=true, configurable=true, enumerable=false;

//@export
(()=>{
	"use strict";
	
	const SequentialExecutor			= EncapsulateSequentialExecutor.bind(null, false, false);
	const SequentialExecutorSpread		= EncapsulateSequentialExecutor.bind(null, false, true);
	
	const SequentialExecutorAsync		= EncapsulateSequentialExecutor.bind(null, true, false);
	const SequentialExecutorAsyncSpread = EncapsulateSequentialExecutor.bind(null, true, true);

	Object.defineProperty(Function, 'sequentialExecutor', {
		configurable, writable, enumerable,
		value: SequentialExecutor
	});
	Object.defineProperty(SequentialExecutor, 'spread', {
		configurable:false, writable:false, enumerable:true,
		value: SequentialExecutorSpread
	});
	Object.defineProperty(SequentialExecutor, 'async', {
		configurable:false, writable:false, enumerable:true,
		value: SequentialExecutorAsync
	});
	Object.defineProperty(SequentialExecutor.async, 'spread', {
		configurable:false, writable:false, enumerable:true,
		value: SequentialExecutorAsyncSpread
	});
	
	
	
	function EncapsulateSequentialExecutor(force_async, spread_init_args, func_list, ...bound_args) {
		if ( !Array.isArray(func_list) ) {
			bound_args.unshift(func_list);
			func_list = bound_args;
			bound_args = [];
		}
	
		const functions = [];
		let async_mode = force_async;
		for ( const func of func_list ) {
			if ( typeof func !== "function" ) {
				functions.push(()=>func);
				continue;
			}
		
			async_mode = async_mode || func.constructor.name === "AsyncFunction";
			functions.push(func);
		}
		
		
		
		const singleton = {};
		return function(...init_args) {
			let should_stop = false;
			const args = [...bound_args, ...init_args];
			const inst = {};
			Object.defineProperties(inst, {
				singleton:{value:singleton, configurable:false, writable:false, enumerable:false},
				stop: {value:()=>{should_stop=true}, configurable:false, writable:false, enumerable:false}
			});
			
			
			
			if ( async_mode ) {
				return Promise.resolve()
				.then(async()=>{
					let result = undefined;
					for ( const func of functions ) {
						result = await func.call(inst, ...args);
						if ( should_stop ) break;
						
						
						// Fill in prefixed arguments
						args.splice(0, args.length);
						args.push(...bound_args);
						if (spread_init_args) {
							args.push(...init_args);
						}
						
						
						if ( result !== undefined ) {
							args.push(result);
						}
					}
					return result;
				});
			}
			
			
			
			let result = undefined;
			for ( const func of functions ) {
				result = func.call(inst, ...args);
				if ( should_stop ) break;
				
				
				// Fill in prefixed arguments
				args.splice(0, args.length);
				args.push(...bound_args);
				if (spread_init_args) {
					args.push(...init_args);
				}
				
				
				if ( result !== undefined ) {
					args.push(result);
				}
			}
			return result;
		}
	}
})();
//@endexport
