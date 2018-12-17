import * as Animation from './animation';
import * as App from './app';
import * as Game from './game';
import * as General from './general';

const durationModifiers: General.IDictionary<number> = {
    [App.Difficulty.beginner]: 10,
    [App.Difficulty.low]: 15,
    [App.Difficulty.medium]: 20,
    [App.Difficulty.hard]: 25,
    [App.Difficulty.expert]: 30
};

const durations: General.IDictionary<number> = {
    [App.Difficulty.beginner]: 5000,
    [App.Difficulty.low]: 4500,
    [App.Difficulty.medium]: 4000,
    [App.Difficulty.hard]: 3500,
    [App.Difficulty.expert]: 3000
};

const modifiers: string[] = ['+', '', '-'];

const letterGrades: string[] = ['A', 'B', 'C', 'D'].map(g => modifiers.map(m => g + m))
                                                   .reduce((a, b) => a.concat(b))
                                                   .concat('F');

class State {
    public readonly animator: Animation.Animator;
    public fillRadiusPercentage: string;

    public constructor(draw: (timeFraction: number) => void, duration: number, onComplete: () => void) {
        this.animator = new Animation.Animator(draw, duration, Animation.Timing.linear, onComplete);
        this.fillRadiusPercentage = '0%';
    }
}

interface IProps {
    theme: App.Theme;
    letterGrade: number;
    stage: number;
    difficulty: App.Difficulty;
    mode: Game.Mode;
    readonly onUpdate: (updates: Game.IUpdate) => void;
}

export {
    durationModifiers,
    durations,
    letterGrades,
    State,
    IProps
};