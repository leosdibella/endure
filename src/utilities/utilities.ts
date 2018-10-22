export namespace Utilities {
    export namespace General {
        export interface CssStyle {
            top?: string;
            left?: string;
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

        function formatDatePart(datePart: number) : string {
            return (datePart > 10 ? String(datePart) : ('0' + datePart));
        };

        export function getDateStamp(date: Date) : string {
            if (isWellDefinedValue(date)) {
                return formatDatePart(date.getMonth() + 1) + '/' + formatDatePart(date.getDate()) + '/' + formatDatePart(date.getFullYear());
            }

            return undefined;
        };
    };

    export namespace Game {
        export const defaultPlayerName = 'Anonymous';

        export enum Mode {
            newGame = 0,
            specifyName,
            selectDifficulty,
            inGame,
            gameOver,
            paused,
            quitConfirmation,
            highScores,
            setView
        };
    
        export enum Difficulty {
            beginnger = 0,
            low,
            medium,
            hard,
            expert
        };
    
        export interface HighScore {
            name: string;
            value: number;
            date: string
        };

        export function isValidPlayerName(playerName: string) : boolean {
            return General.isWellDefinedValue(playerName) && playerName.trim() !== '';
        };

        export function isInProgress(gameMdode: Mode) : boolean {
            return gameMdode === Mode.inGame || gameMdode === Mode.paused;
        };
    };

    export namespace Overlay {
        export interface Menu {
            title: string;
            className: string;
            defaultOptionsIndex?: number;
            options: string[]
        };

        export const menus: Utilities.Overlay.Menu[] = [{
            title: 'Endure',
            className: 'new-game',
            defaultOptionsIndex: 0,
            options: ['New Game', 'Set Name', 'Difficulty', 'High Scores', 'Settings']
        }, {
            title: 'Name?',
            className: 'player-name',
            defaultOptionsIndex: 0,
            options: ['Remember it!', 'Forget it.']
        }, {
            title: 'Grade Level',
            className: 'select-difficulty',
            options: ['[ Pre-K ] I made poop.',  '[ K - 5 ] No I don\'t wanna!', '[ 6 - 8 ] Remove the training wheels!', '[ 9 - 12 ] Test me sensei!', '[ 12+ ] I know kung fu.']
        },
        undefined,
        {
            title: 'Game Over',
            className: 'game-over',
            defaultOptionsIndex: 0,
            options: ['Put me in coach!', 'I Quit.']
        }, {
            title: 'Timeout',
            className: 'paused',
            defaultOptionsIndex: 0,
            options: ['Put me in coach!', 'I Quit.']
        }, {
            title: 'Quit?',
            className: 'quit-confirmation',
            defaultOptionsIndex: 1,
            options: ['Yep', 'Nope']
        }, {
            title: 'Honor Roll',
            className: 'high-scores',
            defaultOptionsIndex: 0,
            options: ['Leave']
        }, {
            title: 'Lights On?',
            className: 'view-mode',
            options: ['Yep', 'Nope']
        }];
    };

    export namespace Grid {
        export const numberOfTilesHigh: number = 21;
        export const numberOfTilesWide: number = 11;
        export const tileDimension: number = 60;

        export enum Color {
            red = 'red',
            green = 'green',
            blue = 'blue',
            violet = 'violet',
            yellow = 'yellow',
            orange = 'orange'
        };
    };

    export namespace App {
        export enum View {
            dark = 'dark',
            light = 'light'
        };
    };

    export namespace Backdrop {
        export const topMarginHeight: number = 100;
        export const sideMarginWidth: number = 75;
        export const lineHeight: number = 25;
        export const numberOfBinderHoles: number = 3;
    };
};