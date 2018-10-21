export namespace Utilities {
    export function isWellDefinedValue(value: any) : boolean {
        return value !== null && value !== undefined;
    };

    export function isGameInProgress(gameMode: GameMode): boolean {
        return gameMode === GameMode.inGame || gameMode === GameMode.paused;
    };

    export function isLocalStorageSupported() : boolean {
        return typeof(Storage) !== 'undefined' && Utilities.isWellDefinedValue(window.localStorage);
    };

    export namespace Constants {
        export const topBarHeight: number = 100;
        export const lineHeight: number = 25;
        export const sideBarWidth: number = 75;
        export const numberOfTilesHigh: number = 21;
        export const numberOfTilesWide: number = 11;
        export const tileDimension: number = 60;
        export const totalGridHeight: number =  numberOfTilesHigh * tileDimension;
        export const totalGridWidth: number = numberOfTilesWide * tileDimension;
    };

    export function getDateStamp(date: Date) : string {
        return date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear();
    };

    export function or<T>(first: T, second: T) : T {
        return isWellDefinedValue(first) ? first : second;
    };

    export function isValidPlayerName(playerName: string) : boolean {
        return Utilities.isWellDefinedValue(playerName) && playerName.trim() !== '';
    };

    export const defaultPlayerName = 'Anonymous';

    export enum DomEvent {
        resize = 'resize',
        orientationChange = 'orientationchange',
        keyDown = 'keydown',
        click = 'click'
    };

    export enum ViewMode {
        dark = 'dark-mode',
        light = 'light-mode'
    };

    export enum GameMode {
        newGame = 0,
        specifyName,
        selectDifficulty,
        inGame,
        gameOver,
        paused,
        quitConfirmation,
        highScores,
        setViewMode
    };

    export enum DifficultyMode {
        beginnger = 0,
        low,
        medium,
        hard,
        expert
    };

    export enum LocalStorageKeys {
        viewMode = 'ENDURE_VIEW_MODE',
        highScores = 'ENDURE_HIGH_SCORES',
        difficultyMode = 'ENDURE_DIFFICULTY_MODE',
        playerName = 'ENDURE_PLAYER_NAME'
    };

    export interface HighScore {
        name: string;
        value: number;
        date: string
    };

    export enum Color {
        red = 'red',
        green = 'green',
        blue = 'blue',
        violet = 'violet',
        yellow = 'yellow',
        orange = 'orange'
    };
};