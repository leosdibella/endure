import * as Animation from './animation';
import * as AppUtilities from './app';
import * as GameUtilities from './game';
import * as GeneralUtilities from './general';

enum CssClass {
    healthy = 0,
    warning,
    danger
}

class State {
    public static readonly minimumViableCombo: number = 2;

    public static readonly durationModifiers: GeneralUtilities.IDictionary<number> = {
        [AppUtilities.Difficulty.beginner]: 10,
        [AppUtilities.Difficulty.low]: 15,
        [AppUtilities.Difficulty.medium]: 20,
        [AppUtilities.Difficulty.hard]: 25,
        [AppUtilities.Difficulty.expert]: 30
    };

    public static readonly durations: GeneralUtilities.IDictionary<number> = {
        [AppUtilities.Difficulty.beginner]: 3000,
        [AppUtilities.Difficulty.low]: 2800,
        [AppUtilities.Difficulty.medium]: 2600,
        [AppUtilities.Difficulty.hard]: 2400,
        [AppUtilities.Difficulty.expert]: 2200
    };

    public static getClassFromTimeFraction(timeFraction: number): string {
        let cssClass: string = '';

        if (timeFraction >= 0.67) {
            cssClass = CssClass[CssClass.healthy];
        } else if (timeFraction >= 0.33) {
            cssClass = CssClass[CssClass.warning];
        } else {
            cssClass = CssClass[CssClass.danger];
        }

        return `combo-${cssClass}`;
    }

    public readonly animator: Animation.Animator;
    public overlayWidthPercentage: number;
    public overlayClass: string;

    public constructor(draw: (timeFraction: number) => void, duration: number, callback: () => void) {
        this.animator = new Animation.Animator(draw, duration, Animation.Timing.linear, callback);
        this.overlayWidthPercentage = 0;
        this.overlayClass = '';
    }
}

interface IProps {
    theme: AppUtilities.Theme;
    combo: number;
    letterGrade: AppUtilities.LetterGrade;
    stage: number;
    difficulty: AppUtilities.Difficulty;
    mode: GameUtilities.Mode;
    readonly onUpdate: (updates: GameUtilities.IUpdate) => void;
}

export {
    IProps,
    State
};