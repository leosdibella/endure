import { Difficulty, GameMode, LetterGrade, Theme } from '../utilities/enum';
import { IGameUpdate } from './iGameUpdate';

export interface IHeaderProps {
    gameMode: GameMode;
    theme: Theme;
    letterGrade: LetterGrade;
    difficulty: Difficulty;
    combo: number;
    score: number;
    stage: number;
    playerName: string;
    onUpdate(updates: IGameUpdate): void;
}