enum DomEvent {
    resize = 'resize',
    orientationChange = 'orientationchange',
    keyDown = 'keydown',
    click = 'click'
}

function formatDatePart(datePart: number): string {
    const prefix: string = datePart > 10 ? '' : '0';
    return `${prefix}${datePart}`;
}

interface IDictionary<T> {
    [id: string]: T;
}

interface ICssStyle {
    top?: string;
    left?: string;
    height?: string;
    width?: string;
    borderRadius?: string;
    color?: string;
    backgroundColor?: string;
}

function isDefined(value: any): boolean {
    return value !== undefined;
}

function isNotNull(value: any): boolean {
    return value !== null;
}

function isObject(value: any): boolean {
    return typeof(value) === 'object' && isNotNull(value) && !Array.isArray(value);
}

function isString(value: any): boolean {
    return typeof(value) === 'string';
}

function isInteger(value: any): boolean {
    return typeof(value) === 'number' && isFinite(value) && Math.floor(value) === value;
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

// Note the reverse lookup generates properties for "0", "1" etc at runtime which while helpful also breaks the purity of the enum.
function getNumericEnumKeys(collection: any): string[] {
    return isObject(collection) ? Object.keys(collection).filter(k => isInteger(parseInt(k, 10))) : [];
}

export {
    DomEvent,
    IDictionary,
    ICssStyle,
    isDefined,
    isNotNull,
    isObject,
    isString,
    isInteger,
    getDateStamp,
    formatCamelCaseString,
    iterate,
    fillArray,
    getNumericEnumKeys
};