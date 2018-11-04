import { General } from './general';

export namespace Grid {
    export const numberOfTilesHigh: number = 17;
    export const numberOfTilesWide: number = 11;
    export const tileDimension: number = 60;
    export const minimumTileChainLength = 4;
    export const initialRow: number = 8;
    export const initialColumn: number = 5;

    export enum Color {
        red = 'red',
        green = 'green',
        blue = 'blue',
        violet = 'violet',
        yellow = 'yellow',
        orange = 'orange',
        grey = 'grey'
    };

    export const colors: Color[] = [
        Color.red,
        Color.green,
        Color.blue,
        Color.orange,
        Color.violet,
        Color.yellow,
        Color.grey
    ];

    export function getRandomColorIndex() : number {
        return Math.floor(Math.random() * colors.length);
    };

    export interface Tile {
        row: number,
        column: number,
        index: number,
        colorIndex: number
    };

    function reduceTile(ancestors: Tile[][], tile: Tile) : Tile[] {
        let wasReduced: boolean = false,
            tileGroup: Tile[],
            ancestor: Tile;

        if (tile.column > 0) {
            tileGroup = ancestors[tile.column - 1];

            if (tileGroup.length > 0) {
                ancestor = tileGroup[tileGroup.length - 1];

                if (ancestor.index === tile.index - 1 && ancestor.colorIndex === tile.colorIndex) {
                    tileGroup.push(tile);
                    wasReduced = true;
                }
            }
        }

        tileGroup = ancestors[tile.column];

        if (tileGroup.length > 0) {
            ancestor = tileGroup[tileGroup.length - 1];

            if (ancestor.index + numberOfTilesWide === tile.index && ancestor.colorIndex === tile.colorIndex) {
                if (!wasReduced) {
                    tileGroup.push(tile);
                    wasReduced = true;
                } else {
                    ancestors[tile.column] = ancestors[tile.column - 1];
                }
            }
        }
        
        return wasReduced ? tileGroup : undefined;
    };

    export function getTileIndexFromCoordinates(row: number, column: number) : number {
        return row * numberOfTilesWide + column;
    };

    function rotateTilesFromRotationMap(tiles: Tile[], centerTile: Tile, rotationMap: number[][]) : General.Dictionary<Tile> {
        const rotatedTiles: General.Dictionary<Tile> = {};
        
        let i,
            to: number[],
            toCoordinates: number[],
            from: number[],
            toIndex: number,
            colorIndex: number;

        for (i = 0; i < rotationMap.length; ++i) {
            from = i > 0 ? rotationMap[i - 1] : rotationMap[rotationMap.length - 1];
            to = rotationMap[i];
            toCoordinates = [centerTile.row + to[0], centerTile.column + to[1]];
            toIndex = (toCoordinates[0] * numberOfTilesWide) + toCoordinates[1];
            colorIndex = tiles[((centerTile.row + from[0]) * numberOfTilesWide) + (centerTile.column + from[1])].colorIndex;

            rotatedTiles[toIndex] = {
                index: toIndex,
                colorIndex: colorIndex,
                row: toCoordinates[0],
                column: toCoordinates[1]
            };
        }

        return rotatedTiles;
    };

    const tileRelations: General.Dictionary<number[]> = {
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
        tileRelations.bottomRight,
        tileRelations.right,
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

    export function reduceTiles(tiles: Tile[]) : Tile[][][] {
        const colorMap: Tile[][][] = General.fillArray([], colors.length),
              ancestors: Tile[][] = General.fillArray([], numberOfTilesWide);

        let tile: Tile,
            tileGroup: Tile[];

        for (let i: number = 0; i < tiles.length; ++i) {
            tile = tiles[i];
            tileGroup = reduceTile(ancestors, tile);

            if (!General.isWellDefinedValue(tileGroup)) {
                tileGroup = [tile];
                ancestors[tile.column] = tileGroup;
                colorMap[tile.colorIndex].push(tileGroup);
            }
        }
        
        return colorMap.map(c => c.filter(ts => ts.length >= minimumTileChainLength));
    };

    export function rotateTiles(tiles: Tile[], centerTile: Tile) : General.Dictionary<Tile> {
        let rotationMap: number[][];

        if (centerTile.row === 0) {
            if (centerTile.column === 0) {
                rotationMap = topLeftHandCornerRotationMap;
            } else if (centerTile.column === numberOfTilesWide - 1) {
                rotationMap = topRightHandCornerRotationMap;
            } else {
                rotationMap = topSideRotationMap;
            }
        } else if (centerTile.row === numberOfTilesHigh - 1) {
            if (centerTile.column === 0) {
                rotationMap = bottomLeftHandCornerRotationMap;
            } else if (centerTile.column === numberOfTilesWide - 1) {
                rotationMap = bottomRightHandCornerRotationMap;
            } else {
                rotationMap = bottomSideRotationMap;
            }
        } else if (centerTile.column === 0) {
            rotationMap = leftSideRotationMap;
        } else if (centerTile.column === numberOfTilesWide - 1) {
            rotationMap = rightSideRotationMap;
        } else {
            rotationMap = centralRotationMap;
        }

        return rotateTilesFromRotationMap(tiles, centerTile, rotationMap);
    };
};