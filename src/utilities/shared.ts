import { IEnum } from '../interfaces/iEnum';

function formatDatePart(datePart: number): string {
    const prefix: string = datePart > decimalBase ? '' : '0';

    return `${prefix}${datePart}`;
}

const totalPercentage: number = 100;
const percentageDecimalPlaceCutoff: number = 2;
const decimalBase: number = 10;
const dateStampLength: number = 10;

function isDefined<T>(value: T): boolean {
    return value !== undefined;
}

function isNotNull<T>(value: T): boolean {
    return value !== null;
}

function isObject<T>(value: T): boolean {
    return typeof(value) === 'object' && isNotNull(value) && !Array.isArray(value);
}

function isString<T>(value: T): boolean {
    return typeof(value) === 'string';
}

function isInteger<T>(value: T): boolean {
    return typeof(value) === 'number' && isFinite(value) && Math.floor(value) === value;
}

function castSafeOr<T>(a: T | undefined, b: T): T {
    return isDefined(a) ? a as T : b;
}

function getDateStamp(date: Date): string {
    return `${formatDatePart(date.getMonth() + 1)}/${formatDatePart(date.getDate())}/${formatDatePart(date.getFullYear())}`;
}

function formatCamelCaseString(camelCase: string, separator: string = '-', uppercase: boolean = false): string {
    let i: number,
        character: string,
        formattedString: string = '';

    if (camelCase.length > 0) {
        for (i = 0; i < camelCase.length; ++i) {
            character = camelCase[i].toLowerCase();
            formattedString += `${character !== camelCase[i] ? separator : ''}${uppercase ? character.toUpperCase() : character}`;
        }
    }

    return formattedString;
}

function iterate(length: number, f: (index: number) => void) {
    for (let i: number = 0; i < length; ++i) {
        f(i);
    }
}

function fillArray<T>(length: number, f: (index: number) => T, backwards?: boolean): T[] {
    const array: T[] = [],
          inReverse: boolean = !!backwards;

    for (let i: number = 0; i < length; ++i) {
        array.push(f(inReverse ? length - 1 - i : i));
    }

    return array;
}

function getNumericEnumKeys(collection: IEnum): number[] {
    const numericKeys: number[] = [];

    if (isObject(collection)) {
        Object.keys(collection).forEach(k => {
            const int: number = parseInt(k, decimalBase);

            if (isInteger(int)) {
                numericKeys.push(int);
            }
        });
    }

    return numericKeys;
}

export {
    totalPercentage,
    percentageDecimalPlaceCutoff,
    decimalBase,
    dateStampLength,
    isDefined,
    isNotNull,
    isObject,
    isString,
    isInteger,
    castSafeOr,
    getDateStamp,
    formatCamelCaseString,
    iterate,
    fillArray,
    getNumericEnumKeys
};