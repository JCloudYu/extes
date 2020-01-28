/**
 *	Author: JCloudYu
 *	Create: 2020/01/01
**/
const writable=true, configurable=true, enumerable=false;
Object.defineProperty(Function, 'sequentialExecutor', {
	configurable, writable, enumerable,
	value: EncapsulateSequentialExecutor.bind(null, false)
});
Object.defineProperty(Function.sequentialExecutor, 'async', {
	configurable, writable, enumerable,
	value: EncapsulateSequentialExecutor.bind(null, true)
});



function EncapsulateSequentialExecutor(force_async, func_list, ...bound_args) {
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
					args.splice(0, args.length);
					args.push(...bound_args);
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
			args.splice(0, args.length);
			args.push(...bound_args);
			if ( result !== undefined ) {
				args.push(result);
			}
		}
		return result;
	};
}
