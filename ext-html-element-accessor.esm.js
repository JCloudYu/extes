/**
 *	Author: JCloudYu
 *	Create: 2020/01/19
**/
import {ExtES} from "./_helper/misc.esm.js";
const configurable = true, writable = true, enumerable = false;

//@export
(()=>{
	"use strict";
	
	if ( typeof HTMLElement !== "undefined" ) {
		const _PRIVATES = new WeakMap();
		class _HTMLElementAccessor {
			constructor(element=null) {
				const _PRIVATE = Object.assign(Object.create(null), {
					element:null, exported:Object.create(null),
					func_bind: _HTMLElementAccessor.prototype.bind.bind(this),
					func_relink: _HTMLElementAccessor.prototype.relink.bind(this),
				});
				_PRIVATES.set(this, _PRIVATE);
				
				
				if ( arguments.length === 0 ) return;
				
				this.bind(element);
			}
			bind(element) {
				if ( !(element instanceof Element) ) {
					throw new TypeError( "HTMLElementAccessor constructor only accept Element instances!" );
				}
				
				const _PRIVATE = _PRIVATES.get(this);
				_PRIVATE.element = element;
				_PRIVATE.exported = Object.create(null);
				
				this.relink();
			}
			relink() {
				const _PRIVATE = _PRIVATES.get(this);
				_PRIVATE.exported = Object.create(null);
				
				const {element, exported} = _PRIVATE;
				__RESOLVE_ACCESSOR(exported, element);
			}
		}
		const HTMLElementAccessorProxy = {
			getPrototypeOf: function(obj) {
				return Object.getPrototypeOf(obj);
			},
			get: function(obj, prop) {
				const {element, exported, func_bind, func_relink} = _PRIVATES.get(obj);
				if ( prop === 'element' ) return element;
				if ( prop === 'is_accessor' ) return true;
				if ( prop === 'bind' ) return func_bind;
				if ( prop === 'relink' ) return func_relink;
				
				return exported[prop] || obj[prop];
			},
			set: function(obj, prop, value) {
				if ( prop === "element" ) return false;
				if ( prop === "bind" ) return false;
				if ( prop === "relink" ) return false;
				
				const {exported} = _PRIVATES.get(obj);
				if ( !exported[prop] ) {
					obj[prop] = value;
				}
				return true;
			}
		};
		const HTMLElementAccessor = new Proxy(_HTMLElementAccessor, {
			construct(target, args) {
				const inst = new target(...args);
				return new Proxy(inst, HTMLElementAccessorProxy);
			},
			apply() {
				throw new TypeError( "Class constructor a cannot be invoked without 'new'" );
			}
		});
		class HTMLElementTemplate {
			constructor(element) {
				if ( typeof element === "string" ) {
					var tmp = document.implementation.createHTMLDocument();
					tmp.body.innerHTML = element;
					if ( tmp.body.children.length !== 1 ) {
						throw new TypeError( "HTMLTemplate constructor only html string that is resolved as single Element instance!" );
					}
					
					element = tmp.body.children[0];
				}
				else
				if ( element instanceof Element ){
					element = element.cloneNode(true);
				}
				else {
					throw new TypeError( "HTMLTemplate constructor only accepts an Element instance!" );
				}
				
				
				
				Object.defineProperties(this, {
					_tmpl_elm: {
						configurable:false, writable:false, enumerable:false,
						value:element
					}
				});
				
				element.removeAttribute('elm-export-tmpl');
				element.removeAttribute('elm-export');
			}
			get is_template() { return true; }
			produce() {
				console.warn("HTMLElementTemplate::produce is deprecated! Please use HTMLElementTemplate::duplicate instead!");
				return this.duplicate();
			}
			duplicate() {
				return new HTMLElementAccessor(this._tmpl_elm.cloneNode(true));
			}
		}
		
		
		
		Object.defineProperties(ExtES, {
			HTMLElementTemplate: {
				configurable, writable, enumerable,
				value:HTMLElementTemplate
			},
			HTMLElementAccessor:{
				configurable, writable, enumerable,
				value:HTMLElementAccessor
			}
		});
		
		
		
		function __RESOLVE_ACCESSOR(exports, element) {
			const candidates = [];
			for (const item of element.children) {
				if ( !item.hasAttribute('elm-export') ) {
					candidates.push(item);
					continue;
				}
				
				const export_name = item.getAttribute('elm-export');
				if ( item.hasAttribute('elm-export-tmpl') ) {
					exports[export_name] = new HTMLElementTemplate(item);
					continue;
				}
				
				if ( item.hasAttribute('elm-export-accessor') ) {
					exports[export_name] = new HTMLElementAccessor(item);
					continue;
				}
				
				candidates.push(item);
				exports[export_name] = item;
			}
			
			for(const elm of candidates) {
				__RESOLVE_ACCESSOR(exports, elm);
			}
		}
	}
})();
//@endexport
