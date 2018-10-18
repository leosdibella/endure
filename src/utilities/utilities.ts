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

    export enum DomEvent {
        resize = 'resize',
        orientationChange = 'orientationchange',
        keyPress = 'keypress'
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
        quitConfirmation
    };

    export enum DifficultyMode {
        easy = 0,
        medium,
        hard,
        expert
    };
};