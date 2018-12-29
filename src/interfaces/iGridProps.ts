import { GameMode } from '../utilities/enum';
import { IBackdropProps } from './iBackdropProps';
import { IGameUpdate } from './iGameUpdate';

export interface IGridProps extends IBackdropProps {
    gameMode: GameMode;
    onUpdate(updates: IGameUpdate): void;
}