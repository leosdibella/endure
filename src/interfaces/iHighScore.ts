import { Difficulty } from '../utilities/enum';

export interface IHighScore {
    readonly name: string;
    readonly value: number;
    readonly dateStamp: string;
    readonly difficulty: Difficulty;
    readonly maxCombo: number;
}