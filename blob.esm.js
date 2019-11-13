/**
 *	Author: JCloudYu
 *	Create: 2019/11/13
**/
Object.defineProperty(Blob.prototype, 'arrayBuffer', {
	configurable:true, writable:true, enumerable:false,
	value:function() {
		return new Promise((resolve, reject)=>{
			const reader = new FileReader();
			reader.onerror = reject;
			reader.onload = ()=>resolve(reader.result);
			reader.readAsArrayBuffer(this);
		});
	}
});
