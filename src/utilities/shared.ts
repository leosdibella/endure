function formatDatePart(datePart: number): string {
    const prefix: string = datePart > decimalBase ? '' : '0';

    return `${prefix}${datePart}`;
}

enum Difficulty {
    beginner = 0,
    low,
    medium,
    hard,
    expert
}

enum Theme {
    dark = 0,
    light
}

enum Orientation {
    portrait = 0,
    landscape
}

enum LetterGrade {
    aPlus = 0,
    a,
    aMinus,
    bPlus,
    b,
    bMinus,
    cPlus,
    c,
    cMinus,
    dPlus,
    d,
    dMinus,
    f
}

class HighScore {
    public constructor(public readonly name: string,
                       public readonly value: number,
                       public readonly dateStamp: string,
                       public readonly difficulty: Difficulty) {
    }
}

enum DomEvent {
    resize = 'resize',
    orientationChange = 'orientationchange',
    keyDown = 'keydown',
    click = 'click'
}

const totalPercentage: number = 100;
const percentageDecimalPlaceCutoff: number = 2;
const decimalBase: number = 10;

interface IDictionary<T> {
    [id: string]: T;
}

interface IEnum {
    [id: number]: string;
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
function getNumericEnumKeys(collection: IEnum): string[] {
    return isObject(collection) ? Object.keys(collection).filter(k => isInteger(parseInt(k, decimalBase))) : [];
}

export {
    Difficulty,
    Theme,
    Orientation,
    LetterGrade,
    HighScore,
    DomEvent,
    totalPercentage,
    percentageDecimalPlaceCutoff,
    decimalBase,
    IDictionary,
    IEnum,
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