import * as GameUtilities from './game';
import * as GeneralUtilities from './general';
import { Maybe } from './maybe';

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

enum DetonationRange {
    none = 0,
    small,
    medium,
    large
}

class Container {
    private static readonly reverseLinkRelations: GeneralUtilities.IDictionary<Link> = {
        [Link.top]: Link.bottom,
        [Link.bottom]: Link.top,
        [Link.right]: Link.left,
        [Link.left]: Link.right
    };

    public static readonly neighborIndices: Link[] = [
        Link.top,
        Link.right,
        Link.bottom,
        Link.left
    ];

    public static readonly dimension: number = 50;
    public static readonly margin: number = 5;
    public static readonly dimensionWithMargin: number = Container.dimension + Container.margin;
    public static readonly selectedPadding: number = 7;
    public static readonly selectedPlacementModifier: number = Container.margin + Container.selectedPadding;
    public static readonly selectedDimensionModifier: number = 2 * (Container.margin + Container.selectedPadding);
    public static readonly linkClasses: string[] = GeneralUtilities.getNumericEnumKeys(Link).map(l => `tile-link-${GeneralUtilities.formatCamelCaseString(Link[parseInt(l, 10)])}`);
    public static readonly numberOfColors: number = GeneralUtilities.getNumericEnumKeys(Color).length - 1;

    public static getRandomColor(hasDetonationRange: boolean = false): number {
        return hasDetonationRange ? Color.transparent : (Math.floor(Math.random() * Container.numberOfColors) + 1);
    }

    public static reverseLinkDirection(linkIndex: Link): Link {
        return new Maybe(Container.reverseLinkRelations[linkIndex]).getOrDefault(Link.none);
    }

    public static generateRandomDetonationRange(canDetonate: boolean): DetonationRange {
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

    public readonly row: number;
    public readonly column: number;
    public readonly index: number;
    public readonly color: Color;
    public readonly link: Link;
    public readonly detonationRange: DetonationRange;

    public cloneWith(color: Color, detonationRange: DetonationRange, link?: Link,): Container {
        return new Container(this.row, this.column, this.index, color, detonationRange, new Maybe(link).getOrDefault(Link.none));
    }

    public clone(): Container {
        return new Container(this.row, this.column, this.index, this.color, this.detonationRange, this.link);
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
    mode: GameUtilities.Mode;
    selectedRow: number;
    detonationRange: DetonationRange;
    selectedColumn: number;
    link: Link;
    onUpdate: (row: number, column: number) => void;
}

export {
    Link,
    Color,
    DetonationRange,
    Container,
    IProps
};