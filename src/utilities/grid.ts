import * as App from './app';
import * as Game from './game';
import * as General from './general';
import { Maybe } from './maybe';
import * as Tile from './tile';

const tileRelations: General.IDictionary<number[]> = {
    bottom: [1, 0],
    bottomLeft: [1, -1],
    bottomRight: [1, 1],
    left: [0, -1],
    right: [0, 1],
    self: [0, 0],
    top: [-1, 0],
    topLeft: [-1, -1],
    topRight: [-1, 1]
};

const centralRotationMap: number[][] = [
    tileRelations.left,
    tileRelations.topLeft,
    tileRelations.top,
    tileRelations.topRight,
    tileRelations.right,
    tileRelations.bottomRight,
    tileRelations.bottom,
    tileRelations.bottomLeft
];

const topLeftHandCornerRotationMap: number[][] = [
    tileRelations.bottom,
    tileRelations.self,
    tileRelations.right,
    tileRelations.bottomRight
];

const topRightHandCornerRotationMap: number[][] = [
    tileRelations.bottomLeft,
    tileRelations.left,
    tileRelations.self,
    tileRelations.bottom
];

const bottomLeftHandCornerRotationMap: number[][] = [
    tileRelations.self,
    tileRelations.top,
    tileRelations.topRight,
    tileRelations.right
];

const bottomRightHandCornerRotationMap: number[][] = [
    tileRelations.left,
    tileRelations.topLeft,
    tileRelations.top,
    tileRelations.self
];

const topSideRotationMap: number[][] = [
    tileRelations.bottomLeft,
    tileRelations.left,
    tileRelations.self,
    tileRelations.right,
    tileRelations.bottomRight,
    tileRelations.bottom
];

const bottomSideRotationMap: number[][] = [
    tileRelations.left,
    tileRelations.topLeft,
    tileRelations.top,
    tileRelations.topRight,
    tileRelations.right,
    tileRelations.self
];

const leftSideRotationMap: number[][] = [
    tileRelations.self,
    tileRelations.top,
    tileRelations.topRight,
    tileRelations.right,
    tileRelations.bottomRight,
    tileRelations.bottom
];

const rightSideRotationMap: number[][] = [
    tileRelations.left,
    tileRelations.topLeft,
    tileRelations.top,
    tileRelations.self,
    tileRelations.bottom,
    tileRelations.bottomLeft
];

const rotationMaps: General.IDictionary<number[][]> = {
    [Tile.Link.topRight]: topRightHandCornerRotationMap,
    [Tile.Link.rightBottom]: bottomRightHandCornerRotationMap,
    [Tile.Link.bottomLeft]: bottomLeftHandCornerRotationMap,
    [Tile.Link.topLeft]: topLeftHandCornerRotationMap,
    [Tile.Link.top]: topSideRotationMap,
    [Tile.Link.right]: rightSideRotationMap,
    [Tile.Link.bottom]: bottomSideRotationMap,
    [Tile.Link.left]: leftSideRotationMap,
    [Tile.Link.none]: centralRotationMap
};

const minimumTileChainLength = 4;

interface IGridDimension {
    initialColumn: number;
    initialRow: number;
    numberOfColumns: number;
    numberOfRows: number;
}

const dimensions: General.IDictionary<IGridDimension> = {
    [App.Orientation.landscape]: {
        initialColumn: 6,
        initialRow: 4,
        numberOfColumns: 13,
        numberOfRows: 9
    },
    [App.Orientation.portrait]: {
        initialColumn: 4,
        initialRow: 6,
        numberOfColumns: 9,
        numberOfRows: 13
    }
};

function getGridDimension(props: IProps): IGridDimension {
    return dimensions[props.orientation];
}

function getTileIndexFromCoordinates(dimension: IGridDimension, row: number, column: number): number {
    return row * dimension.numberOfRows + column;
}

function getTileCoordinatesFromIndex(dimension: IGridDimension, index: number): number[] {
    const column = index % dimension.numberOfRows;

    return [index - column, column];
}

function initializeGraph(dimension: IGridDimension): General.IDictionary<number>[] {
    return General.fillArray(dimension.numberOfRows * dimension.numberOfColumns, index => {
        const neighbors: General.IDictionary<number> = {},
              coordinates: number[] = getTileCoordinatesFromIndex(dimension, index);

        if (coordinates[0] > 0) {
            neighbors[Tile.Link.top] = getTileIndexFromCoordinates(dimension, coordinates[0] - 1, coordinates[1]);
        }

        if (coordinates[1] < dimension.numberOfColumns - 1) {
            neighbors[Tile.Link.right] = getTileIndexFromCoordinates(dimension, coordinates[0], coordinates[1] + 1);
        }

        if (coordinates[0] < dimension.numberOfRows - 1) {
            neighbors[Tile.Link.bottom] = getTileIndexFromCoordinates(dimension, coordinates[0] + 1, coordinates[1]);
        }

        if (coordinates[1] > 0) {
            neighbors[Tile.Link.left] = getTileIndexFromCoordinates(dimension, coordinates[0], coordinates[1] - 1);
        }

        return neighbors;
    });
}

interface IProps {
    theme: App.Theme;
    orientation: App.Orientation;
    mode: Game.Mode;
    readonly onUpdate: (updates: Game.IUpdate) => void;
}

class State {
    public tiles: Tile.Container[];
    public graph: General.IDictionary<number>[];
    public column: number;
    public row: number;
    public processingInput: boolean;

    public constructor(props: IProps) {
        const dimension: IGridDimension = getGridDimension(props);

        this.tiles = [];
        this.graph = initializeGraph(dimension);
        this.row = dimension.initialRow;
        this.column = dimension.initialColumn;
        this.processingInput = true;
    }
}

function iterateThroughStack(state: State,
                             stack: Tile.Container[],
                             visited: General.IDictionary<boolean>,
                             extensionCondition: (tile: Tile.Container, neighbor: Tile.Container) => boolean,
                             beforeExtending?: (tile: Tile.Container) => void,
                             afterExtending?: (tile: Tile.Container, linkIndex: number) => void): void {
    let tile: Tile.Container,
        neighbors: General.IDictionary<number>;

    while (stack.length > 0) {
        tile = stack.pop() as Tile.Container;

        if (!visited[tile.index]) {
            visited[tile.index] = true;
            neighbors = state.graph[tile.index];
            new Maybe(beforeExtending).justDo(be => be(tile));

            General.forEach(Tile.neighborIndices, i => {
                new Maybe(neighbors[i]).justDo(index => {
                    const neighbor: Tile.Container = state.tiles[index];

                    if (!visited[neighbor.index] && extensionCondition(tile, neighbor)) {
                        stack.push(neighbor);
                        new Maybe(afterExtending).justDo(ae => ae(tile, i));
                    }
                });
            });
        }
    }
}

function chainDetonation(state: State, stack: Tile.Container[]): Tile.Container[] {
    const detonatedTiles: Tile.Container[] = [];

    iterateThroughStack(state,
                        stack,
                        {},
                        (tile, neighbor) => (tile.color === neighbor.color && tile.color !== Tile.Color.transparent) || neighbor.detonationRange === Tile.DetonationRange.none,
                        tile => {
                            detonatedTiles.push(tile);
                        });

    return detonatedTiles.map(t => t.cloneWith(Tile.Color.transparent, Tile.Link.none, Tile.DetonationRange.none)).sort((a, b) => a.index - b.index);
}

function addDetonationRangeToStack(state: State, dimension: IGridDimension, detonationCenter: Tile.Container, stack: Tile.Container[]): void {
    General.iterate(detonationCenter.detonationRange, i => {
        let index: number;

        stack.push(state.tiles[getTileIndexFromCoordinates(dimension, detonationCenter.row + i % dimension.numberOfRows, detonationCenter.column)]);
        stack.push(state.tiles[getTileIndexFromCoordinates(dimension, detonationCenter.row, detonationCenter.column + i % dimension.numberOfColumns)]);

        index = detonationCenter.row - i % dimension.numberOfRows;
        index += index < 0 ? dimension.numberOfRows : 0;
        stack.push(state.tiles[getTileIndexFromCoordinates(dimension, index, detonationCenter.column)]);

        index = detonationCenter.column - i % dimension.numberOfColumns;
        index += index < 0 ? dimension.numberOfColumns : 0;
        stack.push(state.tiles[getTileIndexFromCoordinates(dimension, detonationCenter.row, index)]);
    });
}

function detonateTile(props: IProps, state: State): Tile.Container[] {
    const dimension: IGridDimension = getGridDimension(props),
          detonationCenter: Tile.Container = state.tiles[getTileIndexFromCoordinates(dimension, state.row, state.column)],
          stack: Tile.Container[] = [detonationCenter];

    addDetonationRangeToStack(state, dimension, detonationCenter, stack);

    return chainDetonation(state, stack);
}

function cascadeTiles(props: IProps, state: State): Tile.Container[][] {
    const dimension: IGridDimension = getGridDimension(props),
          tileUpdates: Tile.Container[][] = General.fillArray(dimension.numberOfColumns, () => []);

    let hasDetonationTile: boolean = state.tiles.filter(t => t.detonationRange !== Tile.DetonationRange.none).length > 0,
        detonationRange: Tile.DetonationRange,
        color: Tile.Color;

    General.iterate(dimension.numberOfColumns, column => {
        const reorderedTiles: Tile.Container[] = General.fillArray(dimension.numberOfRows, row => state.tiles[getTileIndexFromCoordinates(dimension, row, column)], true)
                                                        .filter(t => t.color !== Tile.Color.transparent)
                                                        .map((t, index) => state.tiles[getTileIndexFromCoordinates(dimension, index, column)].cloneWith(t.color, t.link, t.detonationRange));

        if (reorderedTiles.length < dimension.numberOfRows) {
            let row = dimension.numberOfRows - reorderedTiles.length;

            while (row > 0) {
                detonationRange = Tile.generateRandomDetonationRange(!hasDetonationTile);
                hasDetonationTile = detonationRange !== Tile.DetonationRange.none;
                color = Tile.getRandomColor(hasDetonationTile);
                tileUpdates[column].push(state.tiles[getTileIndexFromCoordinates(dimension, row, column)].cloneWith(color, Tile.Link.none, detonationRange));
                --row;
            }
        }
    });

    return tileUpdates;
}

function reduceTile(state: State, visited: General.IDictionary<boolean>, stack: Tile.Container[]): General.IDictionary<Tile.Container> {
    const group: General.IDictionary<Tile.Container> = {};

    iterateThroughStack(state,
                        stack,
                        visited,
                        (tile, neighbor) => tile.color === neighbor.color && tile.color !== Tile.Color.transparent,
                        tile => {
                            group[tile.index] = tile.cloneWith(tile.color, Tile.Link.none, tile.detonationRange);
                        },
                        (tile, linkIndex) => {
                            group[tile.index].link |= linkIndex;
                        });

    return group;
}

interface IReduction {
    readonly collapsingTiles: number[];
    readonly tiles: Tile.Container[];
}

function reduceTiles(state: State): IReduction {
    const visited: General.IDictionary<boolean> = {},
          reduction: IReduction = {
                collapsingTiles: General.fillArray(Tile.numberOfColors, () => 0),
                tiles: []
          };

    General.forEach(state.tiles, tile => {
        const group: General.IDictionary<Tile.Container> = reduceTile(state, visited, [tile]),
              keys = Object.keys(group);

        General.forEach(keys, key => {
            new Maybe(parseInt(key, 10)).justDo(index => {
                reduction.tiles[index] = group[index];
                reduction.tiles[index].color = Tile.Color.transparent;
            });
        });

        if (keys.length > minimumTileChainLength) {
            reduction.collapsingTiles[tile.color] += keys.length;
        }
    });

    return reduction;
}

function rotateTilesFromRotationMap(dimension: IGridDimension, state: State, centerTile: Tile.Container, rotationMap: number[][]): General.IDictionary<Tile.Container> {
    const rotatedTiles: General.IDictionary<Tile.Container> = {};

    let to: number[],
        from: number[],
        toTile: Tile.Container,
        fromTile: Tile.Container;

    General.forEach(rotationMap, (map, index, array) => {
        from = index > 0 ? array[index - 1] : array[rotationMap.length - 1];
        to = map;
        toTile = state.tiles[getTileIndexFromCoordinates(dimension, centerTile.row + to[0], centerTile.column + to[1])];
        fromTile = state.tiles[getTileIndexFromCoordinates(dimension, centerTile.row + from[0], centerTile.column + from[1])];
        rotatedTiles[toTile.index] = toTile.cloneWith(fromTile.color, fromTile.link, fromTile.detonationRange);
    });

    return rotatedTiles;
}

function rotateTiles(props: IProps, state: State): General.IDictionary<Tile.Container> {
    const dimension: IGridDimension = getGridDimension(props),
          centerTile: Tile.Container = state.tiles[getTileIndexFromCoordinates(dimension, state.row, state.column)];

    let key: Tile.Link = Tile.Link.none;

    key |= centerTile.row === 0 ? Tile.Link.top : Tile.Link.none;
    key |= centerTile.row === dimension.numberOfRows - 1 ? Tile.Link.bottom : Tile.Link.none;
    key |= centerTile.column === 0 ? Tile.Link.left : Tile.Link.none;
    key |= centerTile.column === dimension.numberOfColumns - 1 ? Tile.Link.right : Tile.Link.none;

    return rotateTilesFromRotationMap(dimension, state, centerTile, rotationMaps[key]);
}

function generateTiles(dimension: IGridDimension): Tile.Container[] {
    return General.fillArray(dimension.numberOfRows * dimension.numberOfColumns, index => {
        const coordinates: number[] = getTileCoordinatesFromIndex(dimension, index);

        return new Tile.Container(coordinates[0], coordinates[1], index, Tile.getRandomColor());
    });
}

const movementFunctions: General.IDictionary<(props: IProps, state: State) => number> = {
    [Tile.Link.top]: (props, state) => state.row > 0 ? state.row - 1 : getGridDimension(props).numberOfRows - 1,
    [Tile.Link.bottom]: (props, state) => state.row < getGridDimension(props).numberOfRows - 1 ? state.row + 1 : 0,
    [Tile.Link.right]: (props, state) => state.column < getGridDimension(props).numberOfColumns - 1 ? state.column + 1 : 0,
    [Tile.Link.left]: (props, state) => state.column > 0 ? state.column - 1 : getGridDimension(props).numberOfColumns - 1
};

export {
    IGridDimension,
    getGridDimension,
    getTileIndexFromCoordinates,
    IProps,
    State,
    detonateTile,
    cascadeTiles,
    IReduction,
    reduceTiles,
    rotateTiles,
    generateTiles,
    movementFunctions
};