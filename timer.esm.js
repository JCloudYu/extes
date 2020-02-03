/**
 *	Author: JCloudYu
 *	Create: 2019/07/12
**/
const configurable=true, writable=true, enumerable=false;

//@export
(()=>{
	"use strict";
	
	Object.defineProperty(setTimeout, 'create', {
		writable, configurable, enumerable,
		value:ThrottledTimeout
	});
	Object.defineProperty(setTimeout, 'idle', {
		writable, configurable, enumerable,
		value:Idle
	});
	Object.defineProperty(setInterval, 'create', {
		writable, configurable, enumerable,
		value:ThrottledTimer
	});
	
	
	
	function ThrottledTimeout() {
		let _scheduled	= null;
		let _executing	= false;
		let _hTimeout	= null;
		const timeout_cb = (cb, delay=0, ...args)=>{
			_scheduled = {cb, delay, args};
			
			if ( _executing ) return;
			
			
			if ( _hTimeout ) {
				clearTimeout(_hTimeout);
				_hTimeout = null;
			}
			__DO_TIMEOUT();
		};
		timeout_cb.clear=()=>{
			_scheduled = null;
			if ( _hTimeout ) {
				clearTimeout(_hTimeout);
				_hTimeout = null;
			}
		};
		return timeout_cb;
		
		
		
		function __DO_TIMEOUT() {
			if ( !_scheduled ) return;
		
			let {cb, delay, args} = _scheduled;
			_hTimeout = setTimeout(()=>{
				_executing = true;
				
				Promise.resolve(cb(...args))
				.then(
					()=>{
						_executing = false;
						_hTimeout = null;
						
						__DO_TIMEOUT();
					},
					(e)=>{
						_executing	= false;
						_hTimeout	= null;
						_scheduled	= null;
						
						throw e;
					}
				);
			}, delay);
			_scheduled = null;
		}
	}
	function Idle(duration=0) {
		return new Promise((resolve)=>{setTimeout(resolve, duration)});
	}
	function ThrottledTimer() {
		const _timeout = ThrottledTimeout();
		const timeout_cb = (cb, interval=0, ...args)=>{
			const ___DO_TIMEOUT=async()=>{
					_timeout(___DO_TIMEOUT, interval);
					
					try {
						await cb(...args);
					}
					catch(e) {
						_timeout.clear();
						throw e;
					}
				};
			_timeout(___DO_TIMEOUT, interval, ...args);
		};
		timeout_cb.clear=()=>{
			_timeout.clear();
		};
		return timeout_cb;
	}
})();
//@endexport
