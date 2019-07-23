/**
 *	Author: JCloudYu
 *	Create: 2019/07/23
**/
if ( typeof Element !== "undefined" ) {
	const _ELEMENT_SET_ATTRIBUTE		= Element.prototype.setAttribute;
	const _ELEMENT_REMOVE_ATTRIBUTE		= Element.prototype.removeAttribute;
	const _ELEMENT_SET_ATTRIBUTE_NS		= Element.prototype.setAttributeNS;
	const _ELEMENT_REMOVE_ATTRIBUTE_NS	= Element.prototype.removeAttributeNS;

	Element.prototype.addClass = function(...classes) {
		this.classList.add(...classes);
		return this;
	};
	Element.prototype.removeClass = function(...classes) {
		this.classList.remove(...classes);
		return this;
	};
	Element.prototype.setAttribute = function(name, value) {
		if ( arguments.length < 2 ) { value = ''; }
		_ELEMENT_SET_ATTRIBUTE.call(this, name, value);
		return this;
	};
	Element.prototype.removeAttribute = function(...args) {
		_ELEMENT_REMOVE_ATTRIBUTE.apply(this, args);
		return this;
	};
	Element.prototype.setAttributeNS = function(...args) {
		_ELEMENT_SET_ATTRIBUTE_NS.apply(this, args);
		return this;
	};
	Element.prototype.removeAttributeNS = function(...args) {
		_ELEMENT_REMOVE_ATTRIBUTE_NS.apply(this, args);
		return this;
	};
}
