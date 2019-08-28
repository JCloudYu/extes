/**
 *	Author: JCloudYu
 *	Create: 2019/07/23
**/
if ( typeof Node !== "undefined" ) {
	Node.prototype.prependChild = function(child) {
		this.insertBefore(child, this.children[0]||null);
		return ( this instanceof DocumentFragment ) ? new DocumentFragment() : child;
	};
	
	Node.prototype.insertNeighborBefore = function(child) {
		if ( !this.parentNode ) {
			throw new RangeError( "Reference element is currently in detached mode! No way to add neighbors!" );
		}
	
		this.parentNode.insertBefore(child, this);
		return ( this instanceof DocumentFragment ) ? new DocumentFragment() : child;
	};
	
	Node.prototype.insertNeighborAfter = function(child) {
		if ( !this.parentNode ) {
			throw new RangeError( "Reference element is currently in detached mode! No way to add neighbors!" );
		}
		
		this.parentNode.insertBefore(child, this.nextSibling);
		return ( this instanceof DocumentFragment ) ? new DocumentFragment() : child;
	};
	
	Node.prototype.setContentText = function(text) {
		this.textContent = text;
		return this;
	};
}
