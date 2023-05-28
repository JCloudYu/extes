(()=>{
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var writable = true, configurable = true, enumerable = false;
var Tools = /** @class */ (function () {
    function Tools() {
    }
    Tools.Padding = function (val, length, stuffing) {
        if (length === void 0) { length = 2; }
        if (stuffing === void 0) { stuffing = '0'; }
        val = "".concat(val);
        var remain = length - val.length;
        while (remain-- > 0) {
            val = stuffing + val;
        }
        return val;
    };
    Tools.ExtractBytes = function (content) {
        if (typeof Buffer !== "undefined") {
            if (Buffer.isBuffer(content)) {
                return new Uint8Array(content);
            }
        }
        if (ArrayBuffer.isView(content)) {
            return new Uint8Array(content.buffer);
        }
        if (content instanceof ArrayBuffer) {
            return new Uint8Array(content);
        }
        return null;
    };
    Tools.UTF8Encode = function (js_str) {
        if (typeof js_str !== "string") {
            throw new TypeError("Given input argument must be a js string!");
        }
        var code_points = [];
        for (var i = 0; i < js_str.length;) {
            var point = js_str.codePointAt(i);
            // 1-byte sequence
            if ((point & 0xffffff80) === 0) {
                code_points.push(point);
            }
            // 2-byte sequence
            else if ((point & 0xfffff800) === 0) {
                code_points.push(0xc0 | (0x1f & (point >> 6)), 0x80 | (0x3f & point));
            }
            // 3-byte sequence
            else if ((point & 0xffff0000) === 0) {
                code_points.push(0xe0 | (0x0f & (point >> 12)), 0x80 | (0x3f & (point >> 6)), 0x80 | (0x3f & point));
            }
            // 4-byte sequence
            else if ((point & 0xffe00000) === 0) {
                code_points.push(0xf0 | (0x07 & (point >> 18)), 0x80 | (0x3f & (point >> 12)), 0x80 | (0x3f & (point >> 6)), 0x80 | (0x3f & point));
            }
            i += (point > 0xFFFF) ? 2 : 1;
        }
        return new Uint8Array(code_points);
    };
    Tools.UTF8Decode = function (uint8) {
        if (uint8 instanceof ArrayBuffer)
            uint8 = new Uint8Array(uint8);
        if (!(uint8 instanceof Uint8Array)) {
            throw new TypeError("Given input must be an Uint8Array contains UTF8 encoded value!");
        }
        var code_points = [];
        for (var i = 0; i < uint8.length;) {
            var codePoint = uint8[i] & 0xff;
            // 1-byte sequence (0 ~ 127)
            if ((codePoint & 0x80) === 0) {
                code_points.push(codePoint);
                i += 1;
            }
            // 2-byte sequence (192 ~ 223)
            else if ((codePoint & 0xE0) === 0xC0) {
                codePoint = ((0x1f & uint8[i]) << 6) | (0x3f & uint8[i + 1]);
                code_points.push(codePoint);
                i += 2;
            }
            // 3-byte sequence (224 ~ 239)
            else if ((codePoint & 0xf0) === 0xe0) {
                codePoint = ((0x0f & uint8[i]) << 12)
                    | ((0x3f & uint8[i + 1]) << 6)
                    | (0x3f & uint8[i + 2]);
                code_points.push(codePoint);
                i += 3;
            }
            // 4-byte sequence (249 ~ )
            else if ((codePoint & 0xF8) === 0xF0) {
                codePoint = ((0x07 & uint8[i]) << 18)
                    | ((0x3f & uint8[i + 1]) << 12)
                    | ((0x3f & uint8[i + 2]) << 6)
                    | (0x3f & uint8[i + 3]);
                code_points.push(codePoint);
                i += 4;
            }
            else {
                i += 1;
            }
        }
        var result_string = "";
        while (code_points.length > 0) {
            var chunk = code_points.splice(0, this.UTF8_DECODE_CHUNK_SIZE);
            result_string += String.fromCodePoint.apply(String, chunk);
        }
        return result_string;
    };
    Tools.UTF8_DECODE_CHUNK_SIZE = 100;
    return Tools;
}());
(function () {
    var HEX_FORMAT = /^(0x)?([0-9a-fA-F]+)$/;
    var BIT_FORMAT = /^(0b|0B)?([01]+)$/;
    var HEX_MAP = "0123456789abcdef";
    var HEX_MAP_R = {
        "0": 0, "1": 1, "2": 2, "3": 3,
        "4": 4, "5": 5, "6": 6, "7": 7,
        "8": 8, "9": 9, "a": 10, "b": 11,
        "c": 12, "d": 13, "e": 14, "f": 15
    };
    Object.defineProperty(ArrayBuffer.prototype, 'bytes', {
        configurable: configurable,
        enumerable: enumerable,
        get: function () { return new Uint8Array(this); }
    });
    Object.defineProperty(Uint8Array, 'from', {
        configurable: configurable,
        writable: writable,
        enumerable: enumerable,
        value: function (input, conversion_info) {
            if (Array.isArray(input)) {
                return new Uint8Array(input);
            }
            if (typeof input === "string") {
                if (conversion_info === "hex" || conversion_info === 16) {
                    var matches = input.match(HEX_FORMAT);
                    if (!matches) {
                        throw new RangeError("Input argument is not a valid hex string!");
                    }
                    var hex_string = matches[2];
                    if (hex_string.length % 2 === 0) {
                        hex_string = hex_string.toLowerCase();
                    }
                    else {
                        hex_string = '0' + hex_string.toLowerCase();
                    }
                    var buff = new Uint8Array((hex_string.length / 2) | 0);
                    for (var i = 0; i < buff.length; i++) {
                        var offset = i * 2;
                        buff[i] = HEX_MAP_R[hex_string[offset]] << 4 | (HEX_MAP_R[hex_string[offset + 1]] & 0x0F);
                    }
                    return buff;
                }
                else if (conversion_info === "bits" || conversion_info === 2) {
                    var matches = input.match(BIT_FORMAT);
                    if (!matches) {
                        throw new RangeError("Input argument is not a valid bit string!");
                    }
                    var bit_string = matches[2];
                    if (bit_string.length % 8 !== 0) {
                        bit_string = '0'.repeat(bit_string.length % 8) + bit_string;
                    }
                    var buff = new Uint8Array((bit_string.length / 8) | 0);
                    for (var i = 0; i < buff.length; i++) {
                        var offset = i * 8;
                        var value = (bit_string[offset] === '1' ? 1 : 0);
                        for (var k = 1; k < 8; k++) {
                            value = (value << 1) | (bit_string[offset + k] === '1' ? 1 : 0);
                        }
                        buff[i] = value;
                    }
                    return buff;
                }
                else {
                    return Tools.UTF8Encode(input);
                }
            }
            var result = Tools.ExtractBytes(input);
            if (!result) {
                throw new TypeError("Cannot convert given input data into array buffer!");
            }
            return result;
        }
    });
    Object.defineProperty(Uint8Array, 'compare', {
        configurable: configurable,
        writable: writable,
        enumerable: enumerable,
        value: function (a, b) {
            var A = Tools.ExtractBytes(a), B = Tools.ExtractBytes(b);
            if (!A || !B) {
                throw new TypeError("Given arguments must be instances of ArrayBuffer, TypedArray or DataView!");
            }
            var len = Math.max(A.length, B.length);
            for (var i = 0; i < len; i++) {
                var val_a = A[i] || 0, val_b = B[i] || 0;
                if (val_a > val_b)
                    return 1;
                if (val_a < val_b)
                    return -1;
            }
            return 0;
        }
    });
    Object.defineProperty(Uint8Array, 'dump', {
        configurable: configurable,
        writable: writable,
        enumerable: enumerable,
        value: function (buffer, format, padding) {
            if (format === void 0) { format = 16; }
            if (padding === void 0) { padding = true; }
            var bytes = Tools.ExtractBytes(buffer);
            if (bytes === null) {
                throw new TypeError("Argument 1 expects an instance of ArrayBuffer, TypedArray or DataView!");
            }
            var result = '';
            switch (format) {
                case 16:
                    for (var i = 0; i < bytes.length; i++) {
                        var value = bytes[i];
                        result += HEX_MAP[(value & 0xF0) >>> 4] + HEX_MAP[value & 0x0F];
                    }
                    break;
                case 2:
                    for (var i = 0; i < bytes.length; i++) {
                        var value = bytes[i];
                        for (var k = 7; k >= 0; k--) {
                            result += ((value >>> k) & 0x01) ? '1' : '0';
                        }
                    }
                    break;
                default:
                    throw new RangeError("Unsupported numeric representation!");
            }
            return padding ? result : result.replace(/^0+/, '');
        }
    });
    Object.defineProperty(Uint8Array, 'concat', {
        configurable: configurable,
        writable: writable,
        enumerable: enumerable,
        value: function (incoming_buffers) {
            if (!Array.isArray(incoming_buffers)) {
                throw new TypeError("Given argument must be an array of ArrayBuffer, TypedArray or DataView instances!");
            }
            var pointer = 0, buffers = [];
            for (var _i = 0, incoming_buffers_1 = incoming_buffers; _i < incoming_buffers_1.length; _i++) {
                var buffer = incoming_buffers_1[_i];
                var arg = Tools.ExtractBytes(buffer);
                if (arg === null) {
                    throw new TypeError("Given argument must be an array of ArrayBuffer, TypedArray or DataView instances!");
                }
                pointer += arg.length;
                buffers.push(arg);
            }
            var buff = new Uint8Array(pointer);
            pointer = 0;
            for (var _a = 0, buffers_1 = buffers; _a < buffers_1.length; _a++) {
                var arg = buffers_1[_a];
                buff.set(arg, pointer);
                pointer += arg.length;
            }
            return buff;
        }
    });
})();
(function () {
    Object.defineProperty(Array.prototype, 'unique', {
        writable: writable,
        configurable: configurable,
        enumerable: enumerable,
        value: function () {
            var set = new Set();
            for (var _i = 0, _a = this; _i < _a.length; _i++) {
                var item = _a[_i];
                set.add(item);
            }
            return Array.from(set);
        }
    });
    Object.defineProperty(Array.prototype, 'exclude', {
        writable: writable,
        configurable: configurable,
        enumerable: enumerable,
        value: function (reject_list) {
            if (!Array.isArray(reject_list)) {
                reject_list = [reject_list];
            }
            var new_ary = [];
            for (var _i = 0, _a = this; _i < _a.length; _i++) {
                var item = _a[_i];
                var reject = false;
                for (var _b = 0, reject_list_1 = reject_list; _b < reject_list_1.length; _b++) {
                    var reject_item = reject_list_1[_b];
                    if (item === reject_item) {
                        reject = reject || true;
                        break;
                    }
                }
                if (!reject) {
                    new_ary.push(item);
                }
            }
            return new_ary;
        }
    });
})();
(function () {
    Object.defineProperty(Date, 'from', {
        writable: writable,
        configurable: configurable,
        enumerable: enumerable,
        value: function (value, month, date, hours, minutes, seconds, ms) {
            if (arguments.length === 0) {
                throw new Error("Date.from expects at least one arguments!");
            }
            try {
                if (typeof value === "string" || arguments.length === 1) {
                    return new Date(value);
                }
                else if (arguments.length === 2) {
                    return new Date(value, month);
                }
                else if (arguments.length === 3) {
                    return new Date(value, month, date);
                }
                else if (arguments.length === 4) {
                    return new Date(value, month, date, hours);
                }
                else if (arguments.length === 5) {
                    return new Date(value, month, date, hours, minutes);
                }
                else if (arguments.length === 6) {
                    return new Date(value, month, date, hours, minutes, seconds);
                }
                else {
                    return new Date(value, month, date, hours, minutes, seconds, ms);
                }
            }
            catch (e) {
                return null;
            }
        }
    });
    Object.defineProperty(Date, 'present', {
        configurable: configurable,
        enumerable: enumerable,
        get: function () { return new Date(); }
    });
    Object.defineProperty(Date, 'unix', {
        writable: writable,
        configurable: configurable,
        enumerable: enumerable,
        value: function () {
            return Math.floor(Date.now() / 1000);
        }
    });
    Object.defineProperty(Date, 'zoneShift', {
        writable: writable,
        configurable: configurable,
        enumerable: enumerable,
        value: function () {
            var date = new Date();
            return date.getTimezoneOffset() * 60000;
        }
    });
    Object.defineProperty(Date.prototype, 'getUnixTime', {
        writable: writable,
        configurable: configurable,
        enumerable: enumerable,
        value: function () {
            return Math.floor(this.getTime() / 1000);
        }
    });
    Object.defineProperty(Date.prototype, 'toLocaleISOString', {
        writable: writable,
        configurable: configurable,
        enumerable: enumerable,
        value: function (show_milli) {
            if (show_milli === void 0) { show_milli = false; }
            var offset, zone = this.getTimezoneOffset();
            if (zone === 0) {
                offset = 'Z';
            }
            else {
                var sign = zone > 0 ? '-' : '+';
                zone = Math.abs(zone);
                var zone_hour = Math.floor(zone / 60);
                var zone_min = zone % 60;
                offset = sign + Tools.Padding(zone_hour) + Tools.Padding(zone_min);
            }
            var milli = show_milli ? ('.' + Tools.Padding(this.getMilliseconds() % 1000, 3)) : '';
            return this.getFullYear() +
                '-' + Tools.Padding(this.getMonth() + 1) +
                '-' + Tools.Padding(this.getDate()) +
                'T' + Tools.Padding(this.getHours()) +
                ':' + Tools.Padding(this.getMinutes()) +
                ':' + Tools.Padding(this.getSeconds()) +
                milli + offset;
        }
    });
    // getter
    Object.defineProperty(Date.prototype, 'unix', {
        configurable: configurable,
        enumerable: enumerable,
        get: function () {
            return Math.floor(this.getTime() / 1000);
        }
    });
    Object.defineProperty(Date.prototype, 'time', {
        configurable: configurable,
        enumerable: enumerable,
        get: function () {
            return this.getTime();
        }
    });
    Object.defineProperty(Date.prototype, 'zoneShift', {
        configurable: configurable,
        enumerable: enumerable,
        get: function () {
            return this.getTimezoneOffset() * 60000;
        }
    });
})();
(function () {
    if (typeof Document !== "undefined") {
        Object.defineProperties(Document.prototype, {
            parseHTML: {
                configurable: configurable,
                writable: writable,
                enumerable: enumerable,
                value: function (html) {
                    var shadow = this.implementation.createHTMLDocument();
                    var shadowed_body = shadow.body;
                    shadowed_body.innerHTML = html;
                    var fragment = new DocumentFragment();
                    if (shadowed_body.children.length === 0)
                        return fragment;
                    if (shadowed_body.children.length === 1) {
                        var item = shadowed_body.children[0];
                        item.remove();
                        return item;
                    }
                    for (var _i = 0, _a = Array.prototype.slice.call(shadowed_body.children, 0); _i < _a.length; _i++) {
                        var element = _a[_i];
                        fragment.appendChild(element);
                    }
                    return fragment;
                }
            }
        });
    }
})();
(function () {
    if (typeof Error !== "undefined") {
        Object.defineProperty(Error.prototype, 'stack_trace', {
            get: function () {
                if (!this.stack)
                    return [];
                return this.stack.split(/\r\n|\n/g).map(function (item) { return item.trim(); });
            },
            enumerable: enumerable,
            configurable: configurable
        });
    }
})();
(function () {
    if (typeof EventTarget !== "undefined") {
        Object.defineProperty(EventTarget.prototype, 'on', {
            configurable: configurable,
            writable: writable,
            enumerable: enumerable,
            value: function (event_name, callback) {
                // Event name accepts name1#tag1,name2#tag1,name3#tag2
                var inserted = [];
                var events = event_name.split(',');
                for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
                    var evt_name = events_1[_i];
                    evt_name = evt_name.trim();
                    if (inserted.indexOf(evt_name) >= 0)
                        continue;
                    inserted.push(evt_name);
                    this.addEventListener(evt_name, callback);
                }
                return this;
            }
        });
        Object.defineProperty(EventTarget.prototype, 'off', {
            configurable: configurable,
            writable: writable,
            enumerable: enumerable,
            value: function (event_name, callback) {
                var events = event_name.split(',');
                for (var _i = 0, events_2 = events; _i < events_2.length; _i++) {
                    var evt_name = events_2[_i];
                    evt_name = evt_name.trim();
                    this.removeEventListener(evt_name, callback);
                }
                return this;
            }
        });
        Object.defineProperty(EventTarget.prototype, 'emit', {
            configurable: configurable,
            writable: writable,
            enumerable: enumerable,
            value: function (event, inits) {
                if (inits === void 0) { inits = {}; }
                var bubbles = inits.bubbles, cancelable = inits.cancelable, composed = inits.composed, event_args = __rest(inits, ["bubbles", "cancelable", "composed"]);
                if (typeof event === "string") {
                    event = new Event(event, {
                        bubbles: !!bubbles,
                        cancelable: !!cancelable,
                        composed: !!composed
                    });
                }
                if (!(event instanceof Event)) {
                    throw new TypeError("Argument 1 accepts only string or Event instance!");
                }
                Object.assign(event, event_args);
                return this.dispatchEvent(event);
            }
        });
    }
})();
(function () {
    Object.defineProperty(Function, 'sequential', {
        configurable: configurable,
        writable: writable,
        enumerable: enumerable,
        value: function PackSequentialCall(func_list, is_async, spread_args) {
            if (is_async === void 0) { is_async = false; }
            if (spread_args === void 0) { spread_args = false; }
            if (!Array.isArray(func_list)) {
                throw new TypeError("The first argument must be an array of functions!");
            }
            is_async = !!is_async;
            return function () {
                var _this = this;
                var incoming_args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    incoming_args[_i] = arguments[_i];
                }
                var prev_result = undefined;
                var session_this = {};
                if (!is_async) {
                    for (var _a = 0, func_list_1 = func_list; _a < func_list_1.length; _a++) {
                        var func = func_list_1[_a];
                        if (typeof func !== "function") {
                            prev_result = func;
                            continue;
                        }
                        var args = spread_args ? __spreadArray(__spreadArray([], incoming_args, true), [prev_result], false) : [prev_result];
                        prev_result = func.call.apply(func, __spreadArray([session_this], args, false));
                    }
                    return prev_result;
                }
                else {
                    return Promise.resolve().then(function () { return __awaiter(_this, void 0, void 0, function () {
                        var _i, func_list_2, func, args;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _i = 0, func_list_2 = func_list;
                                    _a.label = 1;
                                case 1:
                                    if (!(_i < func_list_2.length)) return [3 /*break*/, 4];
                                    func = func_list_2[_i];
                                    if (typeof func !== "function") {
                                        prev_result = func;
                                        return [3 /*break*/, 3];
                                    }
                                    args = spread_args ? __spreadArray(__spreadArray([], incoming_args, true), [prev_result], false) : [prev_result];
                                    return [4 /*yield*/, func.call.apply(func, __spreadArray([session_this], args, false))];
                                case 2:
                                    prev_result = _a.sent();
                                    _a.label = 3;
                                case 3:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 4: return [2 /*return*/, prev_result];
                            }
                        });
                    }); });
                }
            };
        }
    });
})();
(function () {
    Object.defineProperty(Object, 'merge', {
        writable: writable,
        configurable: configurable,
        enumerable: enumerable,
        value: function (target) {
            var sources = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                sources[_i - 1] = arguments[_i];
            }
            var target_type = TypeOf(target);
            if (target_type !== "Object") {
                throw new TypeError("This api expects argument 1 to be a simple object! But receved ".concat(target_type, "!"));
            }
            for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
                var source = sources_1[_a];
                DeepMerge(target, source);
            }
            return target;
        }
    });
    Object.defineProperty(Object, 'typeOf', {
        writable: writable,
        configurable: configurable,
        enumerable: enumerable,
        value: TypeOf
    });
    function DeepMerge(target, source) {
        for (var key in source) {
            if (source[key] === undefined)
                continue;
            var tValue = target[key];
            var sValue = source[key];
            var tType = TypeOf(tValue);
            var sType = TypeOf(sValue);
            if (tType !== "Object" || sType !== "Object") {
                target[key] = sValue;
                continue;
            }
            DeepMerge(tValue, sValue);
        }
    }
    function TypeOf(input) {
        var result = Object.prototype.toString.call(input);
        return result.substring(8, result.length - 1);
    }
})();
(function () {
    Object.defineProperties(Promise, {
        wait: {
            writable: writable,
            configurable: configurable,
            enumerable: enumerable,
            value: PromiseWaitAll
        },
        create: {
            writable: writable,
            configurable: configurable,
            enumerable: enumerable,
            value: FlattenedPromise
        },
        chain: {
            writable: writable,
            configurable: configurable,
            enumerable: enumerable,
            value: function (func) {
                var base_promise = Promise.resolve();
                return (typeof func !== "function") ? base_promise : base_promise.then(func);
            }
        }
    });
    function PromiseWaitAll(promise_queue) {
        if (promise_queue === void 0) { promise_queue = []; }
        if (!Array.isArray(promise_queue)) {
            promise_queue = [promise_queue];
        }
        if (promise_queue.length === 0) {
            return Promise.resolve([]);
        }
        return new Promise(function (resolve, reject) {
            var result_queue = [], ready_count = 0, resolved = true;
            var _loop_1 = function (idx) {
                var item = { resolved: true, seq: idx, result: null };
                result_queue.push(item);
                Promise.resolve(promise_queue[idx]).then(function (result) {
                    resolved = (item.resolved = true) && resolved;
                    item.result = result;
                }, function (error) {
                    resolved = (item.resolved = false) && resolved;
                    item.result = error;
                }).then(function () {
                    ready_count++;
                    if (promise_queue.length === ready_count) {
                        (resolved ? resolve : reject)(result_queue);
                    }
                });
            };
            for (var idx = 0; idx < promise_queue.length; idx++) {
                _loop_1(idx);
            }
        });
    }
    function FlattenedPromise() {
        var _resolve = null, _reject = null;
        var promise = new Promise(function (resolve, reject) {
            _resolve = resolve;
            _reject = reject;
        });
        //@ts-ignore
        promise.resolve = _resolve;
        //@ts-ignore
        promise.reject = _reject;
        //@ts-ignore
        promise.promise = promise;
        return promise;
    }
})();
(function () {
    var CAMEL_CASE_PATTERN = /(\w)(\w*)(\W*)/g;
    var CAMEL_REPLACER = function (match, $1, $2, $3) {
        return "".concat($1.toUpperCase()).concat($2.toLowerCase()).concat($3);
    };
    Object.defineProperties(String.prototype, {
        charCount: {
            configurable: configurable,
            enumerable: enumerable,
            get: function () {
                var i = 0, count = 0;
                while (i < this.length) {
                    var point = this.codePointAt(i);
                    var length_1 = (point > 0xFFFF) ? 2 : 1;
                    count++;
                    i += length_1;
                }
                return count;
            }
        },
        upperCase: {
            configurable: configurable,
            enumerable: enumerable,
            get: function () {
                return this.toUpperCase();
            }
        },
        localeUpperCase: {
            configurable: configurable,
            enumerable: enumerable,
            get: function () {
                return this.toLocaleUpperCase();
            }
        },
        lowerCase: {
            configurable: configurable,
            enumerable: enumerable,
            get: function () {
                return this.toLowerCase();
            }
        },
        localeLowerCase: {
            configurable: configurable,
            enumerable: enumerable,
            get: function () {
                return this.toLocaleLowerCase();
            }
        },
        toCamelCase: {
            configurable: configurable,
            enumerable: enumerable,
            value: function () {
                return this.replace(CAMEL_CASE_PATTERN, CAMEL_REPLACER);
            }
        },
        camelCase: {
            configurable: configurable,
            enumerable: enumerable,
            get: function () {
                return this.replace(CAMEL_CASE_PATTERN, CAMEL_REPLACER);
            }
        },
        pull: {
            configurable: configurable,
            enumerable: enumerable,
            writable: writable,
            value: function (token_separator, from_begin) {
                if (token_separator === void 0) { token_separator = ''; }
                if (from_begin === void 0) { from_begin = true; }
                if (typeof token_separator !== "string") {
                    throw new TypeError("Given token must be a string");
                }
                var length = this.length;
                if (length === 0) {
                    return ['', ''];
                }
                if (token_separator === '') {
                    return from_begin ? [this[0], this.substring(1)] : [this.substring(0, length - 1), this[length - 1]];
                }
                if (from_begin) {
                    var index = this.indexOf(token_separator, token_separator.length);
                    if (index < 0) {
                        return [this.substring(0), ''];
                    }
                    return [this.substring(0, index), this.substring(index)];
                }
                else {
                    var index = this.lastIndexOf(token_separator);
                    if (index < 0) {
                        return ['', this.substring(0)];
                    }
                    return [this.substring(0, index), this.substring(index)];
                }
            }
        },
        cutin: {
            configurable: configurable,
            enumerable: enumerable,
            writable: writable,
            value: function (start, deleteCount) {
                var items = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    items[_i - 2] = arguments[_i];
                }
                if (start < 0)
                    start = start + this.length;
                if (deleteCount <= 0)
                    deleteCount = 0;
                var head = this.substring(0, start);
                var tail = this.substring(start + deleteCount);
                return head + items.join('') + tail;
            }
        }
    });
    Object.defineProperties(String, {
        encodeRegExpString: {
            writable: writable,
            configurable: configurable,
            enumerable: enumerable,
            value: function (input_string) {
                if (input_string === void 0) { input_string = ''; }
                return input_string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
            }
        },
        from: {
            writable: writable,
            configurable: configurable,
            enumerable: enumerable,
            value: function (content) {
                if (typeof content === "string")
                    return content;
                var bytes = Tools.ExtractBytes(content);
                if (bytes !== null) {
                    return Tools.UTF8Decode(bytes);
                }
                return '' + content;
            }
        }
    });
})();
(function () {
    Object.defineProperty(setTimeout, 'create', {
        writable: writable,
        configurable: configurable,
        enumerable: enumerable,
        value: ThrottledTimeout
    });
    Object.defineProperty(setTimeout, 'idle', {
        writable: writable,
        configurable: configurable,
        enumerable: enumerable,
        value: Idle
    });
    Object.defineProperty(setInterval, 'create', {
        writable: writable,
        configurable: configurable,
        enumerable: enumerable,
        value: ThrottledTimer
    });
    function ThrottledTimeout() {
        var _scheduled = null;
        var _executing = false;
        var _hTimeout = null;
        var timeout_cb = function (cb, delay) {
            if (delay === void 0) { delay = 0; }
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            _scheduled = { cb: cb, delay: delay, args: args };
            if (_executing)
                return;
            if (_hTimeout) {
                clearTimeout(_hTimeout);
                _hTimeout = null;
            }
            __DO_TIMEOUT();
        };
        timeout_cb.clear = function () {
            _scheduled = null;
            if (_hTimeout) {
                clearTimeout(_hTimeout);
                _hTimeout = null;
            }
        };
        return timeout_cb;
        function __DO_TIMEOUT() {
            if (!_scheduled)
                return;
            var cb = _scheduled.cb, delay = _scheduled.delay, args = _scheduled.args;
            _hTimeout = setTimeout(function () {
                _executing = true;
                Promise.resolve(cb.apply(void 0, args))
                    .then(function () {
                    _executing = false;
                    _hTimeout = null;
                    __DO_TIMEOUT();
                }, function (e) {
                    _executing = false;
                    _hTimeout = null;
                    _scheduled = null;
                    throw e;
                });
            }, delay);
            _scheduled = null;
        }
    }
    function Idle(duration) {
        if (duration === void 0) { duration = 0; }
        return new Promise(function (resolve) { setTimeout(resolve, duration); });
    }
    function ThrottledTimer() {
        var _this = this;
        var _timeout = ThrottledTimeout();
        var timeout_cb = function (cb, interval) {
            if (interval === void 0) { interval = 0; }
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var ___DO_TIMEOUT = function () { return __awaiter(_this, void 0, void 0, function () {
                var e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _timeout(___DO_TIMEOUT, interval);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, cb.apply(void 0, args)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            _timeout.clear();
                            throw e_1;
                        case 4: return [2 /*return*/];
                    }
                });
            }); };
            _timeout.apply(void 0, __spreadArray([___DO_TIMEOUT, interval], args, false));
        };
        timeout_cb.clear = function () {
            _timeout.clear();
        };
        return timeout_cb;
    }
})();
})();
