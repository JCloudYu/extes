/**
 *	Author: JCloudYu
 *	Create: 2019/09/20
**/
export function Padding(val, length=2, stuffing='0'){
	val = `${val}`;
	let remain = length - val.length;
	while( remain-- > 0 ) {
		val = stuffing + val;
	}
	return val;
}
