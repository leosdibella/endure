import { GridDefinition } from '../classes/gridDefinition';
import { TileContainer } from '../classes/tileContainer';
import { GameMode, GridMode } from '../utilities/enum';

export interface ITileProps {
    gridDefinition: GridDefinition;
    container: TileContainer;
    gameMode: GameMode;
    gridMode: GridMode;
    selectedRow: number;
    selectedColumn: number;
    additionalStyles: React.CSSProperties;
    onUpdate(row: number, column: number): void;
}