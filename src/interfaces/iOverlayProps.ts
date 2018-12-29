import { Difficulty, GameMode, Theme} from '../utilities/enum';
import { IGameUpdate } from './iGameUpdate';
import { IHighScore } from './iHighScore';

export interface IOverlayProps {
    difficulty: Difficulty;
    theme: Theme;
    gameMode: GameMode;
    highScores: IHighScore[];
    playerName: string;
    onUpdate(updates: IGameUpdate): void;
}