/**
 *	Author: JCloudYu
 *	Create: 2019/08/30
**/
Object.defineProperty(Array.prototype, 'unique', {
	writable:true, configurable:true, enumerable:false,
	value: function(){
		const set = new Set();
		for ( const item of this ) set.add(item);
		return Array.from(set);
	}
});
Object.defineProperty(Array.prototype, 'exclude', {
	writable:true, configurable:true, enumerable:false,
	value: function(reject_list) {
		if ( !Array.isArray(reject_list) ) {
			reject_list = [reject_list];
		}
	
		const new_ary = [];
		for(const item of this) {
			let reject = false;
			for(const reject_item of reject_list) {
				if ( item === reject_item ) {
					reject = reject || true;
					break;
				}
			}
			if ( !reject ) {
				new_ary.push(item);
			}
		}
	
		return new_ary;
	}
});
