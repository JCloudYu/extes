/**
 *	Author: JCloudYu
 *	Create: 2019/07/23
**/
if ( typeof Element !== "undefined" ) {
	const configurable = true, writable = true, enumerable = false;

	const _ELEMENT_SET_ATTRIBUTE		= Element.prototype.setAttribute;
	const _ELEMENT_REMOVE_ATTRIBUTE		= Element.prototype.removeAttribute;
	const _ELEMENT_SET_ATTRIBUTE_NS		= Element.prototype.setAttributeNS;
	const _ELEMENT_REMOVE_ATTRIBUTE_NS	= Element.prototype.removeAttributeNS;
	
	
	
	Object.defineProperties(Element.prototype, {
		addClass: {
			configurable, enumerable, writable,
			value: function(...classes) {
				this.classList.add(...classes);
				return this;
			}
		},
		removeClass: {
			configurable, enumerable, writable,
			value: function(...classes) {
				this.classList.remove(...classes);
				return this;
			}
		},
		setAttribute: {
			configurable, enumerable, writable,
			value: function(name, value) {
				if ( arguments.length < 2 ) { value = ''; }
				_ELEMENT_SET_ATTRIBUTE.call(this, name, value);
				return this;
			}
		},
		removeAttribute: {
			configurable, enumerable, writable,
			value: function(...args) {
				_ELEMENT_REMOVE_ATTRIBUTE.apply(this, args);
				return this;
			}
		},
		setAttributeNS: {
			configurable, enumerable, writable,
			value: function(...args) {
				_ELEMENT_SET_ATTRIBUTE_NS.apply(this, args);
				return this;
			}
		},
		removeAttributeNS: {
			configurable, enumerable, writable,
			value: function(...args) {
				_ELEMENT_REMOVE_ATTRIBUTE_NS.apply(this, args);
				return this;
			}
		},
	});
}
