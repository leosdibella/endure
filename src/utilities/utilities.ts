export namespace Utilities {
    export function isWellDefinedValue(value: any) : boolean {
        return value !== null && value !== undefined;
    };

    export function conditionallyDistinctUnionNumericalArrays(arrayA: number[], arrayB: number[], allowDisjointArrays: boolean = true) : number[] {
        const collisions: { [key: string]: number; } = {},
              distinctUnion: number[] = []

        let value: number,
            areDisjoint: boolean = true;

        for (let i = 0; i < arrayA.length; ++i) {
            collisions[arrayA[i]] = 1;
            distinctUnion.push(arrayA[i]);
        }
        
        for (let i = 0; i < arrayB.length; ++i) {
            value = collisions[arrayB[i]];

            if (!isWellDefinedValue(value)) {
                collisions[arrayB[i]] = 1;
            } else {
                ++collisions[arrayB[i]];
                areDisjoint = false;
            }
        }

        return !allowDisjointArrays && areDisjoint ? null : distinctUnion;
    }
};