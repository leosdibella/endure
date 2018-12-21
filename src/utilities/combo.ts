import * as Animation from './animation';
import * as GameUtilities from './game';
import * as Shared from './shared';

enum CssClass {
    healthy = 0,
    warning,
    danger
}

class State {
    private static readonly healthyThreshold: number = 0.67;
    private static readonly warningThreshold: number = 0.33;

    public static readonly minimumViableCombo: number = 2;

    public static readonly durationModifiers: Shared.IDictionary<number> = {
        [Shared.Difficulty.beginner]: 10,
        [Shared.Difficulty.low]: 15,
        [Shared.Difficulty.medium]: 20,
        [Shared.Difficulty.hard]: 25,
        [Shared.Difficulty.expert]: 30
    };

    public static readonly durations: Shared.IDictionary<number> = {
        [Shared.Difficulty.beginner]: 3000,
        [Shared.Difficulty.low]: 2800,
        [Shared.Difficulty.medium]: 2600,
        [Shared.Difficulty.hard]: 2400,
        [Shared.Difficulty.expert]: 2200
    };

    public static getClassFromTimeFraction(timeFraction: number): string {
        let cssClass: string = '';

        if (timeFraction >= State.healthyThreshold) {
            cssClass = CssClass[CssClass.healthy];
        } else if (timeFraction >= State.warningThreshold) {
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
    theme: Shared.Theme;
    combo: number;
    letterGrade: Shared.LetterGrade;
    stage: number;
    difficulty: Shared.Difficulty;
    mode: GameUtilities.Mode;
    onUpdate(updates: GameUtilities.IUpdate): void;
}

export {
    IProps,
    State
};