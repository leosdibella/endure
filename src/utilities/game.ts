import { App } from './app';
import { General } from './general';

export namespace Game {
    export const defaultPlayerName: string = 'Anonymous';
    export const numberOfHighScoresToPersist: number = 10;

    export enum Mode {
        newGame = 0,
        specifyName,
        selectDifficulty,
        inGame,
        gameOver,
        paused,
        quitConfirmation,
        highScores,
        setTheme
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

    export interface Updates {
        points?: number;
        mode?: Mode;
        difficulty?: Difficulty;
        theme?: App.Theme;
        playerName?: string;
        dropCombo?: boolean;
        gradeIndex?: number;
    };

    export function isValidPlayerName(playerName: string) : boolean {
        return General.isWellDefinedValue(playerName) && playerName.trim() !== '';
    };

    export function isInProgress(gameMdode: Mode) : boolean {
        return gameMdode === Mode.inGame || gameMdode === Mode.paused;
    };
};