/**
 *	Author: JCloudYu
 *	Create: 2019/07/19
**/

//@export=helper
const UTF8_DECODE_CHUNK_SIZE = 100;

/**
 *	Encode given input js string using utf8 format
 *	@param {String} js_str
 *	@returns {Uint8Array}
**/
function UTF8Encode(js_str) {
	if ( typeof js_str !== "string" ) {
		throw new TypeError( "Given input argument must be a js string!" );
	}

	let codePoints = [];
	let i=0;
	while( i < js_str.length ) {
		let codePoint = js_str.codePointAt(i);
		
		// 1-byte sequence
		if( (codePoint & 0xffffff80) === 0 ) {
			codePoints.push(codePoint);
		}
		// 2-byte sequence
		else if( (codePoint & 0xfffff800) === 0 ) {
			codePoints.push(
				0xc0 | (0x1f & (codePoint >> 6)),
				0x80 | (0x3f & codePoint)
			);
		}
		// 3-byte sequence
		else if( (codePoint & 0xffff0000) === 0 ) {
			codePoints.push(
				0xe0 | (0x0f & (codePoint >> 12)),
				0x80 | (0x3f & (codePoint >> 6)),
				0x80 | (0x3f & codePoint)
			);
		}
		// 4-byte sequence
		else if( (codePoint & 0xffe00000) === 0 ) {
			codePoints.push(
				0xf0 | (0x07 & (codePoint >> 18)),
				0x80 | (0x3f & (codePoint >> 12)),
				0x80 | (0x3f & (codePoint >> 6)),
				0x80 | (0x3f & codePoint)
			);
		}
		
		i += (codePoint>0xFFFF) ? 2 : 1;
	}
	return new Uint8Array(codePoints);
}

/**
 *	Decode given input buffer using utf8 format
 *	@param {ArrayBuffer|Uint8Array} raw_bytes
 *	@returns {string}
**/
function UTF8Decode(raw_bytes) {
	if ( raw_bytes instanceof ArrayBuffer ) {
		raw_bytes = new Uint8Array(raw_bytes);
	}

	if ( !(raw_bytes instanceof Uint8Array) ) {
		throw new TypeError( "Given input must be an Uint8Array contains UTF8 encoded value!" );
	}

	let uint8 = raw_bytes;
	let codePoints = [];
	let i = 0;
	while( i < uint8.length ) {
		let codePoint = uint8[i] & 0xff;
		
		// 1-byte sequence (0 ~ 127)
		if( (codePoint & 0x80) === 0 ){
			codePoints.push(codePoint);
			i += 1;
		}
		// 2-byte sequence (192 ~ 223)
		else if( (codePoint & 0xE0) === 0xC0 ){
			codePoint = ((0x1f & uint8[i]) << 6) | (0x3f & uint8[i + 1]);
			codePoints.push(codePoint);
			i += 2;
		}
		// 3-byte sequence (224 ~ 239)
		else if( (codePoint & 0xf0) === 0xe0 ){
			codePoint = ((0x0f & uint8[i]) << 12)
				| ((0x3f & uint8[i + 1]) << 6)
				| (0x3f & uint8[i + 2]);
			codePoints.push(codePoint);
			i += 3;
		}
		// 4-byte sequence (249 ~ )
		else if( (codePoint & 0xF8) === 0xF0 ){
			codePoint = ((0x07 & uint8[i]) << 18)
				| ((0x3f & uint8[i + 1]) << 12)
				| ((0x3f & uint8[i + 2]) << 6)
				| (0x3f & uint8[i + 3]);
			codePoints.push(codePoint);
			i += 4;
		}
		else {
			i += 1;
		}
	}
	
	
	
	let result_string = "";
	while(codePoints.length > 0) {
		const chunk = codePoints.splice(0, UTF8_DECODE_CHUNK_SIZE);
		result_string += String.fromCodePoint(...chunk);
	}
	return result_string;
}
//@endexport


export { UTF8Encode, UTF8Decode };
