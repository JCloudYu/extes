/**
 *	Author: JCloudYu
 *	Create: 2019/08/28
**/
if ( typeof HTMLInputElement !== "undefined" ) {
	HTMLInputElement.prototype.setValue = function(value) {
		this.value = value;
		return this;
	};
}
