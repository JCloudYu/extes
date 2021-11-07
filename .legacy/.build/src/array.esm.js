/**
 *	Author: JCloudYu
 *	Create: 2019/08/30
**/
const writable=true, configurable=true, enumerable=false;

//@export
(()=>{
	Object.defineProperty(Array.prototype, 'unique', {
		writable, configurable, enumerable,
		value: function(){
			const set = new Set();
			for ( const item of this ) set.add(item);
			return Array.from(set);
		}
	});
	Object.defineProperty(Array.prototype, 'exclude', {
		writable, configurable, enumerable,
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
	
	Object.defineProperty(Array, 'concat', {
		writable, configurable, enumerable,
		value: function(...elements) {
			const result = [];
			for(const element of elements) {
				if ( !Array.isArray(element) ) {
					result.push(element);
					continue;
				}
				
				for(const elm of element) {
					result.push(elm);
				}
			}
			
			return result;
		}
	});
	Object.defineProperty(Array, 'intersect', {
		writable, configurable, enumerable,
		value: function(...arrays) {
			let result = arrays[0]||[];
			if ( !Array.isArray(result) ) {
				throw new TypeError(`Array.intersect only accepts list array arguments!`);
			}
			
			for(let i=1; i<arrays.length; i++) {
				const array = arrays[i];
				if ( !Array.isArray(array) ) {
					throw new TypeError(`Array.intersect only accepts list array arguments!`);
				}
				
				const new_result = new Set();
				for(const elm of result) {
					if ( array.indexOf(elm) >= 0 ) {
						new_result.add(elm);
					}
				}
				
				result = Array.from(new_result);
			}
			return result;
		}
	})
})();
//@endexport
