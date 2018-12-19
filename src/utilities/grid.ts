import * as App from './app';
import * as Game from './game';
import * as General from './general';
import { Maybe } from './maybe';
import * as Rotation from './rotation';
import * as Tile from './tile';

const minimumTileChainLength = 4;

class Dimension {
    public readonly initialColumn: number;
    public readonly initialRow: number;
    public readonly numberOfColumns: number;
    public readonly numberOfRows: number;

    public getTileIndexFromCoordinates(row: number, column: number): number {
        return row * this.numberOfColumns + column;
    }

    public getTileCoordinatesFromIndex(index: number): number[] {
        const column = index % this.numberOfColumns;

        return [(index - column) / this.numberOfColumns, column];
    }

    public generateTiles(): Tile.Container[] {
        return General.fillArray(this.numberOfRows * this.numberOfColumns, index => {
            const coordinates: number[] = this.getTileCoordinatesFromIndex(index);

            return new Tile.Container(coordinates[0], coordinates[1], index, Tile.Container.getRandomColor());
        });
    }

    public constructor(initialRow: number, initialColumn: number, numberOfRows: number, numberOfColumns: number) {
        this.initialRow = initialRow;
        this.initialColumn = initialColumn;
        this.numberOfRows = numberOfRows;
        this.numberOfColumns = numberOfColumns;
    }
}

const dimensions: General.IDictionary<Dimension> = {
    [App.Orientation.landscape]: new Dimension(4, 6, 9, 13),
    [App.Orientation.portrait]: new Dimension(6, 4, 13, 9)
};

interface IReduction {
    readonly collapsingTiles: number[];
    readonly tiles: Tile.Container[];
}

interface IProps {
    theme: App.Theme;
    orientation: App.Orientation;
    mode: Game.Mode;
    readonly onUpdate: (updates: Game.IUpdate) => void;
}

class State {
    private static getGridDimension(props: IProps): Dimension {
        return dimensions[props.orientation];
    }

    private static iterateThroughStack(state: State,
                                       stack: Tile.Container[],
                                       visited: General.IDictionary<boolean>,
                                       beforeExtending: (tile: Tile.Container) => void,
                                       extend: (tile: Tile.Container, neighbor: Tile.Container, linkIndex: Tile.Link) => boolean): void {
        let tile: Tile.Container,
            neighbors: General.IDictionary<number>;

        while (stack.length > 0) {
            tile = stack.pop() as Tile.Container;

            if (!visited[tile.index]) {
                visited[tile.index] = true;
                neighbors = state.graph[tile.index];
                beforeExtending(tile);

                Tile.Container.neighborIndices.forEach(linkIndex => {
                    new Maybe(neighbors[linkIndex]).justDo(neighborIndex => {
                        const neighbor: Tile.Container = state.tiles[neighborIndex];

                        if (!visited[neighbor.index] && extend(tile, neighbor, linkIndex)) {
                            stack.push(neighbor);
                        }
                    });
                });
            }
        }
    }

    private static rotateTilesFromRotationMap(state: State, centerTile: Tile.Container, rotationMap: number[][]): General.IDictionary<Tile.Container> {
        const rotatedTiles: General.IDictionary<Tile.Container> = {};

        let to: number[],
            from: number[],
            toTile: Tile.Container,
            fromTile: Tile.Container;

        rotationMap.forEach((map, index, array) => {
            from = index > 0 ? array[index - 1] : array[rotationMap.length - 1];
            to = map;
            toTile = state.tiles[state.dimension.getTileIndexFromCoordinates(centerTile.row + to[0], centerTile.column + to[1])];
            fromTile = state.tiles[state.dimension.getTileIndexFromCoordinates(centerTile.row + from[0], centerTile.column + from[1])];
            rotatedTiles[toTile.index] = toTile.cloneWith(fromTile.color, fromTile.detonationRange);
        });

        return rotatedTiles;
    }

    private static reduceTile(state: State, visited: General.IDictionary<boolean>, stack: Tile.Container[]): General.IDictionary<Tile.Link> {
        const group: General.IDictionary<Tile.Link> = {};

        State.iterateThroughStack(state,
                                  stack,
                                  visited,
                                  tile => group[tile.index] = new Maybe(group[tile.index]).getOrDefault(Tile.Link.none),
                                  (tile, neighbor, linkIndex) => {
                                    if (tile.color === neighbor.color) {
                                        group[tile.index] |= linkIndex;
                                        group[neighbor.index] = new Maybe(group[neighbor.index]).getOrDefault(Tile.Link.none) | Tile.Container.reverseLinkDirection(linkIndex);

                                        return true;
                                    }

                                    return false;
                                });

        return group;
    }

    private static addDetonationRangeToStack(state: State, detonationCenter: Tile.Container, stack: Tile.Container[]): void {
        General.iterate(detonationCenter.detonationRange, i => {
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

    private static chainDetonation(state: State, stack: Tile.Container[]): Tile.Container[] {
        const detonatedTiles: Tile.Container[] = [];

        State.iterateThroughStack(state,
                                  stack,
                                  {},
                                  tile => detonatedTiles.push(tile),
                                  (tile, neighbor) => tile.color === neighbor.color || tile.detonationRange !== Tile.DetonationRange.none);

        return detonatedTiles.map(t => t.cloneWith(Tile.Color.transparent, Tile.DetonationRange.none)).sort((a, b) => a.index - b.index);
    }

    public static readonly moves: General.IDictionary<(state: State) => number> = {
        [Tile.Link.top]: (state) => state.row > 0 ? state.row - 1 : state.dimension.numberOfRows - 1,
        [Tile.Link.bottom]: (state) => state.row < state.dimension.numberOfRows - 1 ? state.row + 1 : 0,
        [Tile.Link.right]: (state) => state.column < state.dimension.numberOfColumns - 1 ? state.column + 1 : 0,
        [Tile.Link.left]: (state) => state.column > 0 ? state.column - 1 : state.dimension.numberOfColumns - 1
    };

    public static rotateTiles(state: State): General.IDictionary<Tile.Container> {
        const centerTile: Tile.Container = state.tiles[state.dimension.getTileIndexFromCoordinates(state.row, state.column)];

        let key: Tile.Link = Tile.Link.none;

        key |= centerTile.row === 0 ? Tile.Link.top : Tile.Link.none;
        key |= centerTile.row === state.dimension.numberOfRows - 1 ? Tile.Link.bottom : Tile.Link.none;
        key |= centerTile.column === 0 ? Tile.Link.left : Tile.Link.none;
        key |= centerTile.column === state.dimension.numberOfColumns - 1 ? Tile.Link.right : Tile.Link.none;

        return State.rotateTilesFromRotationMap(state, centerTile, Rotation.maps[key]);
    }

    public static reduceTiles(state: State): IReduction {
        const visited: General.IDictionary<boolean> = {},
              reduction: IReduction = {
                    collapsingTiles: General.fillArray(Tile.Container.numberOfColors, () => 0),
                    tiles: []
              };

        state.tiles.forEach(tile => {
            const group: General.IDictionary<Tile.Link> = State.reduceTile(state, visited, [tile]),
                  keys = Object.keys(group);

            keys.forEach(key => {
                const index: number = parseInt(key, 10);

                reduction.tiles[index] = state.tiles[index].cloneWith(tile.color, tile.detonationRange, group[key]);
            });

            if (keys.length > minimumTileChainLength) {
                reduction.collapsingTiles[tile.color] += keys.length;
            }
        });

        return reduction;
    }

    public static cascadeTiles(state: State): Tile.Container[][] {
        const tileUpdates: Tile.Container[][] = General.fillArray(state.dimension.numberOfColumns, () => []);

        let hasDetonationTile: boolean = state.tiles.filter(t => t.detonationRange !== Tile.DetonationRange.none).length > 0,
            detonationRange: Tile.DetonationRange,
            color: Tile.Color;

        General.iterate(state.dimension.numberOfColumns, column => {
            const reorderedTiles: Tile.Container[] = General.fillArray(state.dimension.numberOfRows, row => state.tiles[state.dimension.getTileIndexFromCoordinates(row, column)], true)
                                                            .filter(t => t.color !== Tile.Color.transparent)
                                                            .map((t, index) => state.tiles[state.dimension.getTileIndexFromCoordinates(index, column)].clone());

            if (reorderedTiles.length < state.dimension.numberOfRows) {
                let row = state.dimension.numberOfRows - reorderedTiles.length;

                while (row > 0) {
                    detonationRange = Tile.Container.generateRandomDetonationRange(!hasDetonationTile);
                    hasDetonationTile = hasDetonationTile || (detonationRange !== Tile.DetonationRange.none);
                    color = Tile.Container.getRandomColor(hasDetonationTile);
                    tileUpdates[column].push(state.tiles[state.dimension.getTileIndexFromCoordinates(row, column)].cloneWith(color, detonationRange));
                    --row;
                }
            }
        });

        return tileUpdates;
    }

    public static detonateTile(state: State): Tile.Container[] {
        const detonationCenter: Tile.Container = state.tiles[state.dimension.getTileIndexFromCoordinates(state.row, state.column)],
              stack: Tile.Container[] = [detonationCenter];

        State.addDetonationRangeToStack(state, detonationCenter, stack);

        return State.chainDetonation(state, stack);
    }

    public static transpose(props: IProps, state: State): State {
        const transposedState: State = new State(props);

        transposedState.row = state.column;
        transposedState.column = state.row;

        state.tiles.forEach(tile => {
            transposedState.tiles.push(state.tiles[state.dimension.getTileIndexFromCoordinates(tile.column, tile.row)]);
        });

        return transposedState;
    }

    private initializeGraph(): General.IDictionary<number>[] {
        return General.fillArray(this.dimension.numberOfRows * this.dimension.numberOfColumns, index => {
            const neighbors: General.IDictionary<number> = {},
                  coordinates: number[] = this.dimension.getTileCoordinatesFromIndex(index);

            if (coordinates[0] > 0) {
                neighbors[Tile.Link.top] = this.dimension.getTileIndexFromCoordinates(coordinates[0] - 1, coordinates[1]);
            }

            if (coordinates[1] < this.dimension.numberOfColumns - 1) {
                neighbors[Tile.Link.right] = this.dimension.getTileIndexFromCoordinates(coordinates[0], coordinates[1] + 1);
            }

            if (coordinates[0] < this.dimension.numberOfRows - 1) {
                neighbors[Tile.Link.bottom] = this.dimension.getTileIndexFromCoordinates(coordinates[0] + 1, coordinates[1]);
            }

            if (coordinates[1] > 0) {
                neighbors[Tile.Link.left] = this.dimension.getTileIndexFromCoordinates(coordinates[0], coordinates[1] - 1);
            }

            return neighbors;
        });
    }

    public tiles: Tile.Container[];
    public graph: General.IDictionary<number>[];
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