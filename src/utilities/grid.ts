import { App } from './app';
import { Game } from './game';
import { General } from './general';
import { Tile } from './tile';

export namespace Grid {
    export const numberOfTilesHigh: number = 13;
    export const numberOfTilesWide: number = 9;
    export const tileDimension: number = 60;
    export const minimumTileChainLength = 4;
    export const initialRow: number = 6;
    export const initialColumn: number = 4;

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

    export function getTileIndexFromCoordinates(row: number, column: number) : number {
        return row * numberOfTilesWide + column;
    };

    function chainDetonation(stack: Tile.Container[]) : Tile.Container[] {
        const detonatedTiles: Tile.Container[] = [],
              visited: General.IDictionary<boolean> = {};

        let tile: Tile.Container,
            neighbor: Tile.Container;

        while (stack.length > 0) {
            tile = stack.pop();
            detonatedTiles.push(tile);
            visited[tile.index] = true;

            for (let j: number = 0; j < Tile.neighborIndices.length; ++j) {
                neighbor = tile.neighbors[Tile.neighborIndices[j]];

                if (neighbor.color == tile.color && !visited[neighbor.index]) {
                    stack.push(neighbor);
                }
            }
        }

        return detonatedTiles.map(t => t.cloneWith(Tile.Color.none, Tile.Link.none, Tile.DetonationRange.none))
                             .sort((a, b) => a.index - b.index);
    };

    export function detonateTile(tiles: Tile.Container[], tile: Tile.Container) : Tile.Container[] {
        const stack: Tile.Container[] = [tile];
    
        let index: number;

        for (let i: number = 1; i <= tile.detonationRange; ++i) {
            stack.push(tiles[getTileIndexFromCoordinates(tile.row + i % numberOfTilesHigh, tile.column)]);
            stack.push(tiles[getTileIndexFromCoordinates(tile.row, tile.column + i % numberOfTilesWide)]);

            index = tile.row - i % numberOfTilesHigh;
            index += index < 0 ? numberOfTilesHigh : 0;
            stack.push(tiles[getTileIndexFromCoordinates(index, tile.column)]);

            index = tile.column - i % numberOfTilesWide;
            index += index < 0 ? numberOfTilesWide : 0;
            stack.push(tiles[getTileIndexFromCoordinates(tile.row, index)]);
        }

        return chainDetonation(stack);
    };

    export function cascadeTiles(tiles: Tile.Container[]) : Tile.Container[][] {
        let j: number,
            tileUpdates: Tile.Container[][] = General.fillArray([], numberOfTilesWide),
            reorderedTiles: Tile.Container[],
            hasDetonationTile: boolean = tiles.filter(t => t.detonationRange !== Tile.DetonationRange.none).length > 0,
            detonationRange: Tile.DetonationRange,
            color: Tile.Color;

        for (let i: number = 0; i < numberOfTilesWide; ++i) {
            reorderedTiles = [];

            for (j = numberOfTilesHigh - 1; j >= 0; --j) {
                reorderedTiles.push(tiles[getTileIndexFromCoordinates(j, i)]);
            }
            
            reorderedTiles = reorderedTiles.filter(t => t.color !== Tile.Color.none)
                                           .map((t, j) => tiles[getTileIndexFromCoordinates(j, i)].cloneWith(t.color, t.link, t.detonationRange));

            if (reorderedTiles.length < numberOfTilesHigh) {
                j = numberOfTilesHigh - reorderedTiles.length;

                while (j > 0) {
                    detonationRange = Tile.generateRandomDetonationRange(!hasDetonationTile);
                    hasDetonationTile = detonationRange !== Tile.DetonationRange.none;
                    color = Tile.getRandomColor(hasDetonationTile);
                    tileUpdates[i].push(tiles[getTileIndexFromCoordinates(j, i)].cloneWith(color, Tile.Link.none, detonationRange));
                    --j;
                }
            }
        }
        
        return tileUpdates;
    };

    function reduceTile(visited: General.IDictionary<boolean>, stack: Tile.Container[]) : General.IDictionary<Tile.Container> {
        const group: General.IDictionary<Tile.Container> = {};

        let tile: Tile.Container,
            neighbor: Tile.Container;

        while (stack.length > 0) {
            tile = stack.pop();

            if (!visited[tile.index]) {
                visited[tile.index] = true;
                group[tile.index] = tile.cloneWith(tile.color, Tile.Link.none, tile.detonationRange);

                for (let j: number = 0; j < Tile.neighborIndices.length; ++j) {
                    neighbor = tile.neighbors[Tile.neighborIndices[j]];
    
                    if (neighbor.color == tile.color && tile.color !== Tile.Color.none && !visited[tile.index]) {
                        stack.push(neighbor);
                        group[tile.index].link |= Tile.neighborIndices[j];
                    }
                }
            }
        }

        return group;
    };

    export interface Reduction {
        readonly collapsingTiles: number[];
        readonly tiles: Tile.Container[];
    };

    export function reduceTiles(tiles: Tile.Container[]) : Reduction {
        const visited: General.IDictionary<boolean> = {};

        let keys: string[],
            index: number,
            meetsReductionCriteria: boolean,
            group: General.IDictionary<Tile.Container>,
            reduction: Reduction = {
                collapsingTiles: General.fillArray(0, Tile.numberOfColors),
                tiles: General.fillArray(undefined, tiles.length)
            };

        for (let i: number = 0; i < tiles.length; ++i) {
            group = reduceTile(visited, [tiles[i]]);
            keys = Object.keys(group);

            if (keys.length > 0) {
                meetsReductionCriteria = keys.length > minimumTileChainLength;

                for (let j: number = 0; j < keys.length; ++j) {
                    index = parseInt(keys[j]);
                    reduction.tiles[index] = group[index];
                    reduction.tiles[index].color = Tile.Color.none;
                }

                if (meetsReductionCriteria) {
                    reduction.collapsingTiles[tiles[i].color] += keys.length;
                }
            }
        }

        return reduction;
    };

    function rotateTilesFromRotationMap(tiles: Tile.Container[], centerTile: Tile.Container, rotationMap: number[][]) : General.IDictionary<Tile.Container> {
        const rotatedTiles: General.IDictionary<Tile.Container> = {};
        
        let to: number[],
            from: number[],
            toTile: Tile.Container,
            fromTile: Tile.Container;

        for (let i = 0; i < rotationMap.length; ++i) {
            from = i > 0 ? rotationMap[i - 1] : rotationMap[rotationMap.length - 1];
            to = rotationMap[i];
            toTile = tiles[getTileIndexFromCoordinates(centerTile.row + to[0], centerTile.column + to[1])]
            fromTile = tiles[getTileIndexFromCoordinates(centerTile.row + from[0], centerTile.column + from[1])];
            rotatedTiles[toTile.index] = toTile.cloneWith(fromTile.color, fromTile.link, fromTile.detonationRange);
        }

        return rotatedTiles;
    };

    export function rotateTiles(tiles: Tile.Container[], centerTile: Tile.Container) : General.IDictionary<Tile.Container> {
        let key: Tile.Link = Tile.Link.none;

        key |= centerTile.row === 0 ? Tile.Link.top : Tile.Link.none;
        key |= centerTile.row === numberOfTilesHigh - 1 ? Tile.Link.bottom : Tile.Link.none;
        key |= centerTile.column === 0 ? Tile.Link.left : Tile.Link.none;
        key |= centerTile.column === numberOfTilesWide - 1 ? Tile.Link.right : Tile.Link.none;

        return rotateTilesFromRotationMap(tiles, centerTile, rotationMaps[key]);
    };

    export class State {
        tiles: Tile.Container[];
        column: number;
        row: number;
        processingInput: boolean;

        constructor() {
            this.tiles = [];
            this.row = initialRow;
            this.column = initialColumn;
            this.processingInput = true;
        };
    };
    
    export interface IProps {
        theme: App.Theme;
        orientation: App.Orientation;
        mode: Game.Mode;
        readonly onUpdate: (updates: Game.IUpdate) => void;
    };
};