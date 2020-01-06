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



function EncapsulateSequentialExecutor(force_async, ..._functions) {
	if ( Array.isArray(_functions[0]) ) {
		_functions = _functions[0];
	}

	const functions = [];
	let async_mode = force_async;
	for ( const func of _functions ) {
		if ( typeof func !== "function" ) continue;
	
		async_mode = async_mode || func.constructor.name === "AsyncFunction";
		functions.push(func);
	}
	
	
	
	const singleton = {};
	return function(...init_args) {
		let should_stop = false;
		const args = init_args.slice(0);
		const inst = {};
		Object.defineProperties(inst, {
			singleton:{value:singleton, configurable:false, writable:false, enumerable:true},
			stop: {value:()=>{should_stop=true}, configurable:false, writable:false, enumerable:true}
		});
		
		
		
		if ( async_mode ) {
			return Promise.resolve()
			.then(async()=>{
				let result = undefined;
				for ( const func of functions ) {
					result = await func.call(inst, ...args);
					if ( should_stop ) break;
					args.splice(0, args.length, result);
				}
			});
		}
		
		
		
		let result = undefined;
		for ( const func of functions ) {
			result = func.call(inst, ...args);
			if ( should_stop ) break;
			args.splice(0, args.length, result);
		}
		
		return result;
	};
}
