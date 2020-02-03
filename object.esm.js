/**
 *	Author: JCloudYu
 *	Create: 2019/07/12
**/
const writable=true, configurable=true, enumerable=false;

//@export
(()=>{
	"use strict";
	
	const _ObjectDefineProperty = Object.defineProperty;
	const _ObjectDefineProperties = Object.defineProperties;
	
	
	
	_ObjectDefineProperty(Object, 'defineProperty', {
		writable, configurable, enumerable,
		value: ObjectDefineProperty
	});
	_ObjectDefineProperty(Object, 'defineProperties', {
		writable, configurable, enumerable,
		value: ObjectDefineProperties
	});
	
	Object.defineProperty(Object, 'assignProperties', {
		writable, configurable, enumerable,
		value: ObjectAssignProperties
	});
	Object.defineProperty(Object, 'assignValues', {
		writable, configurable, enumerable,
		value: ObjectAssignValues
	});
	Object.defineProperty(Object, 'assignConstants', {
		writable, configurable, enumerable,
		value: (dst, src, enumerable=false)=>{
			return ObjectAssignValues(dst, src, {
				configurable:false, writable:false, enumerable
			});
		}
	});
	Object.defineProperty(Object, 'merge', {
		writable, configurable, enumerable,
		value: ObjectMerge
	});
	Object.defineProperty(Object, 'generate', {
		writable, configurable, enumerable,
		value: ObjectGenerate
	});
	Object.defineProperty(Object, 'typeOf', {
		writable, configurable, enumerable,
		value: TypeOf
	});
	Object.defineProperty(Object.prototype, '_decorate', {
		writable, configurable, enumerable,
		value: function(processor, ...args) {
			if ( typeof processor === "function" ) {
				processor.call(this, ...args);
			}
			return this;
		}
	});
	
	
	
	
	
	function ObjectDefineProperty(object, prop_name, prop_attr) {
		_ObjectDefineProperty(object, prop_name, prop_attr);
		return object;
	}
	function ObjectDefineProperties(object, prop_contents) {
		_ObjectDefineProperties(object, prop_contents);
		return object;
	}
	function ObjectAssignProperties(object, props, attr={configurable:true, enumerable:false, writable:true}) {
		const _i_conf = !!attr.configurable;
		const _i_enum = !!attr.enumerable;
		const _i_writ = !!attr.writable;
		
		for( const prop in props ) {
			const descriptor = props[prop];
			if ( Object(descriptor) !== descriptor ) continue;
			
			
			const is_accessor = (descriptor.get || descriptor.set);
			const is_data = (descriptor.value || descriptor.writable);
			
			if ( is_accessor && is_data ) {
				throw new SyntaxError( "A property descriptor can be either an accessor descriptor or a data descriptor" );
			}
			
			if ( is_accessor ) {
				_ObjectDefineProperty(object, prop, {
					get: descriptor.get,
					set: descriptor.set,
					configurable:descriptor.configurable === undefined ? _i_conf : !!descriptor.configurable,
					enumerable:descriptor.enumerable === undefined ? _i_enum : !!descriptor.enumerable
				});
			}
			else {
				_ObjectDefineProperty(object, prop, {
					value:descriptor.value,
					configurable:descriptor.configurable === undefined ? _i_conf : !!descriptor.configurable,
					enumerable:descriptor.enumerable === undefined ? _i_enum : !!descriptor.enumerable,
					writable:descriptor.writable === undefined ? _i_writ : !!descriptor.writable
				});
			}
		}
		
		return object;
	}
	function ObjectAssignValues(object, props, attr={configurable:true, enumerable:false, writable:true}) {
		const configurable = !!attr.configurable;
		const enumerable = !!attr.enumerable;
		const writable = !!attr.writable;
	
		for ( const prop in props ) {
			const value = props[prop];
			if ( props[prop] === undefined ) continue;
			
			_ObjectDefineProperty(object, prop, {
				value, configurable, enumerable, writable
			});
		}
		
		return object;
	}
	function ObjectMerge(target, source) {
		if ( Object(target) !== target ) {
			throw new Error("Given target is not an object");
		}
		
		if ( Object(source) !== source ) {
			throw new Error("Given source is not an object");
		}
		
		
		for (const key in source) {
			if ( (source.hasOwnProperty && !source.hasOwnProperty(key)) ||
				 (source[key] === undefined)
			) { continue; }
		
			
			
			const tValue = target[key];
			const sValue = source[key];
			const tType	 = TypeOf(tValue);
			const sType	 = TypeOf(sValue);
			
			if ( tType !== "object" || sType !== "object" ) {
				if ( target instanceof Map ) {
					target.set(key, sValue);
				}
				else {
					target[key] = sValue;
				}
				continue;
			}
			
			ObjectMerge(tValue, sValue);
		}
		
		return target;
	}
	function ObjectGenerate(field, prototype=null) {
		const object = Object.create(prototype);
		if ( Object(field) === field ) {
			Object.assign(object, field);
		}
		return object;
	}
	function TypeOf(input, resolveObj=false) {
		const type = typeof input;
		switch(type) {
			case "number":
			case "string":
			case "function":
			case "boolean":
			case "undefined":
			case "symbol":
				return type;
		}
		
		if ( input === null ) {
			return "null";
		}
		
		if ( input instanceof String ) {
			return "string";
		}
		
		if ( input instanceof Number ) {
			return "number";
		}
		
		if ( input instanceof Boolean ) {
			return "boolean";
		}
		
		if ( Array.isArray(input) ) {
			return "array";
		}
		
		
		if ( !resolveObj ) {
			return "object";
		}
		
		
		// None-primitive
		if ( input instanceof ArrayBuffer ) {
			return "array-buffer"
		}
		
		if ( input instanceof DataView ) {
			return "data-view";
		}
		
		if ( input instanceof Uint8Array ) {
			return "uint8-array";
		}
		
		if ( input instanceof Uint8ClampedArray ) {
			return "uint8-clamped-array";
		}
		
		if ( input instanceof Int8Array ) {
			return "int8-array";
		}
		
		if ( input instanceof Uint16Array ) {
			return "uint16-array";
		}
		
		if ( input instanceof Int16Array ) {
			return "int16-array";
		}
		
		if ( input instanceof Uint32Array ) {
			return "uint32-array";
		}
		
		if ( input instanceof Int32Array ) {
			return "int32-array";
		}
		
		if ( input instanceof Float32Array ) {
			return "float32-array";
		}
		
		if ( input instanceof Float64Array ) {
			return "float64-array";
		}
		
		if ( input instanceof Map ) {
			return "map";
		}
		
		if ( input instanceof WeakMap ) {
			return "weak-map";
		}
		
		if ( input instanceof Set ) {
			return "set";
		}
		
		if ( input instanceof WeakSet ) {
			return "weak-set";
		}
		
		if ( input instanceof RegExp ) {
			return "regexp"
		}
		
		if ( input instanceof Promise ) {
			return "promise";
		}
		
		return "object";
	}
})();
//@endexport
