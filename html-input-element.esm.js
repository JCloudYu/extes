/**
 *	Author: JCloudYu
 *	Create: 2019/08/28
**/
if ( typeof HTMLInputElement !== "undefined" ) {
	const configurable = true, writable = true, enumerable = false;
	
	Object.defineProperty( HTMLInputElement.prototype, 'setValue', {
		configurable, writable, enumerable,
		value: function(value) {
			this.value = value;
			return this;
		}
	});
}
