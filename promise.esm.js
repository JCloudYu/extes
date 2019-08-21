/**
 *	Author: JCloudYu
 *	Create: 2019/07/12
**/
const IS_NODE = (typeof Buffer !== "undefined");

const _PROMISE_THEN = Promise.prototype.then;
const _PROMISE_CATCH = Promise.prototype.catch;
const _PROMISE_FINALLY = Promise.prototype.finally;

Promise.prototype.then = function(...args) {
	return DecorateChainedPromise(_PROMISE_THEN.call(this, ...args), this);
};
Promise.prototype.catch = function(...args) {
	return DecorateChainedPromise(_PROMISE_CATCH.call(this, ...args), this);
};
Promise.prototype.finally = function(...args) {
	return DecorateChainedPromise(_PROMISE_FINALLY.call(this, ...args), this);
};
Promise.prototype.guard = function() {
	return DecorateChainedPromise(_PROMISE_CATCH.call(this, (e)=>{
		setTimeout(()=>{
			if ( IS_NODE ) {
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
};

Promise.wait = PromiseWaitAll;
Promise.create = FlattenedPromise;






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
