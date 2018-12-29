import { GridDefinition } from '../classes/gridDefinition';
import { TileContainer } from '../classes/tileContainer';
import { GameMode } from '../utilities/enum';

export interface ITileProps {
    gridDefinition: GridDefinition;
    container: TileContainer;
    gameMode: GameMode;
    selectedRow: number;
    selectedColumn: number;
    onUpdate(row: number, column: number): void;
}