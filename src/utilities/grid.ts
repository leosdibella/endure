import * as GameUtilities from './game';
import { Maybe } from './maybe';
import * as Rotation from './rotation';
import * as Shared from './shared';
import * as TileUtilities from './tile';

const minimumTileChainLength: number = 4;
const dimensionMinor: number = 9;
const dimensionMajor: number = 13;
const midpointDenominator: number = 2;
const intiailMinor: number = (dimensionMinor - 1) / midpointDenominator;
const intialMajor: number = (dimensionMajor - 1) / midpointDenominator;

class Dimension {
    public getTileIndexFromCoordinates(row: number, column: number): number {
        return row * this.numberOfColumns + column;
    }

    public getTileCoordinatesFromIndex(index: number): number[] {
        const column = index % this.numberOfColumns;

        return [(index - column) / this.numberOfColumns, column];
    }

    public generateTiles(): TileUtilities.Container[] {
        return Shared.fillArray(this.numberOfRows * this.numberOfColumns, index => {
            const coordinates: number[] = this.getTileCoordinatesFromIndex(index);

            return new TileUtilities.Container(coordinates[0], coordinates[1], index, TileUtilities.Container.getRandomColor());
        });
    }

    public constructor(public readonly initialRow: number,
                       public readonly initialColumn: number,
                       public readonly numberOfRows: number,
                       public readonly numberOfColumns: number) {
    }
}

const dimensions: Shared.IDictionary<Dimension> = {
    [Shared.Orientation.landscape]: new Dimension(intiailMinor, intialMajor, dimensionMinor, dimensionMajor),
    [Shared.Orientation.portrait]: new Dimension(intialMajor, intiailMinor, dimensionMajor, dimensionMinor)
};

interface IReduction {
    readonly collapsingTiles: number[];
    readonly tiles: TileUtilities.Container[];
}

interface IProps {
    theme: Shared.Theme;
    orientation: Shared.Orientation;
    mode: GameUtilities.Mode;
    onUpdate(updates: GameUtilities.IUpdate): void;
}

class State {
    private static getGridDimension(props: IProps): Dimension {
        return dimensions[props.orientation];
    }

    private static iterateThroughStack(state: State,
                                       stack: TileUtilities.Container[],
                                       visited: Shared.IDictionary<boolean>,
                                       beforeExtending: (tile: TileUtilities.Container) => void,
                                       extend: (tile: TileUtilities.Container, neighbor: TileUtilities.Container, linkIndex: TileUtilities.Link) => boolean): void {
        let tile: TileUtilities.Container,
            neighbors: Shared.IDictionary<number>;

        while (stack.length > 0) {
            tile = stack.pop() as TileUtilities.Container;

            if (!visited[tile.index]) {
                visited[tile.index] = true;
                neighbors = state.graph[tile.index];
                beforeExtending(tile);

                TileUtilities.Container.neighborIndices.forEach(linkIndex => {
                    new Maybe(neighbors[linkIndex]).justDo(neighborIndex => {
                        const neighbor: TileUtilities.Container = state.tiles[neighborIndex];

                        if (!visited[neighbor.index] && extend(tile, neighbor, linkIndex)) {
                            stack.push(neighbor);
                        }
                    });
                });
            }
        }
    }

    private static rotateTilesFromRotationMap(state: State, centerTile: TileUtilities.Container, rotationMap: number[][]): Shared.IDictionary<TileUtilities.Container> {
        const rotatedTiles: Shared.IDictionary<TileUtilities.Container> = {};

        let to: number[],
            from: number[],
            toTile: TileUtilities.Container,
            fromTile: TileUtilities.Container;

        rotationMap.forEach((map, index, array) => {
            from = index > 0 ? array[index - 1] : array[rotationMap.length - 1];
            to = map;
            toTile = state.tiles[state.dimension.getTileIndexFromCoordinates(centerTile.row + to[0], centerTile.column + to[1])];
            fromTile = state.tiles[state.dimension.getTileIndexFromCoordinates(centerTile.row + from[0], centerTile.column + from[1])];
            rotatedTiles[toTile.index] = toTile.cloneWith(fromTile.color, fromTile.detonationRange);
        });

        return rotatedTiles;
    }

    private static reduceTile(state: State, visited: Shared.IDictionary<boolean>, stack: TileUtilities.Container[]): Shared.IDictionary<TileUtilities.Link> {
        const group: Shared.IDictionary<TileUtilities.Link> = {};

        State.iterateThroughStack(state,
                                  stack,
                                  visited,
                                  tile => group[tile.index] = new Maybe(group[tile.index]).getOrDefault(TileUtilities.Link.none),
                                  (tile, neighbor, linkIndex) => {
                                    if (tile.color === neighbor.color) {
                                        group[tile.index] |= linkIndex;
                                        group[neighbor.index] = new Maybe(group[neighbor.index]).getOrDefault(TileUtilities.Link.none) | TileUtilities.Container.reverseLinkDirection(linkIndex);

                                        return true;
                                    }

                                    return false;
                                });

        return group;
    }

    private static addDetonationRangeToStack(state: State, detonationCenter: TileUtilities.Container, stack: TileUtilities.Container[]): void {
        Shared.iterate(detonationCenter.detonationRange, i => {
            let index: number = detonationCenter.row + i;

            if (index < state.dimension.numberOfRows) {
                stack.push(state.tiles[state.dimension.getTileIndexFromCoordinates(index, detonationCenter.column)]);
            }

            index = detonationCenter.row - i;

            if (index >= 0) {
                stack.push(state.tiles[state.dimension.getTileIndexFromCoordinates(index, detonationCenter.column)]);
            }

            index = detonationCenter.column + i;

            if (index < state.dimension.numberOfColumns) {
                stack.push(state.tiles[state.dimension.getTileIndexFromCoordinates(detonationCenter.row, index)]);
            }

            index = detonationCenter.column - i;

            if (index >= 0) {
                stack.push(state.tiles[state.dimension.getTileIndexFromCoordinates(detonationCenter.row, index)]);
            }
        });
    }

    private static chainDetonation(state: State, stack: TileUtilities.Container[]): TileUtilities.Container[] {
        const detonatedTiles: TileUtilities.Container[] = [];

        State.iterateThroughStack(state,
                                  stack,
                                  {},
                                  tile => detonatedTiles.push(tile),
                                  (tile, neighbor) => tile.color === neighbor.color || tile.detonationRange !== TileUtilities.DetonationRange.none);

        return detonatedTiles.map(t => t.cloneWith(TileUtilities.Color.transparent, TileUtilities.DetonationRange.none)).sort((a, b) => a.index - b.index);
    }

    public static readonly moves: Shared.IDictionary<(state: State) => number> = {
        [TileUtilities.Link.top]: (state) => state.row > 0 ? state.row - 1 : state.dimension.numberOfRows - 1,
        [TileUtilities.Link.bottom]: (state) => state.row < state.dimension.numberOfRows - 1 ? state.row + 1 : 0,
        [TileUtilities.Link.right]: (state) => state.column < state.dimension.numberOfColumns - 1 ? state.column + 1 : 0,
        [TileUtilities.Link.left]: (state) => state.column > 0 ? state.column - 1 : state.dimension.numberOfColumns - 1
    };

    public static rotateTiles(state: State): Shared.IDictionary<TileUtilities.Container> {
        const centerTile: TileUtilities.Container = state.tiles[state.dimension.getTileIndexFromCoordinates(state.row, state.column)];

        let key: TileUtilities.Link = TileUtilities.Link.none;

        key |= centerTile.row === 0 ? TileUtilities.Link.top : TileUtilities.Link.none;
        key |= centerTile.row === state.dimension.numberOfRows - 1 ? TileUtilities.Link.bottom : TileUtilities.Link.none;
        key |= centerTile.column === 0 ? TileUtilities.Link.left : TileUtilities.Link.none;
        key |= centerTile.column === state.dimension.numberOfColumns - 1 ? TileUtilities.Link.right : TileUtilities.Link.none;

        return State.rotateTilesFromRotationMap(state, centerTile, Rotation.maps[key]);
    }

    public static reduceTiles(state: State): IReduction {
        const visited: Shared.IDictionary<boolean> = {},
              reduction: IReduction = {
                    collapsingTiles: Shared.fillArray(TileUtilities.Container.numberOfColors, () => 0),
                    tiles: []
              };

        state.tiles.forEach(tile => {
            const group: Shared.IDictionary<TileUtilities.Link> = State.reduceTile(state, visited, [tile]),
                  keys = Object.keys(group);

            keys.forEach(key => {
                const index: number = parseInt(key, Shared.decimalBase);

                reduction.tiles[index] = state.tiles[index].cloneWith(tile.color, tile.detonationRange, group[key]);
            });

            if (keys.length > minimumTileChainLength) {
                reduction.collapsingTiles[tile.color] += keys.length;
            }
        });

        return reduction;
    }

    public static cascadeTiles(state: State): TileUtilities.Container[][] {
        const tileUpdates: TileUtilities.Container[][] = Shared.fillArray(state.dimension.numberOfColumns, () => []);

        let hasDetonationTile: boolean = state.tiles.filter(t => t.detonationRange !== TileUtilities.DetonationRange.none).length > 0,
            detonationRange: TileUtilities.DetonationRange,
            color: TileUtilities.Color;

        Shared.iterate(state.dimension.numberOfColumns, column => {
            const reorderedTiles: TileUtilities.Container[] = Shared.fillArray(state.dimension.numberOfRows, row => state.tiles[state.dimension.getTileIndexFromCoordinates(row, column)], true)
                                                            .filter(t => t.color !== TileUtilities.Color.transparent)
                                                            .map((t, index) => state.tiles[state.dimension.getTileIndexFromCoordinates(index, column)].clone());

            if (reorderedTiles.length < state.dimension.numberOfRows) {
                let row = state.dimension.numberOfRows - reorderedTiles.length;

                while (row > 0) {
                    detonationRange = TileUtilities.Container.generateRandomDetonationRange(!hasDetonationTile);
                    hasDetonationTile = hasDetonationTile || (detonationRange !== TileUtilities.DetonationRange.none);
                    color = TileUtilities.Container.getRandomColor(hasDetonationTile);
                    tileUpdates[column].push(state.tiles[state.dimension.getTileIndexFromCoordinates(row, column)].cloneWith(color, detonationRange));
                    --row;
                }
            }
        });

        return tileUpdates;
    }

    public static detonateTile(state: State): TileUtilities.Container[] {
        const detonationCenter: TileUtilities.Container = state.tiles[state.dimension.getTileIndexFromCoordinates(state.row, state.column)],
              stack: TileUtilities.Container[] = [detonationCenter];

        State.addDetonationRangeToStack(state, detonationCenter, stack);

        return State.chainDetonation(state, stack);
    }

    public static transpose(props: IProps, state: State): State {
        const transposedState: State = new State(props);

        transposedState.row = state.column;
        transposedState.column = state.row;

        let index: number = 0;

        Shared.iterate(state.dimension.numberOfColumns, column => {
            Shared.iterate(state.dimension.numberOfRows, row => {
                const tile: TileUtilities.Container = state.tiles[state.dimension.getTileIndexFromCoordinates(row, column)];

                transposedState.tiles.push(new TileUtilities.Container(column, row, index, tile.color, tile.detonationRange));
                ++index;
            });
        });

        return transposedState;
    }

    public static getAdditionalTileClassName(props: IProps, state: State, tile: TileUtilities.Container): string {
        if (state.row === tile.row && state.column === tile.column) {
            return `${Shared.Theme[props.theme]}-tile-highlighted`;
        }

        return '';
    }

    private initializeGraph(): Shared.IDictionary<number>[] {
        return Shared.fillArray(this.dimension.numberOfRows * this.dimension.numberOfColumns, index => {
            const neighbors: Shared.IDictionary<number> = {},
                  coordinates: number[] = this.dimension.getTileCoordinatesFromIndex(index);

            if (coordinates[0] > 0) {
                neighbors[TileUtilities.Link.top] = this.dimension.getTileIndexFromCoordinates(coordinates[0] - 1, coordinates[1]);
            }

            if (coordinates[1] < this.dimension.numberOfColumns - 1) {
                neighbors[TileUtilities.Link.right] = this.dimension.getTileIndexFromCoordinates(coordinates[0], coordinates[1] + 1);
            }

            if (coordinates[0] < this.dimension.numberOfRows - 1) {
                neighbors[TileUtilities.Link.bottom] = this.dimension.getTileIndexFromCoordinates(coordinates[0] + 1, coordinates[1]);
            }

            if (coordinates[1] > 0) {
                neighbors[TileUtilities.Link.left] = this.dimension.getTileIndexFromCoordinates(coordinates[0], coordinates[1] - 1);
            }

            return neighbors;
        });
    }

    public tiles: TileUtilities.Container[];
    public graph: Shared.IDictionary<number>[];
    public dimension: Dimension;
    public column: number;
    public row: number;
    public processingInput: boolean;

    public constructor(props: IProps) {
        this.dimension = State.getGridDimension(props);
        this.tiles = [];
        this.graph = this.initializeGraph();
        this.row = this.dimension.initialRow;
        this.column = this.dimension.initialColumn;
        this.processingInput = true;
    }
}

export {
    Dimension,
    IProps,
    State,
    IReduction
};