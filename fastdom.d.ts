// Type definitions for fastdom v1.0.4
// Project: https://github.com/wilsonpage/fastdom
// Definitions by: Martijn Welker <https://github.com/martijnwelker>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace fastdom {
    type CallbackFunction = () => void;

    const reads: CallbackFunction[];
    const writes: CallbackFunction[];
    const scheduled: boolean;
    const raf: (fn: CallbackFunction) => void;

    function measure(fn: CallbackFunction, args?: any): CallbackFunction;

    function mutate(fn: CallbackFunction, args?: any): CallbackFunction;

    function clear(fn: CallbackFunction): boolean;
}

export as namespace fastdom;
export = fastdom;