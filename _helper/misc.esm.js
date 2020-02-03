/**
 *	Author: JCloudYu
 *	Create: 2019/09/20
**/
//@export=helper
const IsNodeJS = (typeof Buffer !== "undefined");
const ExtES=(()=>{
	const GLOBAL = IsNodeJS ? global : window;
	return GLOBAL.ExtES = Object.create(null);
})();
function Padding(val, length=2, stuffing='0'){
	val = `${val}`;
	let remain = length - val.length;
	while( remain-- > 0 ) {
		val = stuffing + val;
	}
	return val;
}
//@endexport



export {
	IsNodeJS, Padding, ExtES
};
