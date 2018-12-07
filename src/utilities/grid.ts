import { App } from './app';
import { Game } from './game';
import { General } from './general';
import { Tile } from './tile';
import { Maybe } from './utilities';

export namespace Grid {
    const tileRelations: General.IDictionary<number[]> = {
        self: [0, 0],
        topLeft: [-1, -1],
        top: [-1, 0],
        topRight: [-1, 1],
        right: [0, 1],
        bottomRight: [1, 1],
        bottom: [1, 0],
        bottomLeft: [1, -1],
        left: [0, -1]
    };

    const centralRotationMap:  number[][] = [
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

    export interface IGridDimension {
        numberOfRows: number;
        numberOfColumns: number;
        initialRow: number;
        initialColumn: number;
    };

    export const dimensions: General.IDictionary<IGridDimension> = {
        [App.Orientation.landscape]: {
            numberOfRows: 9,
            numberOfColumns: 13,
            initialRow: 4,
            initialColumn: 6
        },
        [App.Orientation.portrait]: {
            numberOfRows: 13,
            numberOfColumns: 9,
            initialRow: 6,
            initialColumn: 4
        }
    };

    function initializeGraph(dimension: IGridDimension) : General.IDictionary<number>[] {
        const graph: General.IDictionary<number>[] = [];
        let index: number;

        for (let i: number = 0; i < dimension.numberOfRows; ++i) {
            for (let j: number = 0; j < dimension.numberOfColumns; ++j) {
                graph.push({});
                index = getTileIndexFromCoordinates(dimension, i, j);

                if (i > 0) {
                    graph[index][Tile.Link.top] = getTileIndexFromCoordinates(dimension, i - 1, j);
                }
    
                if (j < dimension.numberOfColumns - 1) {
                    graph[index][Tile.Link.right] = getTileIndexFromCoordinates(dimension, i, j+ 1);
                }
    
                if (i < dimension.numberOfRows - 1) {
                    graph[index][Tile.Link.bottom] = getTileIndexFromCoordinates(dimension, i + 1, j);
                }
                if (j > 0) {
                    graph[index][Tile.Link.left] = getTileIndexFromCoordinates(dimension, i, j - 1);
                }
            }
        }

        return graph;
    };

    export interface IProps {
        theme: App.Theme;
        orientation: App.Orientation;
        mode: Game.Mode;
        readonly onUpdate: (updates: Game.IUpdate) => void;
    };

    export class State {
        tiles: Tile.Container[];
        graph: General.IDictionary<number>[];
        column: number;
        row: number;
        processingInput: boolean;

        constructor(props: IProps) {
            const dimension: IGridDimension = getGridDimension(props);

            this.tiles = [];
            this.graph = initializeGraph(dimension);
            this.row = dimension.initialRow;
            this.column = dimension.initialColumn;
            this.processingInput = true;
        };
    };

    export function getGridDimension(props: IProps) : IGridDimension {
        return getGridDimension(props);
    };

    export function getTileIndexFromCoordinates(dimension: IGridDimension, row: number, column: number) : number {
        return row * dimension.numberOfRows + column;
    };

    function chainDetonation(state: State, stack: Tile.Container[]) : Tile.Container[] {
        const detonatedTiles: Tile.Container[] = [],
              visited: General.IDictionary<boolean> = {};

        let tile: Tile.Container,
            neighbors: General.IDictionary<number>,
            neighbor: Tile.Container;

        while (stack.length > 0) {
            tile = stack.pop() as Tile.Container;
            detonatedTiles.push(tile);
            visited[tile.index] = true;
            neighbors = state.graph[tile.index];

            for (let i: number = 0; i < Tile.neighborIndices.length; ++i) {
                new Maybe(neighbors[Tile.neighborIndices[i]]).justDo(index => {
                    neighbor = state.tiles[index];
                    
                    if (neighbor.color == tile.color && !visited[neighbor.index]) {
                        stack.push(neighbor);
                    }
                });
            }
        }

        return detonatedTiles.map(t => t.cloneWith(Tile.Color.none, Tile.Link.none, Tile.DetonationRange.none)).sort((a, b) => a.index - b.index);
    };

    export function detonateTile(props: IProps, state: State) : Tile.Container[] {
        const dimension: IGridDimension = getGridDimension(props),
              detonationCenter: Tile.Container = state.tiles[getTileIndexFromCoordinates(dimension, state.row, state.column)],
              stack: Tile.Container[] = [detonationCenter];
    
        let index: number;

        for (let i: number = 1; i <= detonationCenter.detonationRange; ++i) {
            stack.push(state.tiles[getTileIndexFromCoordinates(dimension, detonationCenter.row + i % dimension.numberOfRows, detonationCenter.column)]);
            stack.push(state.tiles[getTileIndexFromCoordinates(dimension, detonationCenter.row, detonationCenter.column + i % dimension.numberOfColumns)]);

            index = detonationCenter.row - i % dimension.numberOfRows;
            index += index < 0 ? dimension.numberOfRows : 0;
            stack.push(state.tiles[getTileIndexFromCoordinates(dimension, index, detonationCenter.column)]);

            index = detonationCenter.column - i % dimension.numberOfColumns;
            index += index < 0 ? dimension.numberOfColumns : 0;
            stack.push(state.tiles[getTileIndexFromCoordinates(dimension, detonationCenter.row, index)]);
        }

        return chainDetonation(state, stack);
    };

    export function cascadeTiles(props: IProps, state: State) : Tile.Container[][] {
        let j: number,
            dimension: IGridDimension = getGridDimension(props),
            tileUpdates: Tile.Container[][] = General.fillArray(dimension.numberOfColumns, () => []),
            reorderedTiles: Tile.Container[],
            hasDetonationTile: boolean = state.tiles.filter(t => t.detonationRange !== Tile.DetonationRange.none).length > 0,
            detonationRange: Tile.DetonationRange,
            color: Tile.Color;

        for (let i: number = 0; i < dimension.numberOfColumns; ++i) {
            reorderedTiles = [];

            for (j = dimension.numberOfRows - 1; j >= 0; --j) {
                reorderedTiles.push(state.tiles[getTileIndexFromCoordinates(dimension, j, i)]);
            }
            
            reorderedTiles = reorderedTiles.filter(t => t.color !== Tile.Color.none)
                                           .map((t, index) => state.tiles[getTileIndexFromCoordinates(dimension, index, i)].cloneWith(t.color, t.link, t.detonationRange));

            if (reorderedTiles.length < dimension.numberOfRows) {
                j = dimension.numberOfRows - reorderedTiles.length;

                while (j > 0) {
                    detonationRange = Tile.generateRandomDetonationRange(!hasDetonationTile);
                    hasDetonationTile = detonationRange !== Tile.DetonationRange.none;
                    color = Tile.getRandomColor(hasDetonationTile);
                    tileUpdates[i].push(state.tiles[getTileIndexFromCoordinates(dimension, j, i)].cloneWith(color, Tile.Link.none, detonationRange));
                    --j;
                }
            }
        }
        
        return tileUpdates;
    };

    function reduceTile(state: State, visited: General.IDictionary<boolean>, stack: Tile.Container[]) : General.IDictionary<Tile.Container> {
        const group: General.IDictionary<Tile.Container> = {};

        let tile: Tile.Container,
            neighbors: General.IDictionary<number>,
            neighbor: Tile.Container;

        while (stack.length > 0) {
            tile = stack.pop() as Tile.Container;

            if (!visited[tile.index]) {
                visited[tile.index] = true;
                group[tile.index] = tile.cloneWith(tile.color, Tile.Link.none, tile.detonationRange);
                neighbors = state.graph[tile.index];

                for (let i: number = 0; i < Tile.neighborIndices.length; ++i) {
                    new Maybe(neighbors[Tile.neighborIndices[i]]).justDo(index => {
                        neighbor = state.tiles[index];

                        if (neighbor.color == tile.color && tile.color !== Tile.Color.none && !visited[tile.index]) {
                            stack.push(neighbor);
                            group[tile.index].link |= Tile.neighborIndices[i];
                        }
                    });
                }
            }
        }

        return group;
    };

    export interface Reduction {
        readonly collapsingTiles: number[];
        readonly tiles: Tile.Container[];
    };

    export function reduceTiles(state: State) : Reduction {
        const visited: General.IDictionary<boolean> = {};

        let keys: string[],
            index: number,
            meetsReductionCriteria: boolean,
            group: General.IDictionary<Tile.Container>,
            reduction: Reduction = {
                collapsingTiles: General.fillArray(Tile.numberOfColors, () => 0),
                tiles: []
            };

        for (let i: number = 0; i < state.tiles.length; ++i) {
            group = reduceTile(state, visited, [state.tiles[i]]);
            keys = Object.keys(group);

            if (keys.length > 0) {
                meetsReductionCriteria = keys.length > minimumTileChainLength;

                for (let j: number = 0; j < keys.length; ++j) {
                    index = parseInt(keys[j]);
                    reduction.tiles[index] = group[index];
                    reduction.tiles[index].color = Tile.Color.none;
                }

                if (meetsReductionCriteria) {
                    reduction.collapsingTiles[state.tiles[i].color] += keys.length;
                }
            }
        }

        return reduction;
    };

    function rotateTilesFromRotationMap(dimension: IGridDimension, state: State, centerTile: Tile.Container, rotationMap: number[][]) : General.IDictionary<Tile.Container> {
        const rotatedTiles: General.IDictionary<Tile.Container> = {};
        
        let to: number[],
            from: number[],
            toTile: Tile.Container,
            fromTile: Tile.Container;

        for (let i = 0; i < rotationMap.length; ++i) {
            from = i > 0 ? rotationMap[i - 1] : rotationMap[rotationMap.length - 1];
            to = rotationMap[i];
            toTile = state.tiles[getTileIndexFromCoordinates(dimension, centerTile.row + to[0], centerTile.column + to[1])]
            fromTile = state.tiles[getTileIndexFromCoordinates(dimension, centerTile.row + from[0], centerTile.column + from[1])];
            rotatedTiles[toTile.index] = toTile.cloneWith(fromTile.color, fromTile.link, fromTile.detonationRange);
        }

        return rotatedTiles;
    };

    export function rotateTiles(props: IProps, state: State) : General.IDictionary<Tile.Container> {
        const dimension: IGridDimension = getGridDimension(props),
              centerTile: Tile.Container = state.tiles[getTileIndexFromCoordinates(dimension, state.row, state.column)];

        let key: Tile.Link = Tile.Link.none;

        key |= centerTile.row === 0 ? Tile.Link.top : Tile.Link.none;
        key |= centerTile.row === dimension.numberOfRows - 1 ? Tile.Link.bottom : Tile.Link.none;
        key |= centerTile.column === 0 ? Tile.Link.left : Tile.Link.none;
        key |= centerTile.column === dimension.numberOfColumns - 1 ? Tile.Link.right : Tile.Link.none;

        return rotateTilesFromRotationMap(dimension, state, centerTile, rotationMaps[key]);
    };

    export function generateTiles(dimension: IGridDimension) : Tile.Container[] {
        const tiles: Tile.Container[] = [];

        for (let i: number = 0; i < dimension.numberOfRows; ++i) {
            for (let j: number = 0; j < dimension.numberOfColumns; ++j) {
                tiles.push(new Tile.Container(i, j, getTileIndexFromCoordinates(dimension, i, j), Tile.getRandomColor()));
            }
        }

        return tiles;
    };

    export const movementFunctions: General.IDictionary<(props: IProps, state: State) => number> = {
        [Tile.Link.top]: (props, state) => state.row > 0 ? state.row - 1 : getGridDimension(props).numberOfRows - 1,
        [Tile.Link.bottom]: (props, state) => state.row < getGridDimension(props).numberOfRows - 1 ? state.row + 1 : 0,
        [Tile.Link.right]: (props, state) => state.column < getGridDimension(props).numberOfColumns - 1 ? state.column + 1 : 0,
        [Tile.Link.left]: (props, state) => state.column > 0 ? state.column - 1 : getGridDimension(props).numberOfColumns - 1
    };
};