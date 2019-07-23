/**
 *	Author: JCloudYu
 *	Create: 2019/07/23
**/
if ( typeof Element !== "undefined" ) {
	Element.prototype.addClass = function(...classes) {
		this.classList.add(...classes);
		return this;
	};
	Element.prototype.removeClass = function(...classes) {
		this.classList.remove(...classes);
		return this;
	};
}
