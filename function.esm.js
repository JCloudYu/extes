/**
 *	Author: JCloudYu
 *	Create: 2020/01/01
**/
const writable=true, configurable=true, enumerable=false;
Object.defineProperty(Function, 'sequentialExecutor', {
	configurable, writable, enumerable,
	value: EncapsulateSequentialExecutor
});



function EncapsulateSequentialExecutor(..._functions) {
	if ( Array.isArray(_functions[0]) ) {
		_functions = _functions[0];
	}

	const functions = [];
	for ( const func of _functions ) {
		if ( typeof func === "function" ) {
			functions.push(func);
		}
	}
	
	
	const AsyncSequentialExecutor = async function(...init_args) {
		let should_stop = false;
		const args = init_args.slice(0);
		const inst = {};
		Object.defineProperties(inst, {
			stop: {value:()=>{should_stop=true}, configurable:false, writable:false, enumerable:true}
		});
		
		let result = undefined;
		for ( const func of functions ) {
			result = await func.call(inst, ...args);
			if ( should_stop ) break;
			args.splice(0, args.length, result);
		}
		
		return result;
	};
	const SequentialExecutor = function(...init_args) {
		let should_stop = false;
		const args = init_args.slice(0);
		const inst = {};
		Object.defineProperties(inst, {
			stop: {value:()=>{should_stop=true}, configurable:false, writable:false, enumerable:true}
		});
		
		let result = undefined;
		for ( const func of functions ) {
			result = func.call(inst, ...args);
			if ( should_stop ) break;
			args.splice(0, args.length, result);
		}
		
		return result;
	};
	Object.defineProperties(SequentialExecutor, {
		async: { value:AsyncSequentialExecutor, configurable:false, writable:false, enumerable:true }
	});
	
	return SequentialExecutor;
}

