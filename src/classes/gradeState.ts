import { IDictionary } from '../interfaces/iDictionary';
import { Difficulty } from '../utilities/enum';
import { Animator } from './animator';

export class GradeState {
    public static readonly letterGrades: string[] = ['A', 'B', 'C', 'D'].map(g => ['+', '', '-'].map(m => `${g}${m}`))
                                                                        .reduce((a, b) => a.concat(b))
                                                                        .concat('F');

    public static readonly durations: IDictionary<number> = {
        [Difficulty.beginner]: 5000,
        [Difficulty.low]: 4500,
        [Difficulty.medium]: 4000,
        [Difficulty.hard]: 3500,
        [Difficulty.expert]: 3000
    };

    public static readonly durationModifiers: IDictionary<number> = {
        [Difficulty.beginner]: 10,
        [Difficulty.low]: 15,
        [Difficulty.medium]: 20,
        [Difficulty.hard]: 25,
        [Difficulty.expert]: 30
    };

    public animator?: Animator;

    public constructor(public fillRadiusPercentage: number = 0) {
    }
}