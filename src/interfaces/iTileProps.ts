import { TileContainer } from '../classes/tileContainer';
import { GameMode } from '../utilities/enum';

export interface ITileProps {
    container: TileContainer;
    gameMode: GameMode;
    additionalClassName: string;
    onUpdate(row: number, column: number): void;
}