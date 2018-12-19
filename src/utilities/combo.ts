import * as Animation from './animation';
import * as App from './app';
import * as Game from './game';
import * as General from './general';

enum CssClass {
    healthy = 0,
    warning,
    danger
}

class State {
    public static readonly minimumViableCombo: number = 2;

    public static readonly durationModifiers: General.IDictionary<number> = {
        [App.Difficulty.beginner]: 10,
        [App.Difficulty.low]: 15,
        [App.Difficulty.medium]: 20,
        [App.Difficulty.hard]: 25,
        [App.Difficulty.expert]: 30
    };

    public static readonly durations: General.IDictionary<number> = {
        [App.Difficulty.beginner]: 3000,
        [App.Difficulty.low]: 2800,
        [App.Difficulty.medium]: 2600,
        [App.Difficulty.hard]: 2400,
        [App.Difficulty.expert]: 2200
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
    theme: App.Theme;
    combo: number;
    letterGrade: App.LetterGrade;
    stage: number;
    difficulty: App.Difficulty;
    mode: Game.Mode;
    readonly onUpdate: (updates: Game.IUpdate) => void;
}

export {
    IProps,
    State
};