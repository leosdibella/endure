import { General } from './general';

export namespace Grid {
    export const numberOfTilesHigh: number = 17;
    export const numberOfTilesWide: number = 11;
    export const tileDimension: number = 60;
    export const minimumTileChainLength = 4;

    export enum Color {
        red = 'red',
        green = 'green',
        blue = 'blue',
        violet = 'violet',
        yellow = 'yellow',
        orange = 'orange'
    };

    export const colors: Color[] = [
        Color.red,
        Color.green,
        Color.blue,
        Color.orange,
        Color.violet,
        Color.yellow
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

    function reduceTile(ancestors: Grid.Tile[][], tile: Grid.Tile) : Grid.Tile[] {
        let wasReduced: boolean = false,
            tileGroup: Grid.Tile[],
            ancestor: Grid.Tile;

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

            if (ancestor.index + Grid.numberOfTilesWide === tile.index && ancestor.colorIndex === tile.colorIndex) {
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

    export function getTileCoordinatesFromIndex(index: number) : number[] {
        const column: number = index % numberOfTilesHigh;

        return [
            (index - column) / numberOfTilesHigh,
            column
        ];
    };

    export function getTileIndexFromCoordinates(row: number, column: number) : number {
        return row * numberOfTilesHigh + column;
    };

    function rotateTilesFromRotationMap(tiles: Grid.Tile[], centerTile: Grid.Tile, rotationMap: number[][]) : Grid.Tile[] {
        const rotatedTiles: Grid.Tile[] = [];
        
        let i,
            to: number[],
            from: number[],
            toIndex: number,
            fromIndex: number,
            coordinates: number[];

        for (i = 0; i < tiles.length; ++i) {
            rotatedTiles.push(tiles[i]);
        }

        for (i = 0; i < rotationMap.length; ++i) {
            from = rotationMap[i];
            to = i > 0 ? rotationMap[i - 1] : rotationMap[rotationMap.length - 1];

            toIndex = ((centerTile.row * Grid.numberOfTilesHigh) + to[0]) + (centerTile.column + to[1]);
            fromIndex = ((centerTile.row * Grid.numberOfTilesHigh) + from[0]) + (centerTile.column + from[1]);

            rotatedTiles[toIndex] = tiles[fromIndex];
            rotatedTiles[toIndex].index = toIndex;
            
            coordinates = getTileCoordinatesFromIndex(toIndex);

            rotatedTiles[toIndex].row = coordinates[0];
            rotatedTiles[toIndex].column = coordinates[1];
        }

        return rotatedTiles;
    };

    const tileRelations: { [key: string]: number[] } = {
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

    export function reduceTiles(tiles: Grid.Tile[]) : Grid.Tile[][][] {
        const colorMap: Grid.Tile[][][] = General.fillArray([], Grid.colors.length),
              ancestors: Grid.Tile[][] = General.fillArray([], Grid.numberOfTilesWide);

        let tile: Grid.Tile,
            tileGroup: Grid.Tile[];

        for (let i: number = 0; i < tiles.length; ++i) {
            tile = tiles[i];
            tileGroup = reduceTile(ancestors, tile);

            if (!General.isWellDefinedValue(tileGroup)) {
                tileGroup = [tile];
                ancestors[tile.column] = tileGroup;
                colorMap[tile.colorIndex].push(tileGroup);
            }
        }
        
        return colorMap.map(c => c.filter(ts => ts.length >= Grid.minimumTileChainLength));
    };

    export function rotateTiles(tiles: Grid.Tile[], centerTile: Grid.Tile) : Grid.Tile[] {
        let rotationMap: number[][];

        if (centerTile.row === 0) {
            if (centerTile.column === 0) {
                rotationMap = topLeftHandCornerRotationMap;
            } else if (centerTile.column === Grid.numberOfTilesWide - 1) {
                rotationMap = topRightHandCornerRotationMap;
            } else {
                rotationMap = topSideRotationMap;
            }
        } else if (centerTile.row === Grid.numberOfTilesHigh - 1) {
            if (centerTile.column === 0) {
                rotationMap = bottomLeftHandCornerRotationMap;
            } else if (centerTile.column === Grid.numberOfTilesWide - 1) {
                rotationMap = bottomRightHandCornerRotationMap;
            } else {
                rotationMap = bottomSideRotationMap;
            }
        } else if (centerTile.column === 0) {
            rotationMap = leftSideRotationMap;
        } else if (centerTile.column === Grid.numberOfTilesWide - 1) {
            rotationMap = rightSideRotationMap;
        } else {
            rotationMap = centralRotationMap;
        }

        return rotateTilesFromRotationMap(tiles, centerTile, rotationMap);
    };
};