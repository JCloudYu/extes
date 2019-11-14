/**
 *	Author: JCloudYu
 *	Create: 2019/11/14
**/
if ( typeof EventTarget !== "undefined" ) {
	const configurable = true, writable = true, enumerable = false;

	Object.defineProperty(EventTarget.prototype, 'on', {
		configurable, writable, enumerable,
		value: function(event_name, callback) {
			this.addEventListener(event_name, callback);
			return this;
		}
	});
	Object.defineProperty(EventTarget.prototype, 'off', {
		configurable, writable, enumerable,
		value: function(event_name, callback) {
			this.removeEventListener(event_name, callback);
			return this;
		}
	});
	Object.defineProperty(EventTarget.prototype, 'emit', {
		configurable, writable, enumerable,
		value: function(event) {
			if ( typeof event === "string" ) {
				event = new Event(event);
			}
			
			if ( event instanceof Event ) {
				throw new TypeError("Argument 1 accepts only string or Event instance!");
			}
			
			this.dispatchEvent(event);
		}
	});
}
