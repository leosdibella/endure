import { TileContainer } from '../classes/tileContainer';

export interface IGridReduction {
    readonly collapsingTiles: number[];
    readonly tiles: TileContainer[];
}