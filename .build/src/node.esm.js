/**
 *	Author: JCloudYu
 *	Create: 2019/07/23
**/
const configurable = true, writable = true, enumerable = false;

//@export
(()=>{
	if ( typeof Node !== "undefined" ) {
		Object.defineProperty( Node.prototype, 'prependChild', {
			configurable, writable, enumerable,
			value: function(child) {
				this.insertBefore(child, this.children[0]||null);
				return ( this instanceof DocumentFragment ) ? new DocumentFragment() : child;
			}
		});
		Object.defineProperty( Node.prototype, 'insertNeighborBefore', {
			configurable, writable, enumerable,
			value: function(child) {
				if ( !this.parentNode ) {
					throw new RangeError( "Reference element is currently in detached mode! No way to add neighbors!" );
				}
			
				this.parentNode.insertBefore(child, this);
				return ( this instanceof DocumentFragment ) ? new DocumentFragment() : child;
			}
		});
		Object.defineProperty( Node.prototype, 'insertNeighborAfter', {
			configurable, writable, enumerable,
			value: function(child) {
				if ( !this.parentNode ) {
					throw new RangeError( "Reference element is currently in detached mode! No way to add neighbors!" );
				}
				
				this.parentNode.insertBefore(child, this.nextSibling);
				return ( this instanceof DocumentFragment ) ? new DocumentFragment() : child;
			}
		});
		Object.defineProperty( Node.prototype, 'setContentText', {
			configurable, writable, enumerable,
			value: function(text) {
				this.textContent = text;
				return this;
			}
		});
	}
})();
//@endexport
