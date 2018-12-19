import * as Animation from './animation';
import * as AppUtilities from './app';
import * as GameUtilities from './game';
import * as GeneralUtilities from './general';

class State {
    public static readonly letterGrades: string[] = ['A', 'B', 'C', 'D'].map(g => ['+', '', '-'].map(m => `${g}${m}`))
                                                                        .reduce((a, b) => a.concat(b))
                                                                        .concat('F');

    public static readonly durations: GeneralUtilities.IDictionary<number> = {
        [AppUtilities.Difficulty.beginner]: 5000,
        [AppUtilities.Difficulty.low]: 4500,
        [AppUtilities.Difficulty.medium]: 4000,
        [AppUtilities.Difficulty.hard]: 3500,
        [AppUtilities.Difficulty.expert]: 3000
    };

    public static readonly durationModifiers: GeneralUtilities.IDictionary<number> = {
        [AppUtilities.Difficulty.beginner]: 10,
        [AppUtilities.Difficulty.low]: 15,
        [AppUtilities.Difficulty.medium]: 20,
        [AppUtilities.Difficulty.hard]: 25,
        [AppUtilities.Difficulty.expert]: 30
    };

    public readonly animator: Animation.Animator;
    public fillRadiusPercentage: string;

    public constructor(draw: (timeFraction: number) => void, duration: number, onComplete: () => void) {
        this.animator = new Animation.Animator(draw, duration, Animation.Timing.linear, onComplete);
        this.fillRadiusPercentage = '0%';
    }
}

interface IProps {
    theme: AppUtilities.Theme;
    letterGrade: number;
    stage: number;
    difficulty: AppUtilities.Difficulty;
    mode: GameUtilities.Mode;
    readonly onUpdate: (updates: GameUtilities.IUpdate) => void;
}

export {
    State,
    IProps
};