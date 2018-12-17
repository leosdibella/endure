import * as Game from './game';
import * as General from './general';

const dimension: number = 50;
const margin: number = 5;
const dimensionWithMargin: number = dimension + margin;
const selectedPadding: number = 7;
const selectedPlacementModifier: number = margin + selectedPadding;
const selectedDimensionModifier: number = 2 * (margin + selectedPadding);

enum Link {
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
}

enum Color {
    transparent = 0,
    red,
    green,
    blue,
    violet,
    yellow,
    orange,
    grey
}

const numberOfColors: number = General.getNumericEnumKeys(Color).length - 1;

function getRandomColor(hasDetonationRange: boolean = false): number {
    if (hasDetonationRange) {
        return Color.transparent;
    }

    return Math.floor(Math.random() * numberOfColors) + 1;
}

const neighborIndices: Link[] = [
    Link.top,
    Link.right,
    Link.bottom,
    Link.left
];

enum DetonationRange {
    none = 0,
    small,
    medium,
    large
}

function generateRandomDetonationRange(canDetonate: boolean): DetonationRange {
    if (!canDetonate) {
        return DetonationRange.none;
    }

    const randomNumber: number = Math.floor(Math.random() * 100);

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
}

const linkClasses: string[] = General.getNumericEnumKeys(Link).map(l => 'tile-link-' + General.camelCaseToKebabCase(Link[parseInt(l, 10)]));

class Container {
    public readonly row: number;
    public readonly column: number;
    public readonly index: number;
    public color: Color;
    public link: Link;
    public detonationRange: DetonationRange;

    public cloneWith(color: Color, link: Link, detonationRange: DetonationRange): Container {
        return new Container(this.row, this.column, this.index, color, detonationRange, link);
    }

    public constructor(row: number,
                       column: number,
                       index: number,
                       color: Color,
                       detonationRange: DetonationRange = DetonationRange.none,
                       link: Link = Link.none) {
        this.row = row;
        this.column = column;
        this.color = color;
        this.detonationRange = detonationRange;
        this.link = link;
        this.index = index;
    }
}

interface IProps {
    color: Color;
    row: number;
    column: number;
    mode: Game.Mode;
    selectedRow: number;
    detonationRange: DetonationRange;
    selectedColumn: number;
    link: Link;
    onUpdate: (row: number, column: number) => void;
}

export {
    dimension,
    margin,
    dimensionWithMargin,
    selectedPadding,
    selectedPlacementModifier,
    selectedDimensionModifier,
    Link,
    Color,
    numberOfColors,
    getRandomColor,
    neighborIndices,
    DetonationRange,
    generateRandomDetonationRange,
    linkClasses,
    Container,
    IProps
};