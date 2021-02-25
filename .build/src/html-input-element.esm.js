/**
 *	Author: JCloudYu
 *	Create: 2019/08/28
**/
const configurable = true, writable = true, enumerable = false;

//@export
(()=>{
	if ( typeof HTMLInputElement !== "undefined" ) {
		Object.defineProperty( HTMLInputElement.prototype, 'setValue', {
			configurable, writable, enumerable,
			value: function(value) {
				this.value = value;
				return this;
			}
		});
	}
})();
//@endexport
