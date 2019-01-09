import { TileContainer } from '../classes/tileContainer';

export interface IGridReduction {
    readonly collapsingTiles: TileContainer[];
    readonly tiles: TileContainer[];
    readonly numberOfCollapsingTiles: number;
}