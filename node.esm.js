/**
 *	Author: JCloudYu
 *	Create: 2019/07/23
**/
if ( typeof Node !== "undefined" ) {
	Node.prototype.prependChild = function(child) {
		this.insertBefore(child, this.children[0]||null);
		return ( this instanceof DocumentFragment ) ? new DocumentFragment() : child;
	}
}
