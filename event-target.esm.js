/**
 *	Author: JCloudYu
 *	Create: 2019/11/14
**/
const configurable = true, writable = true, enumerable = false;

//@export
(()=>{
	"use strict";
	
	if ( typeof EventTarget !== "undefined" ) {
		Object.defineProperty(EventTarget.prototype, 'on', {
			configurable, writable, enumerable,
			value: function(event_name, callback) {
				// Event name accepts name1#tag1,name2#tag1,name3#tag2
				const inserted = [];
				const events = event_name.split(',');
				for( let evt_name of events ) {
					[evt_name] = evt_name.split('#');
					evt_name = evt_name.trim();
					if ( inserted.indexOf(evt_name) >= 0 ) continue;
					
					inserted.push(evt_name);
					this.addEventListener(evt_name, callback);
				}
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
				
				if ( !(event instanceof Event) ) {
					throw new TypeError("Argument 1 accepts only string or Event instance!");
				}
				
				this.dispatchEvent(event);
			}
		});
	}
})();
//@endexport
