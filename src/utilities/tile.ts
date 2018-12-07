import { Game } from './game';
import { General } from './general';
import { Grid } from './grid';

export namespace Tile {
    export const dimension: number = 50;
    export const margin: number = 5;
    export const dimensionWithMargin: number = dimension + margin;
    export const selectedPadding: number = 7;
    export const selectedPlacementModifier: number = margin + selectedPadding;
    export const selectedDimensionModifier: number = 2 * (margin + selectedPadding);

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

    export enum Color {
        none = 0,
        red,
        green,
        blue,
        violet,
        yellow,
        orange,
        grey
    };

    export const numberOfColors: number = Object.keys(Color).length - 1;

    export function getRandomColor(hasDetonationRange: boolean = false) : number {
        if (hasDetonationRange) {
            return Color.none;
        }

        return Math.floor(Math.random() * numberOfColors) + 1;
    };

    export const neighborIndices: Link[] = [
        Link.top,
        Link.right,
        Link.bottom,
        Link.left
    ];

    export enum DetonationRange {
        none = 0,
        small,
        medium,
        large
    };

    export function generateRandomDetonationRange(canDetonate: boolean) : DetonationRange {
        if (!canDetonate) {
            return DetonationRange.none;
        }

        let randomNumber: number = Math.floor(Math.random() * 100);

        if (randomNumber === 99) {
            return DetonationRange.large;
        }
        
        if (randomNumber > 95) {
            return DetonationRange.medium;
        }

        if (randomNumber > 90) {
            return DetonationRange.small;
        }

        return DetonationRange.none;
    };

    export const linkClasses: string[] = Object.keys(Link).map(l => 'tile-link-' + General.camelCaseToKebabCase(Link[parseInt(l)]));

    export class Container {
        readonly row: number;
        readonly column: number;
        readonly index: number;
        color: Tile.Color;
        link: Link;
        detonationRange: DetonationRange;

        constructor(row: number,
                    column: number,
                    index: number,
                    color: Tile.Color,
                    detonationRange: DetonationRange = DetonationRange.none,
                    link: Link = Link.none) {
            this.row = row;
            this.column = column;
            this.color = color;
            this.detonationRange = detonationRange;
            this.link = link;
            this.index = index;
        };

        cloneWith(color: Color, link: Link, detonationRange: DetonationRange) : Container {
            return new Container(this.row, this.column, this.index, color, detonationRange, link);
        };
    };

    export interface IProps {
        color: Color;
        row: number;
        column: number;
        mode: Game.Mode;
        selectedRow: number;
        detonationRange: DetonationRange;
        selectedColumn: number;
        link: Link,
        onUpdate: (row: number, column: number) => void;
    };
};