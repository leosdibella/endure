import * as Animation from './animation';
import * as GameUtilities from './game';
import * as Shared from './shared';

class State {
    public static readonly letterGrades: string[] = ['A', 'B', 'C', 'D'].map(g => ['+', '', '-'].map(m => `${g}${m}`))
                                                                        .reduce((a, b) => a.concat(b))
                                                                        .concat('F');

    public static readonly durations: Shared.IDictionary<number> = {
        [Shared.Difficulty.beginner]: 5000,
        [Shared.Difficulty.low]: 4500,
        [Shared.Difficulty.medium]: 4000,
        [Shared.Difficulty.hard]: 3500,
        [Shared.Difficulty.expert]: 3000
    };

    public static readonly durationModifiers: Shared.IDictionary<number> = {
        [Shared.Difficulty.beginner]: 10,
        [Shared.Difficulty.low]: 15,
        [Shared.Difficulty.medium]: 20,
        [Shared.Difficulty.hard]: 25,
        [Shared.Difficulty.expert]: 30
    };

    public readonly animator: Animation.Animator;
    public fillRadiusPercentage: string;

    public constructor(draw: (timeFraction: number) => void, duration: number, onComplete: () => void) {
        this.animator = new Animation.Animator(draw, duration, Animation.Timing.linear, onComplete);
        this.fillRadiusPercentage = '0%';
    }
}

interface IProps {
    theme: Shared.Theme;
    letterGrade: number;
    stage: number;
    difficulty: Shared.Difficulty;
    mode: GameUtilities.Mode;
    onUpdate(updates: GameUtilities.IUpdate): void;
}

export {
    State,
    IProps
};