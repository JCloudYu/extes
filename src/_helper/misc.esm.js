/**
 *	Author: JCloudYu
 *	Create: 2019/09/20
**/
//@export=helper
const IsNodeJS = (typeof Buffer !== "undefined");
function Padding(val, length=2, stuffing='0'){
	val = `${val}`;
	let remain = length - val.length;
	while( remain-- > 0 ) {
		val = stuffing + val;
	}
	return val;
}
function ExtractArrayBuffer(content) {
	if ( IsNodeJS ) {
		if ( Buffer.isBuffer(content) ) {
			return (new Uint8Array(content)).buffer;
		}
	}
	
	if ( ArrayBuffer.isView(content) ) {
		return content.buffer;
	}
	
	if ( content instanceof ArrayBuffer ){
		return content;
	}
	
	
	return null;
}
//@endexport



export {
	IsNodeJS, Padding, ExtractArrayBuffer
};
