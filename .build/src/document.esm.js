/**
 *	Author: JCloudYu
 *	Create: 2019/12/30
**/
const configurable=true, writable=true, enumerable=false;

//@export
(()=>{
	if ( typeof Document !== "undefined" ) {
		Object.defineProperties(Document.prototype, {
			parseHTML: {
				configurable, writable, enumerable,
				value: function(html) {
					const shadow = this.implementation.createHTMLDocument();
					const shadowed_body = shadow.body;
					shadowed_body.innerHTML = html;
					if ( shadowed_body.children.length === 0 ) {
						return null;
					}
					
					if ( shadowed_body.children.length === 1 ) {
						const item = shadowed_body.children[0];
						item.remove();
						return item;
					}
					
					
					const elements = Array.prototype.slice.call(shadowed_body.children, 0);
					for(const element of elements) {
						element.remove();
					}
					return elements;
				}
			}
		});
	}
})();
//@endexport
