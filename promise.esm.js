/**
 *	Author: JCloudYu
 *	Create: 2019/07/12
**/
import {IsNodeJS} from "./_helper/misc.esm.js";



const _PROMISE_THEN = Promise.prototype.then;
const _PROMISE_CATCH = Promise.prototype.catch;
const _PROMISE_FINALLY = Promise.prototype.finally;

Object.defineProperties(Promise.prototype, {
	then: {
		writable:true, configurable:true, enumerable:false,
		value: function(...args) {
			return DecorateChainedPromise(_PROMISE_THEN.call(this, ...args), this);
		}
	},
	catch: {
		writable:true, configurable:true, enumerable:false,
		value: function(...args) {
			return DecorateChainedPromise(_PROMISE_CATCH.call(this, ...args), this);
		}
	},
	finally: {
		writable:true, configurable:true, enumerable:false,
		value: function(...args) {
			return DecorateChainedPromise(_PROMISE_FINALLY.call(this, ...args), this);
		}
	},
	guard: {
		writable:true, configurable:true, enumerable:false,
		value: function() {
			return DecorateChainedPromise(_PROMISE_CATCH.call(this, (e)=>{
				setTimeout(()=>{
					if ( IsNodeJS ) {
						throw e;
					}
					else {
						const event = new Event('unhandledRejection');
						event.error = e;
						
						window.dispatchEvent(event);
					}
				}, 0);
				
				return e;
			}), this);
		}
	}
});
Object.defineProperties(Promise, {
	wait: {
		writable:true, configurable:true, enumerable:false,
		value: PromiseWaitAll
	},
	create: {
		writable:true, configurable:true, enumerable:false,
		value: FlattenedPromise
	}
});






function PromiseWaitAll(promise_queue=[]) {
	if ( !Array.isArray(promise_queue) ){
		promise_queue = [promise_queue];
	}
	
	if( promise_queue.length === 0 ) {
		return Promise.resolve([]);
	}
	
	return new Promise((resolve, reject) =>{
		let result_queue=[], ready_count=0, resolved = true;
		for(let idx=0; idx<promise_queue.length; idx++) {
			let item = {resolved:true, seq:idx, result:null};
			
			result_queue.push(item);
			Promise.resolve(promise_queue[idx]).then(
				(result)=>{
					resolved = (item.resolved = true) && resolved;
					item.result = result;
				},
				(error)=>{
					resolved = (item.resolved = false) && resolved;
					item.result = error;
				}
			).then(()=>{
				ready_count++;
				
				if ( promise_queue.length === ready_count ) {
					(resolved?resolve:reject)(result_queue);
				}
			});
		}
	});
}
function FlattenedPromise() {
	let _resolve=null, _reject=null;
	const promise = new Promise((resolve, reject)=>{
		_resolve=resolve;
		_reject=reject;
	});
	promise.resolve = _resolve;
	promise.reject = _reject;
	promise.promise = promise;
	return promise;
}
function DecorateChainedPromise(next_promise, previous) {
	for( const prop of Object.keys(previous)) {
		if ( prop === "_prev" ) continue;
		next_promise[prop] = previous[prop];
	}
	
	Object.defineProperty(next_promise, '_prev', {
		value:previous, configurable:true, enumerable:false, writable:true
	});
	return next_promise;
}
