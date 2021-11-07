declare type TypedArray = Uint8ClampedArray | Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | Float32Array | Float64Array;
declare type BufferView = TypedArray | DataView;
interface ArrayBuffer {
    bytes: Uint8Array;
}
interface Uint8ArrayConstructor {
    from(data: ArrayBuffer | BufferView | number[]): Uint8Array;
    from(data: string, conversion: 'hex' | 'bits' | 'utf8' | 16 | 2): Uint8Array;
    compare(a: ArrayBuffer | BufferView, b: ArrayBuffer | BufferView): -1 | 0 | 1;
    concat(buffers: (ArrayBuffer | BufferView)[]): Uint8Array;
}
interface Uint8Array {
    compare(other: ArrayBuffer | BufferView): -1 | 0 | 1;
    toString(format?: 2 | 16, padding?: boolean): string;
}
interface Array<T> {
    unique(): Array<T>;
    exclude(reject_list: T[]): Array<T>;
}
interface DateConstructor {
    present: Date;
    from(value: number | string): Date;
    from(year: number, month: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): Date;
    unix(): number;
    zoneShift(): number;
}
interface Date {
    unix: number;
    time: number;
    zoneShift: number;
    getUnixTime(): number;
    toLocaleISOString(milli?: boolean): string;
}
interface Document {
    parseHTML(html: string): DocumentFragment;
}
interface Error {
    stack_trace: string[];
}
interface EventTarget {
    on(event_name: string, callback: (...args: any[]) => void | Promise<void>): this;
    off(event_name: string, callback: (...args: any[]) => void | Promise<void>): this;
    emit(event: string | Event, inits?: {
        bubbles?: boolean;
        cancelable?: boolean;
        composed?: boolean;
        [key: string]: any;
    }): boolean;
}
interface FunctionConstructor {
    sequential<ReturnType = any, ArgTypes extends any[] = any[]>(func_list: ((...args: any[]) => any)[], is_async?: boolean, spread_args?: boolean): (...args: ArgTypes) => ReturnType;
}
interface ObjectConstructor {
    merge(target: {
        [key: string]: any;
    }, ...sources: {
        [key: string]: any;
    }[]): {
        [key: string]: any;
    };
    typeOf(data: any): string;
}
interface PromiseConstructor {
    create<Type = any>(): Promise<Type> & {
        resolve: (result: any) => void;
        reject: (error: any) => void;
        promise: Promise<Type>;
    };
    wait<ReturnTypes extends any[] = any[]>(): ReturnTypes;
    chain<Type = any>(func: (...args: any[]) => any): Promise<Type>;
}
interface StringConstructor {
    encodeRegExpString(input_str: string): string;
    from(content: Uint8Array | ArrayBuffer | string): string;
}
interface String {
    charCount: number;
    upperCase: string;
    localeUpperCase: string;
    lowerCase: string;
    localeLowerCase: string;
    camelCase: string;
    toCamelCase(): string;
    pull(token_separator?: string, from_begin?: boolean): [string | undefined, string | undefined];
    cutin(start: number, deleteCount: number, ...items: any[]): string;
}
declare namespace setTimeout {
    function idle(milli: number): Promise<void>;
    function create(): (...args: any[]) => void & {
        clear: () => void;
    };
}
declare namespace setInterval {
    function create(): (...args: any[]) => void & {
        clear: () => void;
    };
}