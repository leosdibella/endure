import { General } from './general';

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
        bottomRight = bottom | right,
        bottomLeft = bottom | left,
        rightLeft = left | right,
        topRightBottom = top | right | bottom,
        rightBottomLeft = right | bottom | left,
        topBottomLeft = bottom | left | top,
        topRightLeft = left | top | right,
        all = top | right | bottom | left
    };

    export const linkClasses: string[] = Object.keys(Link).map(l => 'tile-link-' + General.camelCaseToKebabCase(l));

    export interface Container {
        readonly row: number,
        readonly column: number,
        readonly index: number,
        colorIndex: number,
        link: number
    };
};