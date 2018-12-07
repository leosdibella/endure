export namespace General {
    export enum DomEvent {
        resize = 'resize',
        orientationChange = 'orientationchange',
        keyDown = 'keydown',
        click = 'click'
    };
    
    function formatDatePart(datePart: number) : string {
        return (datePart > 10 ? String(datePart) : ('0' + datePart));
    };

    export interface IDictionary<T> {
        [id: string]: T;
    };

    export interface ICssStyle {
        top?: string;
        left?: string;
        height?: string;
        width?: string;
        borderRadius?: string;
        color?: string;
        backgroundColor?: string;
    };

    export interface TimerDependencies {
        decrementInterval: number;
        totalDuration: number;
    };

    export function isWellDefinedValue(value: any) : boolean {
        return value !== null && value !== undefined;
    };

    export function isFunction(value: any) : boolean {
        return typeof(value) === 'function';
    };

    export function isObject(value: any) : boolean {
        return typeof(value) === 'object' && value !== null;
    };

    export function isString(value: any) : boolean {
        return typeof(value) === 'string';
    };

    export function isNumber(value: any) : boolean {
        return typeof(value) === 'number';
    };

    export function isFiniteNumber(value: any) : boolean {
        return isNumber(value) && isFinite(value);
    };

    export function isInteger(value: any) : boolean {
        return isFiniteNumber(value) && Math.floor(value) === value;
    };

    export function getDateStamp(date: Date) : string {
        return formatDatePart(date.getMonth() + 1) + '/' + formatDatePart(date.getDate()) + '/' + formatDatePart(date.getFullYear());
    };

    export function camelCaseToKebabCase(camelCase: string) : string {
        let i: number,
            lowerCase: string,
            snakeCase: string = '';

        if (camelCase.length > 0) {
            for (i = 0; i < camelCase.length; ++i) {
                lowerCase = camelCase[i].toLowerCase();

                if (lowerCase === camelCase[i]) {
                    snakeCase += lowerCase;
                } else {
                    snakeCase += '-' + lowerCase;
                }
            }
        }

        return snakeCase;
    };

    export function fillArray<T>(length: number, f: (index: number) => T) : T[] {
        const array: T[] = [];

        for (let i: number = 0; i < length; ++i) {
            array.push(f(i));
        }

        return array;
    };
};