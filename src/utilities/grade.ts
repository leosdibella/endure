import { Animate } from './animate';
import { Game } from './game';
import { General } from './general';

export namespace Grade {
    export const durationModifiers: General.IDictionary<number> = {
        [Game.Difficulty.beginnger]: 10,
        [Game.Difficulty.low]: 15,
        [Game.Difficulty.medium]: 20,
        [Game.Difficulty.hard]: 25,
        [Game.Difficulty.expert]: 30
    };

    export const durations: General.IDictionary<number> = {
        [Game.Difficulty.beginnger]: 5000,
        [Game.Difficulty.low]: 4500,
        [Game.Difficulty.medium]: 4000,
        [Game.Difficulty.hard]: 3500,
        [Game.Difficulty.expert]: 3000
    };

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
        readonly animation: Animate.Animation;

        constructor(draw: (timeFraction: number) => void, duration: number, callback: () => void) {
            this.animation = new Animate.Animation(draw, duration, Animate.Timing.linear, callback);
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