export namespace General {
    export enum DomEvent {
        resize = 'resize',
        orientationChange = 'orientationchange',
        keyDown = 'keydown',
        click = 'click'
    }

    function formatDatePart(datePart: number): string {
        return (datePart > 10 ? String(datePart) : ('0' + datePart));
    }

    export interface IDictionary<T> {
        [id: string]: T;
    }

    export interface ICssStyle {
        top?: string;
        left?: string;
        height?: string;
        width?: string;
        borderRadius?: string;
        color?: string;
        backgroundColor?: string;
    }

    export function isDefined(value: any): boolean {
        return value !== undefined;
    }

    export function isFunction(value: any): boolean {
        return typeof(value) === 'function';
    }

    export function isObject(value: any): boolean {
        return typeof(value) === 'object' && value !== null;
    }

    export function isString(value: any): boolean {
        return typeof(value) === 'string';
    }

    export function isInteger(value: any): boolean {
        return typeof(value) === 'number' && isFinite(value) && Math.floor(value) === value;
    }

    export function getDateStamp(date: Date): string {
        return formatDatePart(date.getMonth() + 1) + '/' + formatDatePart(date.getDate()) + '/' + formatDatePart(date.getFullYear());
    }

    export function camelCaseToKebabCase(camelCase: string): string {
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
    }

    export function iterate(length: number, f: (index: number) => void) {
        for (let i: number = 0; i < length; ++i) {
            f(i);
        }
    }

    export function fillArray<T>(length: number, f: (index: number) => T, backwards?: boolean): T[] {
        const array: T[] = [],
              inReverse: boolean = !!backwards;

        for (let i: number = 0; i < length; ++i) {
            array.push(f(inReverse ? length - 1 - i : i));
        }

        return array;
    }

    export function forEach<T>(array: T[], f: (t: T, index: number, array: T[]) => void): void {
        for (let i: number = 0; i < array.length; ++i) {
            f(array[i], i, array);
        }
    }

    // Note the reverse lookup generates properties for "0", "1" etc at runtime which while helpful also breaks the purity of the enum.
    export function getEnumKeys(collection: any) {
        return Object.keys(collection).filter(k => isInteger(k));
    }
}