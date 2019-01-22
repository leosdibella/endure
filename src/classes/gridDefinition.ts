import { IDictionary } from '../interfaces/iDictionary';
import { Orientation } from '../utilities/enum';
import * as Shared from '../utilities/shared';
import { TileContainer } from './tileContainer';

export class GridDefinition {
    private static readonly dimensionMinor: number = 7;
    private static readonly dimensionMajor: number = 11;
    private static readonly midpointDenominator: number = 2;
    private static readonly intiailMinor: number = (GridDefinition.dimensionMinor - 1) / GridDefinition.midpointDenominator;
    private static readonly intialMajor: number = (GridDefinition.dimensionMajor - 1) / GridDefinition.midpointDenominator;

    public static readonly orientedDefinitions: IDictionary<GridDefinition> = {
        [Orientation.landscape]: new GridDefinition(GridDefinition.intiailMinor, GridDefinition.intialMajor, GridDefinition.dimensionMinor, GridDefinition.dimensionMajor),
        [Orientation.portrait]: new GridDefinition(GridDefinition.intialMajor, GridDefinition.intiailMinor, GridDefinition.dimensionMajor, GridDefinition.dimensionMinor)
    };

    public getTileIndexFromCoordinates(row: number, column: number): number {
        return row * this.numberOfColumns + column;
    }

    public getTile(tiles: TileContainer[], row: number, column: number): TileContainer {
        return tiles[this.getTileIndexFromCoordinates(row, column)];
    }

    public getTileCoordinatesFromIndex(index: number): number[] {
        const column = index % this.numberOfColumns;

        return [(index - column) / this.numberOfColumns, column];
    }

    public generateTiles(): TileContainer[] {
        return Shared.fillArray(this.numberOfRows * this.numberOfColumns, index => {
            const coordinates: number[] = this.getTileCoordinatesFromIndex(index);

            return new TileContainer(coordinates[0], coordinates[1], index, TileContainer.getRandomColor());
        });
    }

    public constructor(public readonly initialRow: number,
                       public readonly initialColumn: number,
                       public readonly numberOfRows: number,
                       public readonly numberOfColumns: number) {
    }
}