/**
 *	Author: JCloudYu
 *	Create: 2019/07/23
**/
if ( typeof HTMLElement !== "undefined" ) {
	HTMLElement.prototype.setData = function(key_val={}) {
		for(const key in key_val) {
			this.dataset[key] = key_val[key];
		}
		return this;
	};
	
	HTMLElement.prototype.removeData = function(...data_names) {
		for( const name of data_names ) {
			delete this.dataset[name];
		}
		return this;
	}
}
