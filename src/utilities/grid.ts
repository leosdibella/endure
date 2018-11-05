import { General } from './general';
import { Tile } from './tile';

export namespace Grid {
    export const numberOfTilesHigh: number = 13;
    export const numberOfTilesWide: number = 9;
    export const tileDimension: number = 60;
    export const minimumTileChainLength = 4;
    export const initialRow: number = 8;
    export const initialColumn: number = 5;

    function reduceTile(ancestors: Tile.Container[][], tile: Tile.Container) : Tile.Container[] {
        let rowReduced: boolean = false,
            columnReduced: boolean = false,
            rowTileGroup: Tile.Container[],
            columnTileGroup: Tile.Container[] = ancestors[tile.column],
            ancestor: Tile.Container;

        if (tile.column > 0) {
            rowTileGroup = ancestors[tile.column - 1];

            if (rowTileGroup.length > 0) {
                ancestor = rowTileGroup.filter(t => t.colorIndex === tile.colorIndex && t.index === tile.index - 1)[0];

                if (General.isWellDefinedValue(ancestor)) {
                    tile.link |= Tile.Link.left;
                    ancestor.link |= Tile.Link.right;
                    rowTileGroup.push(tile);
                    rowReduced = true;
                }
            }
        }

        if (columnTileGroup.length > 0) {
            ancestor = columnTileGroup.filter(t => t.colorIndex === tile.colorIndex && t.index + numberOfTilesWide === tile.index)[0];

            if (General.isWellDefinedValue(ancestor)) {
                tile.link |= Tile.Link.top;
                ancestor.link |= Tile.Link.bottom;
                columnTileGroup.push(tile);
                columnReduced = true;
            }
        }

        if (rowReduced) {
            ancestors[tile.column] = rowTileGroup;
            return rowTileGroup;
        }
        
        return columnReduced ? columnTileGroup : undefined;
    };

    export function getTileIndexFromCoordinates(row: number, column: number) : number {
        return row * numberOfTilesWide + column;
    };

    function rotateTilesFromRotationMap(tiles: Tile.Container[], centerTile: Tile.Container, rotationMap: number[][]) : General.Dictionary<Tile.Container> {
        const rotatedTiles: General.Dictionary<Tile.Container> = {};
        
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
                column: toCoordinates[1],
                link: Tile.Link.none
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

    export function reduceTiles(tiles: Tile.Container[]) : Tile.Container[][][] {
        const colorMap: Tile.Container[][][] = General.fillArray([], Tile.colors.length),
              ancestors: Tile.Container[][] = General.fillArray([], numberOfTilesWide);

        let i: number,
            tile: Tile.Container,
            tileGroup: Tile.Container[];

        for (i = 0; i < tiles.length; ++i) {
            tiles[i].link = Tile.Link.none;
        }

        for (i = 0; i < tiles.length; ++i) {
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

    export function rotateTiles(tiles: Tile.Container[], centerTile: Tile.Container) : General.Dictionary<Tile.Container> {
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