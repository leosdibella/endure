import { Difficulty, GameMode, Theme } from '../utilities/enum';

export interface IGameUpdate {
    points?: number;
    gameMode?: GameMode;
    difficulty?: Difficulty;
    theme?: Theme;
    playerName?: string;
    dropCombo?: boolean;
    letterGrade?: number;
}