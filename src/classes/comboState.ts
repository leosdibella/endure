import { IDictionary } from '../interfaces/iDictionary';
import { Difficulty} from '../utilities/enum';
import { Animator } from './animator';

export class ComboState {
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

    public animator?: Animator;

    public constructor(public overlayWidthPercentage: number = 0, public overlayClass: string = '') {
    }
}