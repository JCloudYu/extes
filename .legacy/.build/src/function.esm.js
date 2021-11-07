/**
 *	Author: JCloudYu
 *	Create: 2020/01/01
**/
const writable=true, configurable=true, enumerable=false;

//@export
(()=>{
	const REF = new WeakMap();
	const boot_async={}, boot_sync={};
	REF.set(boot_async, {async:true,  funcs:[]});
	REF.set(boot_sync,  {async:false, funcs:[]});
	
	
	
	Object.defineProperty(Function, 'sequential', {
		configurable, writable, enumerable,
		value: PackSequentialCall.bind(null, false)
	});
	Object.defineProperty(Function.sequential, 'async', {
		configurable: false, writable: false, enumerable: true,
		value: PackSequentialCall.bind(null, true)
	});
	
	
	
	function PackSequentialCall(is_async, func_list) {
		const args = Array.prototype.slice.call(arguments, 0);
		args[0] = is_async?boot_async:boot_sync;
		return PackSequential.call(...args);
	}
	function PackSequential(func_list) {
		const prev_state = REF.get(this);
		const state = {async:prev_state.async, funcs:prev_state.funcs.slice(0)};
		
		if ( arguments.length > 0 ) {
			let func;
			if ( !Array.isArray(func_list) ) { func_list = [func_list]; }
			for( let i = 0; i < func_list.length; i++ ){
				state.funcs.push((typeof (func=func_list[i]) === "function") ? func : ()=>func);
			}
		}
		
		const storage = {};
		REF.set(storage, state);
		const trigger = DoSequentialCall.bind(storage);
		trigger.chain = PackSequential.bind(storage);
		Object.defineProperty(trigger, 'data', {configurable, enumerable:true, writable, value:storage});
		
		return trigger;
	}
	function DoSequentialCall(...spread_args) {
		const {async:is_async, funcs:chain_items} = REF.get(this);
		this.current_call = {};
		
		
		
		let result = undefined;
		if ( !is_async ) {
			for( const func of chain_items ){
				result = func.call(this, ...spread_args, result);
				if( result === false ) break;
			}
			return result;
		}
		else {
			return Promise.resolve().then(async()=>{
				for( const func of chain_items ){
					result = await func.call(this, ...spread_args, result);
					if( result === false ) break;
				}
				return result;
			});
		}
	}
})();
//@endexport
