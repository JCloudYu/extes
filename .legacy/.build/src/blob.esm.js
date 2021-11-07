/**
 *	Author: JCloudYu
 *	Create: 2019/11/13
**/
const configurable=true, writable=true, enumerable=false;

//@export
(()=>{
	if ( typeof Blob !== "undefined" ) {
		Object.defineProperty(Blob.prototype, 'arrayBuffer', {
			configurable, writable, enumerable,
			value:function() {
				return new Promise((resolve, reject)=>{
					const reader = new FileReader();
					reader.onerror = reject;
					reader.onload = ()=>resolve(reader.result);
					reader.readAsArrayBuffer(this);
				});
			}
		});
	}
})();
//@endexport
