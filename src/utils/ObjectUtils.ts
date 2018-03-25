﻿export class ObjectUtils {
    private constructor() {
    }

    static assign<T, U>(a: T, b: U): T & U;
    static assign<T, U, V>(a: T, b: U, c: V): T & U & V;
    static assign<T, U, V>(a: T, b: U, c?: V) {
        if (Object.assign != null) {
            if (c == null)
                return Object.assign<T, U>(a, b);
            else
                return Object.assign<T, U, V>(a, b, c);
        }
        if (c == null)
            return this.es5Assign(a, b);
        else
            return this.es5Assign(a, b, c);
    }

    static es5Assign<T, U>(a: T, b: U): T & U;
    static es5Assign<T, U, V>(a: T, b: U, c: V): T & U & V;
    static es5Assign<T, U, V>(a: T, b: U, c?: V) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
        const to = Object(a);

        for (let index = 1; index < arguments.length; index++) {
            const nextSource = arguments[index];
            if (nextSource == null)
                continue;

            for (const nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey))
                    to[nextKey] = nextSource[nextKey];
            }
        }

        return to;
    }
}
