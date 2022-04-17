export { parseFromJson, serializeToJson } from './jsonGraphState';
export { default as formatMarkCount } from './formatText';

declare global {
    interface Array<T> {
        first(): T | undefined;
        first(arg: T):  T | undefined;
        second(): T | undefined;
        penultimate(): T | undefined;
        last(): T | undefined;
        last(arg: T):  T | undefined;

        firstAndLast() : [T, T] | undefined;
        exceptFirstAndLast() : T[] | undefined;
    }
}

if (!Array.prototype.first) {    

    Array.prototype.first = function (arg = undefined) {
        if (arg) {
            this[0] = arg;
        }
        return this.length ? this[0] : undefined;
    };
}

if (!Array.prototype.second) {    
    Array.prototype.second = function () {
        return this.length > 1 ? this[1] : undefined;
    };
}

if (!Array.prototype.penultimate) {    
    Array.prototype.penultimate = function () {
        return this.length > 1 ? this[this.length - 2] : undefined;
    };
}

if (!Array.prototype.last) {
    Array.prototype.last = function (arg = undefined) {
        if (arg) {
            this[this.length - 1] = arg;
        }
        return this.length ? this[this.length - 1] : undefined;
    };
}

if (!Array.prototype.firstAndLast) {    
    Array.prototype.firstAndLast = function () {
        return this.length > 1 ? (this[0], this[this.length - 1]) : undefined;
    };
}

if (!Array.prototype.exceptFirstAndLast) {    
    Array.prototype.exceptFirstAndLast = function () {
        return this.length > 1 ? (this as Array<object>).slice(1, this.length - 1) : undefined;
    };
}
