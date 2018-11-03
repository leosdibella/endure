import { App } from './app';
import { General } from './general';

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

    export interface Updates {
        points?: number;
        mode?: Mode;
        difficulty?: Difficulty;
        view?: App.View;
        playerName?: string;
        dropCombo?: boolean;
        gradeIndex?: number;
    };

    export enum Grade {
        aPlus = 'A+',
        a = 'A',
        aMinus = 'A-',
        bPlus = 'B+',
        b = 'B',
        bMinus = 'B-',
        cPlus = 'C+',
        c = 'C',
        cMinus = 'C-',
        dPlus = 'D+',
        d = 'D',
        dMinus = 'D-',
        f = 'F'
    };

    export enum GradeIndex {
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
    };

    export const grades: Grade[] = [
        Grade.aPlus,
        Grade.a,
        Grade.aMinus,
        Grade.bPlus,
        Grade.b,
        Grade.bMinus,
        Grade.cPlus,
        Grade.c,
        Grade.cMinus,
        Grade.dPlus,
        Grade.d,
        Grade.dMinus,
        Grade.f
    ];

    export function isValidPlayerName(playerName: string) : boolean {
        return General.isWellDefinedValue(playerName) && playerName.trim() !== '';
    };

    export function isInProgress(gameMdode: Mode) : boolean {
        return gameMdode === Mode.inGame || gameMdode === Mode.paused;
    };
};