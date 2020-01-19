/**
 *	Author: JCloudYu
 *	Create: 2019/09/20
**/
export const IsNodeJS = (typeof Buffer !== "undefined");
export function Padding(val, length=2, stuffing='0'){
	val = `${val}`;
	let remain = length - val.length;
	while( remain-- > 0 ) {
		val = stuffing + val;
	}
	return val;
}


const GLOBAL = IsNodeJS ? global : window;
export const ExtES = GLOBAL.ExtES = Object.create(null);
