import { IDictionary } from '../interfaces/iDictionary';
import { Difficulty} from '../utilities/enum';
import { Animator } from './animator';

export class ComboState {
    private static readonly cssClassThresholdModifier: number = 3;
    public static readonly minimumViableCombo: number = 2;

    public static readonly durationModifiers: IDictionary<number> = {
        [Difficulty.beginner]: 10,
        [Difficulty.low]: 15,
        [Difficulty.medium]: 20,
        [Difficulty.hard]: 25,
        [Difficulty.expert]: 30
    };

    public static readonly durations: IDictionary<number> = {
        [Difficulty.beginner]: 3000,
        [Difficulty.low]: 2800,
        [Difficulty.medium]: 2600,
        [Difficulty.hard]: 2400,
        [Difficulty.expert]: 2200
    };

    public static getClassFromTimeFraction(timeFraction: number): string {
        return `combo-${Math.ceil(timeFraction * ComboState.cssClassThresholdModifier)}`;
    }

    public animator?: Animator;

    public constructor(public overlayWidthPercentage: number = 0, public overlayClass: string = '') {
    }
}