import { Animation } from './animation';
import { App } from './app';
import { Game } from './game';
import { General } from './general';

export namespace Grade {
    export const durationModifiers: General.IDictionary<number> = {
        [App.Difficulty.beginner]: 10,
        [App.Difficulty.low]: 15,
        [App.Difficulty.medium]: 20,
        [App.Difficulty.hard]: 25,
        [App.Difficulty.expert]: 30
    };

    export const durations: General.IDictionary<number> = {
        [App.Difficulty.beginner]: 5000,
        [App.Difficulty.low]: 4500,
        [App.Difficulty.medium]: 4000,
        [App.Difficulty.hard]: 3500,
        [App.Difficulty.expert]: 3000
    };

    const modifiers: string[] = ['+', '', '-'];

    export const letterGrades: string[] = ['A', 'B', 'C', 'D'].map(g => modifiers.map(m => g + m))
                                                              .reduce((a, b) => a.concat(b))
                                                              .concat('F');

    export class State {
        readonly animator: Animation.Animator;
        fillRadiusPercentage: string;

        constructor(draw: (timeFraction: number) => void, duration: number, onComplete: () => void) {
            this.animator = new Animation.Animator(draw, duration, Animation.Timing.linear, onComplete);
            this.fillRadiusPercentage = '0%';
        }
    }

    export interface IProps {
        theme: App.Theme;
        letterGrade: number;
        stage: number;
        difficulty: App.Difficulty;
        mode: Game.Mode;
        readonly onUpdate: (updates: Game.IUpdate) => void;
    }
}