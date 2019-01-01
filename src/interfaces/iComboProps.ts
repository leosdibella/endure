import { Difficulty, GameMode, LetterGrade, Theme } from '../utilities/enum';
import { IGameUpdate } from './iGameUpdate';

export interface IComboProps {
    combo: number;
    letterGrade: LetterGrade;
    stage: number;
    difficulty: Difficulty;
    gameMode: GameMode;
    onUpdate(updates: IGameUpdate): void;
}