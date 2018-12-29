import { IDictionary } from '../interfaces/iDictionary';
import { IGridProps } from '../interfaces/iGridProps';
import { IGridReduction } from '../interfaces/iGridReduction';
import { Boundary, Color, DetonationRange, Theme } from '../utilities/enum';
import { rotationMaps } from '../utilities/rotation';
import * as Shared from '../utilities/shared';
import { GridDefinition } from './gridDefinition';
import { TileContainer } from './tileContainer';

export class GridState {
    private static readonly minimumTileChainLength: number = 4;

    private static getGridDimension(props: IGridProps): GridDefinition {
        return GridDefinition.orientedDefinitions[props.orientation];
    }

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
                neighbors = state.graph[tile.index];
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

    private static rotateTilesFromRotationMap(state: GridState, centerTile: TileContainer, rotationMap: number[][]): IDictionary<TileContainer> {
        const rotatedTiles: IDictionary<TileContainer> = {};

        let to: number[],
            from: number[],
            toTile: TileContainer,
            fromTile: TileContainer;

        rotationMap.forEach((map, index, array) => {
            from = index > 0 ? array[index - 1] : array[rotationMap.length - 1];
            to = map;
            toTile = state.tiles[state.gridDefinition.getTileIndexFromCoordinates(centerTile.row + to[0], centerTile.column + to[1])];
            fromTile = state.tiles[state.gridDefinition.getTileIndexFromCoordinates(centerTile.row + from[0], centerTile.column + from[1])];
            rotatedTiles[toTile.index] = toTile.cloneWith(fromTile.color, fromTile.detonationRange);
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

    private static addDetonationRangeToStack(state: GridState, detonationCenter: TileContainer, stack: TileContainer[]): void {
        Shared.iterate(detonationCenter.detonationRange, i => {
            let index: number = detonationCenter.row + i;

            if (index < state.gridDefinition.numberOfRows) {
                stack.push(state.tiles[state.gridDefinition.getTileIndexFromCoordinates(index, detonationCenter.column)]);
            }

            index = detonationCenter.row - i;

            if (index >= 0) {
                stack.push(state.tiles[state.gridDefinition.getTileIndexFromCoordinates(index, detonationCenter.column)]);
            }

            index = detonationCenter.column + i;

            if (index < state.gridDefinition.numberOfColumns) {
                stack.push(state.tiles[state.gridDefinition.getTileIndexFromCoordinates(detonationCenter.row, index)]);
            }

            index = detonationCenter.column - i;

            if (index >= 0) {
                stack.push(state.tiles[state.gridDefinition.getTileIndexFromCoordinates(detonationCenter.row, index)]);
            }
        });
    }

    private static chainDetonation(state: GridState, stack: TileContainer[]): TileContainer[] {
        const detonatedTiles: TileContainer[] = [];

        GridState.iterateThroughStack(state,
                                  stack,
                                  {},
                                  tile => detonatedTiles.push(tile),
                                  (tile, neighbor) => tile.color === neighbor.color || tile.detonationRange !== DetonationRange.none);

        return detonatedTiles.map(t => t.cloneWith(Color.transparent, DetonationRange.none)).sort((a, b) => a.index - b.index);
    }

    public static readonly moves: IDictionary<(state: GridState) => number> = {
        [Boundary.top]: (state) => state.row > 0 ? state.row - 1 : state.gridDefinition.numberOfRows - 1,
        [Boundary.bottom]: (state) => state.row < state.gridDefinition.numberOfRows - 1 ? state.row + 1 : 0,
        [Boundary.right]: (state) => state.column < state.gridDefinition.numberOfColumns - 1 ? state.column + 1 : 0,
        [Boundary.left]: (state) => state.column > 0 ? state.column - 1 : state.gridDefinition.numberOfColumns - 1
    };

    public static rotateTiles(state: GridState): IDictionary<TileContainer> {
        const centerTile: TileContainer = state.tiles[state.gridDefinition.getTileIndexFromCoordinates(state.row, state.column)];

        let key: Boundary = Boundary.none;

        key |= centerTile.row === 0 ? Boundary.top : Boundary.none;
        key |= centerTile.row === state.gridDefinition.numberOfRows - 1 ? Boundary.bottom : Boundary.none;
        key |= centerTile.column === 0 ? Boundary.left : Boundary.none;
        key |= centerTile.column === state.gridDefinition.numberOfColumns - 1 ? Boundary.right : Boundary.none;

        return GridState.rotateTilesFromRotationMap(state, centerTile, rotationMaps[key]);
    }

    public static reduceTiles(state: GridState): IGridReduction {
        const visited: IDictionary<boolean> = {},
              reduction: IGridReduction = {
                    collapsingTiles: Shared.fillArray(TileContainer.numberOfColors, () => 0),
                    tiles: []
              };

        state.tiles.forEach(tile => {
            const group: IDictionary<Boundary> = GridState.reduceTile(state, visited, [tile]),
                  keys = Object.keys(group);

            keys.forEach(key => {
                const index: number = parseInt(key, Shared.decimalBase);

                reduction.tiles[index] = state.tiles[index].cloneWith(tile.color, tile.detonationRange, group[key]);
            });

            if (keys.length > GridState.minimumTileChainLength) {
                reduction.collapsingTiles[tile.color] += keys.length;
            }
        });

        return reduction;
    }

    public static cascadeTiles(state: GridState): TileContainer[][] {
        const tileUpdates: TileContainer[][] = Shared.fillArray(state.gridDefinition.numberOfColumns, () => []);

        let hasDetonationTile: boolean = state.tiles.filter(t => t.detonationRange !== DetonationRange.none).length > 0,
            detonationRange: DetonationRange,
            color: Color;

        Shared.iterate(state.gridDefinition.numberOfColumns, column => {
            const reorderedTiles: TileContainer[] = Shared.fillArray(state.gridDefinition.numberOfRows, row => state.tiles[state.gridDefinition.getTileIndexFromCoordinates(row, column)], true)
                                                          .filter(t => t.color !== Color.transparent)
                                                          .map((t, index) => state.tiles[state.gridDefinition.getTileIndexFromCoordinates(index, column)].clone());

            if (reorderedTiles.length < state.gridDefinition.numberOfRows) {
                let row = state.gridDefinition.numberOfRows - reorderedTiles.length;

                while (row > 0) {
                    detonationRange = TileContainer.generateRandomDetonationRange(!hasDetonationTile);
                    hasDetonationTile = hasDetonationTile || (detonationRange !== DetonationRange.none);
                    color = TileContainer.getRandomColor(hasDetonationTile);
                    tileUpdates[column].push(state.tiles[state.gridDefinition.getTileIndexFromCoordinates(row, column)].cloneWith(color, detonationRange));
                    --row;
                }
            }
        });

        return tileUpdates;
    }

    public static detonateTile(state: GridState): TileContainer[] {
        const detonationCenter: TileContainer = state.tiles[state.gridDefinition.getTileIndexFromCoordinates(state.row, state.column)],
              stack: TileContainer[] = [detonationCenter];

        GridState.addDetonationRangeToStack(state, detonationCenter, stack);

        return GridState.chainDetonation(state, stack);
    }

    public static transpose(props: IGridProps, state: GridState): GridState {
        const transposedState: GridState = new GridState(props);

        transposedState.row = state.column;
        transposedState.column = state.row;

        let index: number = 0;

        Shared.iterate(state.gridDefinition.numberOfColumns, column => {
            Shared.iterate(state.gridDefinition.numberOfRows, row => {
                const tile: TileContainer = state.tiles[state.gridDefinition.getTileIndexFromCoordinates(row, column)];

                transposedState.tiles.push(new TileContainer(column, row, index, tile.color, tile.detonationRange));
                ++index;
            });
        });

        return transposedState;
    }

    public static getAdditionalTileClassName(props: IGridProps, state: GridState, tile: TileContainer): string {
        if (state.row === tile.row && state.column === tile.column) {
            return `${Theme[props.theme]}-tile-highlighted`;
        }

        if ((state.row === tile.row - 1 || state.row === tile.row + 1) && (state.column === tile.column - 1 || state.column === tile.column + 1)) {
            return `${Theme[props.theme]}-tile-highlighted-neighbor`;
        }

        return '';
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

    public tiles: TileContainer[];
    public graph: IDictionary<number>[];
    public gridDefinition: GridDefinition;
    public column: number;
    public row: number;
    public processingInput: boolean;

    public constructor(props: IGridProps, generateTiles: boolean = false) {
        this.gridDefinition = GridState.getGridDimension(props);
        this.tiles = generateTiles ? this.gridDefinition.generateTiles() : [];
        this.graph = this.initializeGraph();
        this.row = this.gridDefinition.initialRow;
        this.column = this.gridDefinition.initialColumn;
        this.processingInput = true;
    }
}