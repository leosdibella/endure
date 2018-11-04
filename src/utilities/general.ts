export namespace General {
    function formatDatePart(datePart: number) : string {
        return (datePart > 10 ? String(datePart) : ('0' + datePart));
    };

    export const millisecondsPerSecond: number = 1000;

    export interface Dictionary<T> {
        [id: string]: T;
    };

    export interface CssStyle {
        top?: string,
        left?: string,
        height?: string,
        width?: string,
        borderRadius?: string
    };

    export interface TimerDependencies {
        decrementInterval: number;
        totalDuration: number;
    };

    export enum DomEvent {
        resize = 'resize',
        orientationChange = 'orientationchange',
        keyDown = 'keydown',
        click = 'click'
    };

    export enum LocalStorageKey {
        view = 'ENDURE_VIEW',
        highScores = 'ENDURE_HIGH_SCORES',
        difficulty = 'ENDURE_DIFFICULTY',
        playerName = 'ENDURE_PLAYER_NAME'
    };

    export function isWellDefinedValue(value: any) : boolean {
        return value !== null && value !== undefined;
    };

    export function isLocalStorageSupported() : boolean {
        return typeof(Storage) !== 'undefined' && isWellDefinedValue(window.localStorage);
    };

    export function or<T>(first: T, second: T) : T {
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
            array.push(value);
        }

        return array;
    };
    
    export class Timer {
        private paused: boolean = true;
        private decrementInterval: number;
        private milliseconds: number = 0;
        private totalDuration: number;
        private interval: NodeJS.Timeout;
        private callback: (milliseconds: number) => void;
    
        constructor(callback: (milliseconds: number) => void) {
            this.callback = callback;
        };
    
        private readonly decrement = () : void => {
            if (!this.paused) {
                this.milliseconds -= this.decrementInterval;
    
                if (this.milliseconds <= 0) {
                    this.disable();
                }
    
                this.callback(this.milliseconds);
            }
        };
    
        initialize(decrementInterval: number, totalDuation: number) : void {
            this.disable();
            this.decrementInterval = decrementInterval;
            this.totalDuration = totalDuation;
            this.milliseconds = this.totalDuration;
            this.paused = false;
            this.interval = setInterval(this.decrement, this.decrementInterval);
        };
    
        disable() : void {
            this.milliseconds = 0;
            this.paused = true;
    
            if (isWellDefinedValue(this.interval)) {
                clearInterval(this.interval);
                this.interval = undefined;
            }
        };
    
        togglePaused(isPaused: boolean) : void {
            this.paused = isPaused;
        };
    };
};