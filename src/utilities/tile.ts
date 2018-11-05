import { General } from './general';
import { Grid } from './grid';

export namespace Tile {
    export const dimension: number = 50;
    export const margin: number = 5;
    export const dimensionWithMargin: number = dimension + margin;
    export const selectedPadding: number = 7;
    export const selectedPlacementModifier: number = margin + selectedPadding;
    export const selectedDimensionModifier: number = 2 * (margin + selectedPadding);

    export enum Color {
        red = 'red',
        green = 'green',
        blue = 'blue',
        violet = 'violet',
        yellow = 'yellow',
        orange = 'orange',
        grey = 'grey'
    };

    export const colors: Color[] = Object.keys(Color).map(c => c as Color);

    export function getRandomColorIndex() : number {
        return Math.floor(Math.random() * colors.length);
    };

    export enum Link {
        none = 0,
        top = 1,
        right = 2,
        bottom = 4,
        left = 8,
        topRight = top | right,
        topBottom = top | bottom,
        topLeft = top | left,
        rightBottom = bottom | right,
        bottomLeft = bottom | left,
        rightLeft = left | right,
        topRightBottom = top | right | bottom,
        rightBottomLeft = right | bottom | left,
        topBottomLeft = bottom | left | top,
        topRightLeft = left | top | right,
        all = top | right | bottom | left
    };

    export const linkClasses: string[] = Object.keys(Link).map(l => 'tile-link-' + General.camelCaseToKebabCase(Link[parseInt(l, 10)]));

    export interface Container {
        readonly row: number,
        readonly column: number,
        readonly index: number,
        colorIndex: number,
        link: Link
    };

    export function generateTileContainer(row: number, column: number, colorIndex: number) : Container {
        return {
            index: Grid.getTileIndexFromCoordinates(row, column),
            row: row,
            column: column,
            colorIndex: colorIndex,
            link: Link.none
        };
    };
    
    export function generateTileContainers() : Container[] {
        const tiles: Container[] = [];

        for (let i = 0; i < Grid.numberOfTilesHigh; ++i) {
            for (let j = 0; j < Grid.numberOfTilesWide; ++j) {
                tiles.push(generateTileContainer(i, j, getRandomColorIndex()));
            }
        }

        return tiles;
    };
};