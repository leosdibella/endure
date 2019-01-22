import { IDictionary } from '../interfaces/iDictionary';
import { IGridProps } from '../interfaces/iGridProps';
import { IGridReduction } from '../interfaces/iGridReduction';
import { Boundary, Color, DetonationRange, GridMode, Orientation } from '../utilities/enum';
import { rotationMaps } from '../utilities/rotation';
import * as Shared from '../utilities/shared';
import { Animator } from './animator';
import { GridDefinition } from './gridDefinition';
import { TileContainer } from './tileContainer';

export class GridState {
    private static readonly minimumTileChainLength: number = 5;

    private static iterateThroughStack(state: GridState,
                                       stack: TileContainer[],
                                       visited: IDictionary<boolean>,
                                       beforeExtending: (tile: TileContainer) => void,
                                       extend: (tile: TileContainer, neighbor: TileContainer, linkIndex: Boundary) => boolean): void {
        let tile: TileContainer,
            neighbors: IDictionary<number>;

        while (stack.length > 0) {
            tile = stack.pop() as TileContainer;

            if (!visited[tile.index]) {
                visited[tile.index] = true;
                neighbors = state.neighborGraph[tile.index];
                beforeExtending(tile);

                TileContainer.neighborIndices.forEach(linkIndex => {
                    const neighborIndex: number | undefined = neighbors[linkIndex];

                    if (Shared.isInteger(neighborIndex)) {
                        const neighbor: TileContainer = state.tiles[neighborIndex];

                        if (!visited[neighbor.index] && extend(tile, neighbor, linkIndex)) {
                            stack.push(neighbor);
                        }
                    }
                });
            }
        }
    }

    private static rotateTilesFromRotationMap(state: GridState, centerTile: TileContainer, rotationMap: number[][]): TileContainer[] {
        const rotatedTiles: TileContainer[] = [];

        rotationMap.forEach(map => {
            rotatedTiles.push(state.gridDefinition.getTile(state.tiles, centerTile.row + map[0], centerTile.column + map[1]));
        });

        return rotatedTiles;
    }

    private static reduceTile(state: GridState, visited: IDictionary<boolean>, stack: TileContainer[]): IDictionary<Boundary> {
        const group: IDictionary<Boundary> = {};

        GridState.iterateThroughStack(state,
                                      stack,
                                      visited,
                                      tile => group[tile.index] = Shared.castSafeOr(group[tile.index], Boundary.none),
                                      (tile, neighbor, linkIndex) => {
                                          if (tile.color === neighbor.color) {
                                              group[tile.index] |= linkIndex;
                                              group[neighbor.index] = Shared.castSafeOr(group[neighbor.index], Boundary.none) | TileContainer.reverseBoundaryDirection(linkIndex);

                                              return true;
                                          }

                                          return false;
                                      });

        return group;
    }

    public static rotateTiles(state: GridState, centerTile: TileContainer): TileContainer[] {
        const tiles: TileContainer[] = state.tiles.slice();

        let key: Boundary = centerTile.row === 0 ? Boundary.top : Boundary.none;

        key |= centerTile.row === state.gridDefinition.numberOfRows - 1 ? Boundary.bottom : Boundary.none;
        key |= centerTile.column === 0 ? Boundary.left : Boundary.none;
        key |= centerTile.column === state.gridDefinition.numberOfColumns - 1 ? Boundary.right : Boundary.none;

        GridState.rotateTilesFromRotationMap(state, centerTile, rotationMaps[key]).forEach((value, index, array) => {
            const nexTile: TileContainer = tiles[array[index === array.length - 1 ? 0 : index + 1].index];

            tiles[nexTile.index] = nexTile.cloneWith(value.color, value.detonationRange);
        });

        return tiles;
    }

    public static reduceTiles(state: GridState): IGridReduction {
        const visited: IDictionary<boolean> = {},
              collapsingTiles: TileContainer[] = state.tiles.slice(),
              tiles: TileContainer[] = [];

        let numberOfCollapsingTiles: number = 0;

        state.tiles.forEach(tile => {
            if (tile.color !== Color.transparent) {
                const group: IDictionary<Boundary> = GridState.reduceTile(state, visited, [tile]),
                      keys = Object.keys(group);

                keys.forEach(key => {
                    const index: number = parseInt(key, Shared.decimalBase);

                    tiles[index] = state.tiles[index].cloneWith(tile.color, tile.detonationRange, group[key]);
                });

                if (keys.length >= GridState.minimumTileChainLength) {
                    numberOfCollapsingTiles += keys.length;

                    keys.forEach(key => {
                        const index: number = parseInt(key, Shared.decimalBase);

                        collapsingTiles[index] = state.tiles[index].cloneWith(Color.transparent, DetonationRange.none);
                    });
                }
            } else {
                if (tile.detonationRange === DetonationRange.none) {
                    ++numberOfCollapsingTiles;
                }

                tiles[tile.index] = tile;
            }
        });

        return {
            collapsingTiles,
            numberOfCollapsingTiles,
            tiles
        };
    }

    public static cascadeTiles(props: IGridProps, state: GridState): TileContainer[] {
        const tiles: TileContainer[] = [],
              majorDimension: number = props.orientation === Orientation.portrait ? state.gridDefinition.numberOfColumns : state.gridDefinition.numberOfRows,
              minorDimension: number = props.orientation === Orientation.portrait ? state.gridDefinition.numberOfRows : state.gridDefinition.numberOfColumns;

        let hasDetonationTile: boolean = state.tiles.filter(t => t.detonationRange !== DetonationRange.none).length > 0;

        Shared.iterate(majorDimension, majorIndex => {
            const minorVector: TileContainer[] = Shared.fillArray(minorDimension, minorIndex => {
                const row: number = props.orientation === Orientation.portrait ? minorIndex : majorIndex,
                      column: number = props.orientation === Orientation.portrait ? majorIndex : minorIndex;

                return state.gridDefinition.getTile(state.tiles, row, column);
            }).filter(t => t.color !== Color.transparent || t.detonationRange !== DetonationRange.none),
                 minorExtensionDimension: number = minorDimension - minorVector.length;

            Shared.fillArray(minorExtensionDimension, minorIndex => {
                const row: number = props.orientation === Orientation.portrait ? minorIndex : majorIndex,
                      column: number = props.orientation === Orientation.portrait ? majorIndex : minorIndex,
                      detonationRange: DetonationRange = TileContainer.generateRandomDetonationRange(!hasDetonationTile);

                hasDetonationTile = hasDetonationTile || (detonationRange !== DetonationRange.none);

                return new TileContainer(row,
                                         column,
                                         state.gridDefinition.getTileIndexFromCoordinates(row, column),
                                         TileContainer.getRandomColor(detonationRange !== DetonationRange.none),
                                         detonationRange);
            }).concat(minorVector.map((tile, minorIndex) => {
                const modifiedMinorIndex: number = minorExtensionDimension + minorIndex,
                      row: number = props.orientation === Orientation.portrait ? modifiedMinorIndex : majorIndex,
                      column: number = props.orientation === Orientation.portrait ? majorIndex : modifiedMinorIndex;

                return  new TileContainer(row, column, state.gridDefinition.getTileIndexFromCoordinates(row, column), tile.color, tile.detonationRange);
            })).forEach(tile => tiles.push(tile));
        });

        return tiles;
    }

    public static detonateTile(state: GridState, detonationCenter: TileContainer): TileContainer[] {
        const detonatedTiles: TileContainer[] = [],
              stack: TileContainer[] = [detonationCenter],
              tiles: TileContainer[] = state.tiles.slice();

        Shared.iterate(detonationCenter.detonationRange, i => {
            const step: number = i + 1;
            let index: number = detonationCenter.row + step;

            if (index < state.gridDefinition.numberOfRows) {
                stack.push(state.gridDefinition.getTile(state.tiles, index, detonationCenter.column));
            }

            index = detonationCenter.row - step;

            if (index >= 0) {
                stack.push(state.gridDefinition.getTile(state.tiles, index, detonationCenter.column));
            }

            index = detonationCenter.column + step;

            if (index < state.gridDefinition.numberOfColumns) {
                stack.push(state.gridDefinition.getTile(state.tiles, detonationCenter.row, index));
            }

            index = detonationCenter.column - step;

            if (index >= 0) {
                stack.push(state.gridDefinition.getTile(state.tiles, detonationCenter.row, index));
            }
        });

        GridState.iterateThroughStack(state,
                                      stack,
                                      {},
                                      tile => detonatedTiles.push(tile),
                                      (tile, neighbor) => tile.color === neighbor.color || tile.detonationRange !== DetonationRange.none);

        detonatedTiles.forEach(tile => {
            tiles[tile.index] = tile.cloneWith(Color.transparent, DetonationRange.none);
        });

        return tiles;
    }

    public static transpose(props: IGridProps, state: GridState, tiles?: TileContainer[]): GridState {
        const transposingTiles: TileContainer[] = Shared.castSafeOr(tiles, state.tiles),
              transposedTiles: TileContainer[] = [];

        let index: number = 0;

        Shared.iterate(state.gridDefinition.numberOfColumns, column => {
            Shared.iterate(state.gridDefinition.numberOfRows, row => {
                const tile: TileContainer = state.gridDefinition.getTile(transposingTiles, row, column);

                transposedTiles.push(new TileContainer(column, row, index, tile.color, tile.detonationRange));
                ++index;
            });
        });

        return new GridState(props, transposedTiles, undefined, state.column, state.row);
    }

    private initializeGraph(): IDictionary<number>[] {
        return Shared.fillArray(this.gridDefinition.numberOfRows * this.gridDefinition.numberOfColumns, index => {
            const neighbors: IDictionary<number> = {},
                  coordinates: number[] = this.gridDefinition.getTileCoordinatesFromIndex(index);

            if (coordinates[0] > 0) {
                neighbors[Boundary.top] = this.gridDefinition.getTileIndexFromCoordinates(coordinates[0] - 1, coordinates[1]);
            }

            if (coordinates[1] < this.gridDefinition.numberOfColumns - 1) {
                neighbors[Boundary.right] = this.gridDefinition.getTileIndexFromCoordinates(coordinates[0], coordinates[1] + 1);
            }

            if (coordinates[0] < this.gridDefinition.numberOfRows - 1) {
                neighbors[Boundary.bottom] = this.gridDefinition.getTileIndexFromCoordinates(coordinates[0] + 1, coordinates[1]);
            }

            if (coordinates[1] > 0) {
                neighbors[Boundary.left] = this.gridDefinition.getTileIndexFromCoordinates(coordinates[0], coordinates[1] - 1);
            }

            return neighbors;
        });
    }

    public animator?: Animator;
    public animationTimeFraction?: number;
    public tiles: TileContainer[];
    public neighborGraph: IDictionary<number>[];
    public gridDefinition: GridDefinition;
    public column: number;
    public row: number;
    public gridMode: GridMode;
    public updatedTiles: TileContainer[];

    public constructor(props: IGridProps, tiles?: TileContainer[], neighborGraph?: IDictionary<number>[], row?: number, column?: number) {
        this.gridDefinition = GridDefinition.orientedDefinitions[props.orientation];
        this.tiles = Shared.castSafeOr(tiles, this.gridDefinition.generateTiles());
        this.neighborGraph = Shared.castSafeOr(neighborGraph, this.initializeGraph());
        this.row = Shared.castSafeOr(row, this.gridDefinition.initialRow);
        this.column = Shared.castSafeOr(column, this.gridDefinition.initialColumn);
        this.gridMode = GridMode.ready;
        this.updatedTiles = this.tiles.slice();
    }
}