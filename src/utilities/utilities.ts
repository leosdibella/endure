export namespace Utilities {
    export function isWellDefinedValue(value: any) : boolean {
        return value !== null && value !== undefined;
    };

    export function isGameInProgress(gameMode: GameMode): boolean {
        return gameMode === GameMode.inGame || gameMode === GameMode.paused;
    };

    export namespace Constants {
        export const topBarHeight: number = 100;
        export const lineHeight: number = 25;
        export const sideBarWidth: number = 75;
    };

    export function or<T>(first: T, second: T) : T {
        return isWellDefinedValue(first) ? first : second;
    };

    export enum DomEvent {
        resize = 'resize',
        orientationChange = 'orientationchange',
        keyDown = 'keydown'
    };

    export enum ViewMode {
        dark = 'dark-mode',
        light = 'light-mode'
    };

    export enum GameMode {
        newGame = 0,
        selectDifficulty,
        inGame,
        gameOver,
        paused,
        quitConfirmation,
        viewHighScores
    };

    export enum DifficultyMode {
        low = 0,
        medium,
        hard,
        expert
    };

    export enum LocalStorageKeys {
        viewMode = 'ENDURE_VIEW_MODE',
        highScores = 'ENDURE_HIGH_SCORES',
        difficultyMode = 'ENDURE_DIFFICULTY_MODE'
    };

    export interface Score {
        name: string;
        value: number;
    };
};