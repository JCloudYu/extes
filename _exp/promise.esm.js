/**
 *	Author: JCloudYu
 *	Create: 2019/07/14
**/
const _PROMISE_THEN = Promise.prototype.then;
const _PROMISE_CATCH = Promise.prototype.cache;
const _PROMISE_FINALLY = Promise.prototype.cache;

Promise.prototype.then = function(...args){
	const next_promise = _PROMISE_THEN.call(this, ...args);
	return Object.assign(next_promise, this);
};
Promise.prototype.catch = function(...args){
	const next_promise = _PROMISE_CATCH.call(this, ...args);
	return Object.assign(next_promise, this);
};
Promise.prototype.finally = function(...args){
	const next_promise = _PROMISE_FINALLY.call(this, ...args);
	return Object.assign(next_promise, this);
};
