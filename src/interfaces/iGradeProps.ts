import { Difficulty, GameMode, Theme } from '../utilities/enum';
import { IGameUpdate } from './iGameUpdate';

export interface IGradeProps {
    theme: Theme;
    letterGrade: number;
    stage: number;
    difficulty: Difficulty;
    gameMode: GameMode;
    onUpdate(updates: IGameUpdate): void;
}