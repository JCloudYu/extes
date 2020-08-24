/**
 *	Author: JCloudYu
 *	Create: 2020/01/01
**/
const writable=true, configurable=true, enumerable=false;

//@export
(()=>{
	Object.defineProperty(Function, 'sequential', {
		configurable, writable, enumerable,
		value: PackSequentialCall
	});
	Object.defineProperty(PackSequentialCall, 'async', {
		configurable:false, writable:false, enumerable:true,
		value: PackSequentialCallAsync
	});
	
	function PackSequentialCall(func_list) {
		if ( !Array.isArray(func_list) ) {
			func_list = [func_list];
		}
	
	
		for(let i=0; i<func_list.length; i++) {
			const func = func_list[i];
			if ( typeof func !== "function" ) {
				func_list[i] = ()=>func;
			}
		}
		
		
		
		const shared = {};
		return function(...init_args) {
			let result = undefined;
			shared.session = {};
			
			for ( const func of func_list ) {
				result = func.call(shared, ...[...init_args, result]);
				if ( result === false ) break;
			}
			return result;
		}
	}
	function PackSequentialCallAsync(func_list) {
		if ( !Array.isArray(func_list) ) {
			func_list = [func_list];
		}
	
	
		for(let i=0; i<func_list.length; i++) {
			const func = func_list[i];
			if ( typeof func !== "function" ) {
				func_list[i] = ()=>func;
			}
		}
		
		
		
		const shared = {};
		return function(...init_args) {
			return Promise.resolve().then(async()=>{
				let result = undefined;
				shared.session = {};
				for ( const func of func_list ) {
					result = await func.call(shared, ...[...init_args, result]);
					if ( result === false ) break;
				}
				return result;
			});
		}
	}
})();
//@endexport
