/**
 *	Author: JCloudYu
 *	Create: 2019/09/20
**/
import {Padding} from "./_helper/misc.esm.js";
const configurable=true, writable=true, enumerable=false;

//@export
(()=>{
	"use strict";

	Object.defineProperty(Date.prototype, 'toLocaleISOString', {
		writable, configurable, enumerable,
		value: function(){
			let offset, zone = this.getTimezoneOffset();
			if ( zone === 0 ) {
				offset = 'Z';
			}
			else {
				const sign = zone > 0 ? '-' : '+';
				zone = Math.abs(zone);
				const zone_hour = Math.floor(zone/60);
				const zone_min  = zone%60;
				
				offset = sign + Padding(zone_hour) + Padding(zone_min);
			}
			
			
		
			return  this.getFullYear() +
				'-' + Padding(this.getMonth()+1) +
				'-' + Padding(this.getDate()) +
				'T' + Padding(this.getHours()) +
				':' + Padding(this.getMinutes()) +
				':' + Padding(this.getSeconds()) +
				'.' + (this.getMilliseconds() % 1000) +
				offset;
		}
	});
})();
//@endexport
