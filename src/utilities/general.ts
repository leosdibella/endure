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

    export function isLocalStorageSupported() : boolean {
        return typeof(Storage) !== 'undefined' && isWellDefinedValue(window.localStorage);
    };

    export function castSafeOr<T>(first: T, second: T) : T {
        return isWellDefinedValue(first) ? first : second;
    };

    export function getDateStamp(date: Date) : string {
        if (isWellDefinedValue(date)) {
            return formatDatePart(date.getMonth() + 1) + '/' + formatDatePart(date.getDate()) + '/' + formatDatePart(date.getFullYear());
        }

        return undefined;
    };

    export function camelCaseToKebabCase(camelCase: string) : string {
        let i: number,
            lowerCase: string,
            snakeCase: string = '';

        if (isWellDefinedValue(camelCase) && camelCase.length > 0) {
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

    export function fillArray<T>(value: T, length: number) : T[] {
        const array: T[] = [];

        for (let i = 0; i < length; ++i) {
            array.push(Array.isArray(value) && value.length === 0 ? <T><unknown>[]: value);
        }

        return array;
    };
};