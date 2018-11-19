import { Game } from './game';
import { General } from './general';

export namespace Grade {
    export const stageDurationModifier: number = 10;
    export const timerModifier: number = 12;

    export const decrementIntervalBases: number[] = [
        419,
        379,
        337,
        293,
        257
    ];

    export enum LetterGrade {
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

    const modifiers: string[] = ['+', '', '-'];

    export const letterGrades: string[] = ['A', 'B', 'C', 'D'].map(g => modifiers.map(m => g + m))
                                                              .reduce((a, b) => a.concat(b))
                                                              .concat('F');

    export class State {
        readonly timer: General.Timer;
        milliseconds: number;

        constructor(timerCallback: (milliseconds: number) => void) {
            this.milliseconds = 0;
            this.timer = new General.Timer(timerCallback);
        };
    };
    
    export interface IProps {
        letterGrade: number;
        stage: number;
        difficulty: Game.Difficulty;
        mode: Game.Mode;
        readonly onUpdate: (updates: Game.IUpdate) => void;
    };
};