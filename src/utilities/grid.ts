import { General } from './general';
import { Tile } from './tile';

export namespace Grid {
    export const numberOfTilesHigh: number = 9;
    export const numberOfTilesWide: number = 9;
    export const tileDimension: number = 60;
    export const minimumTileChainLength = 4;
    export const initialRow: number = 4;
    export const initialColumn: number = 4;

    export function getTileIndexFromCoordinates(row: number, column: number) : number {
        return row * numberOfTilesWide + column;
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

    const rotationMaps: General.Dictionary<number[][]> = {
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

    const arcBoundaries: number[][] = [
        tileRelations.topLeft,
        tileRelations.topRight,
        tileRelations.bottomRight,
        tileRelations.bottomLeft
    ];

    const arcs: number[][] = [
        tileRelations.top,
        tileRelations.right,
        tileRelations.bottom,
        tileRelations.left
    ];

    function generateCircle(centerRow: number, centerColumn: number, radialIndex: number) : number[] {
        const circle: number[] = [],
              radialCardinality: number = radialIndex - 1;

        let arcBoundary: number[],
            arc: number[];

        for (let i: number = 0; i < arcBoundaries.length; ++i) {
            arcBoundary = arcBoundaries[i].map(ab => ab * radialIndex);
            arc = arcs[i].map(a => a * radialIndex);

            circle.push(getTileIndexFromCoordinates(centerRow + arcBoundary[0], centerColumn + arcBoundary[1]));

            for (let j: number = radialCardinality; j > 0; ++j) {
                circle.push(getTileIndexFromCoordinates(centerRow + arc[0] - j, centerColumn + arc[1] - j));
            }

            circle.push(getTileIndexFromCoordinates(centerRow + arc[0], centerColumn + arc[1]));

            for (let j: number = 1; j < radialCardinality; ++j) {
                circle.push(getTileIndexFromCoordinates(centerRow + arc[0] + j, centerColumn + arc[1] + j));
            }
        }

        return circle;
    };

    function generateRadialIndices() : number[][] {
        const centerRow: number = Math.floor(numberOfTilesHigh / 2),
              centerColumn: number = Math.floor(numberOfTilesWide / 2),
              numberOfRadii: number = Math.ceil(numberOfTilesWide / 2),
              radialIndices: number[][] = [
                  [getTileIndexFromCoordinates(centerRow, centerColumn)]
              ];

        for (let i: number = 1; i < numberOfRadii; ++i) {
            radialIndices.push(generateCircle(centerRow, centerColumn, i));
        }

        return radialIndices;
    };

    const radialIndices: number[][] = generateRadialIndices();

    function reduceTile(ancestors: Tile.Container[][], tile: Tile.Container) : Tile.Container[] {
        let rowReduced: boolean = false,
            columnReduced: boolean = false,
            rowTileGroup: Tile.Container[] = ancestors[tile.column - 1],
            columnTileGroup: Tile.Container[] = ancestors[tile.column],
            ancestor: Tile.Container;

        if (General.isWellDefinedValue(rowTileGroup) && rowTileGroup.length > 0) {
            ancestor = rowTileGroup.filter(t => t.colorIndex === tile.colorIndex && t.index === tile.index - 1)[0];

            if (General.isWellDefinedValue(ancestor)) {
                tile.link |= Tile.Link.left;
                ancestor.link |= Tile.Link.right;
                rowTileGroup.push(tile);
                rowReduced = true;
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
        }
        
        return (rowReduced || columnReduced) ? undefined : [tile];
    };

    function radiallyFillEmptyTiles(tiles: Tile.Container[]) : Tile.Container[] {
        let circle: number[];

        for (let i: number = 0; i < radialIndices.length; ++i) {
            circle = radialIndices[i];

            // TODO pull tiles into center using the radial indices and push new tiles in from the boundary
        }

        return tiles;
    };

    function mapReducedTiles(colorMap: Tile.Container[][][], tiles: Tile.Container[]) : Tile.Container[] {
        if (colorMap.filter(c => c.length > 0).length > 0) {
            const tileMap: General.Dictionary<Tile.Container> = {};

            let tile: Tile.Container,
                tileGroup: Tile.Container[],
                coloredTileSets: Tile.Container[][];

            for (let i: number = 0; i < colorMap.length; ++i) {
                coloredTileSets = colorMap[i];

                for (let j: number = 0; j < coloredTileSets.length; ++j) {
                    tileGroup = coloredTileSets[j];

                    for (let k: number = 0; k < tileGroup.length; ++k) {
                        tile = tileGroup[k];
                        tileMap[tile.index] = new Tile.Container(tile.row, tile.column);
                    }
                }
            }

            return radiallyFillEmptyTiles(tiles.map(t => General.isWellDefinedValue(tileMap[t.index]) ? tileMap[t.index] : t));
        }

        return undefined;
    };

    export function reduceTiles(tiles: Tile.Container[]) : Tile.Container[] {
        const colorMap: Tile.Container[][][] = General.fillArray([], Tile.colors.length),
              ancestors: Tile.Container[][] = General.fillArray([], numberOfTilesWide);

        let tile: Tile.Container,
            tileGroup: Tile.Container[];

        for (let i = 0; i < tiles.length; ++i) {
            tiles[i].link = Tile.Link.none;
        }

        for (let i = 0; i < tiles.length; ++i) {
            tile = tiles[i];
            tileGroup = reduceTile(ancestors, tile);

            if (General.isWellDefinedValue(tileGroup)) {
                ancestors[tile.column] = tileGroup;
                colorMap[tile.colorIndex].push(tileGroup);
            }
        }
        
        return mapReducedTiles(colorMap.map(c => c.filter(ts => ts.length >= minimumTileChainLength)), tiles);
    };

    function rotateTilesFromRotationMap(tiles: Tile.Container[], centerTile: Tile.Container, rotationMap: number[][]) : General.Dictionary<Tile.Container> {
        const rotatedTiles: General.Dictionary<Tile.Container> = {};
        
        let to: number[],
            toCoordinates: number[],
            from: number[],
            toIndex: number,
            colorIndex: number;

        for (let i = 0; i < rotationMap.length; ++i) {
            from = i > 0 ? rotationMap[i - 1] : rotationMap[rotationMap.length - 1];
            to = rotationMap[i];
            toCoordinates = [centerTile.row + to[0], centerTile.column + to[1]];
            toIndex = getTileIndexFromCoordinates(toCoordinates[0], toCoordinates[1]);
            colorIndex = tiles[((centerTile.row + from[0]) * numberOfTilesWide) + (centerTile.column + from[1])].colorIndex;
            rotatedTiles[toIndex] = new Tile.Container(toCoordinates[0], toCoordinates[1], colorIndex);
        }

        return rotatedTiles;
    };

    export function rotateTiles(tiles: Tile.Container[], centerTile: Tile.Container) : General.Dictionary<Tile.Container> {
        let key: Tile.Link = Tile.Link.none;

        key |= centerTile.row === 0 ? Tile.Link.top : Tile.Link.none;
        key |= centerTile.row === numberOfTilesHigh - 1 ? Tile.Link.bottom : Tile.Link.none;
        key |= centerTile.column === 0 ? Tile.Link.left : Tile.Link.none;
        key |= centerTile.column === numberOfTilesWide - 1 ? Tile.Link.right : Tile.Link.none;

        return rotateTilesFromRotationMap(tiles, centerTile, rotationMaps[key]);
    };
};