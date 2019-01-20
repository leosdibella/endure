import { IDictionary } from '../interfaces/iDictionary';
import { Boundary, Color, DetonationRange } from '../utilities/enum';
import * as Shared from '../utilities/shared';

export class TileContainer {
    private static readonly detonationRangeThreshold: number = 101;
    private static readonly largeDetonantionRangeThreshold: number = 98;
    private static readonly mediumDetonationRangeThreshold: number = 94;
    private static readonly smallDetonationRangeThreshold: number = 86;

    private static readonly reverseBoundaryRelations: IDictionary<Boundary> = {
        [Boundary.top]: Boundary.bottom,
        [Boundary.bottom]: Boundary.top,
        [Boundary.right]: Boundary.left,
        [Boundary.left]: Boundary.right
    };

    public static readonly neighborIndices: Boundary[] = [
        Boundary.top,
        Boundary.right,
        Boundary.bottom,
        Boundary.left
    ];

    public static readonly numberOfColors: number = Shared.getNumericEnumKeys(Color).length;

    public static getRandomColor(hasDetonationRange: boolean = false): number {
        return hasDetonationRange ? Color.transparent : (Math.floor(Math.random() * (TileContainer.numberOfColors - 1)) + 1);
    }

    public static reverseBoundaryDirection(boundaryIndex: Boundary): Boundary {
        return Shared.castSafeOr(TileContainer.reverseBoundaryRelations[boundaryIndex], Boundary.none);
    }

    public static generateRandomDetonationRange(canDetonate: boolean): DetonationRange {
        const sample: number = canDetonate ? Math.floor(Math.random() * TileContainer.detonationRangeThreshold) : 0;

        switch (true) {
            case (sample > TileContainer.largeDetonantionRangeThreshold): return DetonationRange.large;
            case (sample > TileContainer.mediumDetonationRangeThreshold): return DetonationRange.medium;
            case (sample > TileContainer.smallDetonationRangeThreshold): return DetonationRange.small;
            default: return DetonationRange.none;
        }
    }

    public cloneWith(color: Color, detonationRange: DetonationRange, boundary?: Boundary,): TileContainer {
        return new TileContainer(this.row, this.column, this.index, color, detonationRange, Shared.castSafeOr(boundary, Boundary.none));
    }

    public constructor(public readonly row: number,
                       public readonly column: number,
                       public readonly index: number,
                       public readonly color: Color,
                       public readonly detonationRange: DetonationRange = DetonationRange.none,
                       public readonly boundary: Boundary = Boundary.none) {
    }
}