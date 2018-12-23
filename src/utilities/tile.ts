import * as GameUtilities from './game';
import { Maybe } from './maybe';
import * as Shared from './shared';

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
    private static readonly detonationRangeThreshold: number = 100;
    private static readonly largeDetonantionRangeThreshold: number = 99;
    private static readonly mediumDetonationRangeThreshold: number = 95;
    private static readonly smallDetonationRangeThreshold: number = 90;
    private static readonly selectedDimensionMultiplier: number = 2;

    private static readonly reverseLinkRelations: Shared.IDictionary<Link> = {
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
    public static readonly selectedDimensionModifier: number = Container.selectedPlacementModifier * Container.selectedDimensionMultiplier;
    public static readonly linkClasses: string[] = Shared.getNumericEnumKeys(Link).map(l => `tile-link-${Shared.formatCamelCaseString(Link[parseInt(l, Shared.decimalBase)])}`);
    public static readonly numberOfColors: number = Shared.getNumericEnumKeys(Color).length - 1;

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

        const randomNumber: number = Math.floor(Math.random() * Container.detonationRangeThreshold);

        if (randomNumber === Container.largeDetonantionRangeThreshold) {
            return DetonationRange.large;
        }

        if (randomNumber > Container.mediumDetonationRangeThreshold) {
            return DetonationRange.medium;
        }

        if (randomNumber > Container.smallDetonationRangeThreshold) {
            return DetonationRange.small;
        }

        return DetonationRange.none;
    }

    public cloneWith(color: Color, detonationRange: DetonationRange, link?: Link,): Container {
        return new Container(this.row, this.column, this.index, color, detonationRange, new Maybe(link).getOrDefault(Link.none));
    }

    public clone(): Container {
        return new Container(this.row, this.column, this.index, this.color, this.detonationRange, this.link);
    }

    public constructor(public readonly row: number,
                       public readonly column: number,
                       public readonly index: number,
                       public readonly color: Color,
                       public readonly detonationRange: DetonationRange = DetonationRange.none,
                       public readonly link: Link = Link.none) {
    }
}

interface IProps {
    color: Color;
    row: number;
    column: number;
    mode: GameUtilities.Mode;
    detonationRange: DetonationRange;
    additionalClassName: string;
    link: Link;
    onUpdate(row: number, column: number): void;
}

export {
    Link,
    Color,
    DetonationRange,
    Container,
    IProps
};