/**
 *	Author: JCloudYu
 *	Create: 2019/11/14
**/
const configurable = true, writable = true, enumerable = false;

//@export
(()=>{
	if ( typeof EventTarget !== "undefined" ) {
		Object.defineProperty(EventTarget.prototype, 'on', {
			configurable, writable, enumerable,
			value: function(event_name, callback) {
				// Event name accepts name1#tag1,name2#tag1,name3#tag2
				const inserted = [];
				const events = event_name.split(',');
				for( let evt_name of events ) {
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
				const events = event_name.split(',');
				for( let evt_name of events ) {
					evt_name = evt_name.trim();
					this.removeEventListener(evt_name, callback);
				}
				return this;
			}
		});
		Object.defineProperty(EventTarget.prototype, 'emit', {
			configurable, writable, enumerable,
			value: function(event, inits={}) {
				const {bubbles, cancelable, composed, ...event_args} = inits;
				
				if ( typeof event === "string" ) {
					event = new Event(event, {
						bubbles:!!bubbles,
						cancelable:!!cancelable,
						composed:!!composed
					});
				}
				
				if ( !(event instanceof Event) ) {
					throw new TypeError("Argument 1 accepts only string or Event instance!");
				}
				
				
				
				Object.assign(event, event_args);
				this.dispatchEvent(event);
			}
		});
	}
})();
//@endexport
