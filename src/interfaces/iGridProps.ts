import { Difficulty, GameMode } from '../utilities/enum';
import { IBackdropProps } from './iBackdropProps';
import { IGameUpdate } from './iGameUpdate';

export interface IGridProps extends IBackdropProps {
    gameMode: GameMode;
    difficulty: Difficulty;
    onUpdate(updates: IGameUpdate): void;
}