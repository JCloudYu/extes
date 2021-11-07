/**
 *	Author: JCloudYu
 *	Create: 2019/07/23
**/
const configurable = true, writable = true, enumerable = false;

//@export
(()=>{
	if ( typeof HTMLElement !== "undefined" ) {
		Object.defineProperties(HTMLElement.prototype, {
			setData: {
				configurable, writable, enumerable,
				value: function(key, value) {
					if ( Object(key) === key ) {
						for(const _key in key) {
							this.dataset[_key] = key[_key];
						}
					}
					else {
						this.dataset[key] = value;
					}
					return this;
				}
			},
			getData: {
				configurable, writable, enumerable,
				value: function(key) {
					return this.dataset[key];
				}
			},
			removeData: {
				configurable, writable, enumerable,
				value: function(...data_names) {
					for( const name of data_names ) {
						delete this.dataset[name];
					}
					return this;
				}
			},
			setContentHtml: {
				configurable, writable, enumerable,
				value: function(html) {
					this.innerHTML = html;
					return this;
				}
			}
		});
	}
})();
//@endexport
