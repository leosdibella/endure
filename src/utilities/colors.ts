import { Utilities } from '../utilities/utilities';

export namespace Colors {
    enum Values {
        Red = 'red',
        Green = 'green',
        Blue = 'blue',
        Violet = 'violet',
        Yellow = 'yellow',
        Orange = 'orange'
    };

    export class Color {
        readonly name: string;
        private inverse: Color;

        getInverse() : Color {
            return this.inverse;
        }

        constructor(name: string, inverse?: Color) {
            this.name = name;

            if (Utilities.isWellDefinedValue(inverse)) {
                this.inverse = inverse;

                if (!Utilities.isWellDefinedValue(inverse.inverse)) {
                    inverse.inverse = this;
                }
            }
        };
    };

    export const RED: Color = new Color(Values.Red, new Color(Values.Green));
    export const GREEN: Color = RED.getInverse();
    export const BLUE: Color = new Color(Values.Blue, new Color(Values.Orange));
    export const ORANGE: Color = BLUE.getInverse();
    export const VIOLET: Color = new Color(Values.Violet, new Color(Values.Yellow));
    export const YELLOW: Color = VIOLET.getInverse();

    const COLORS: Color[] = [RED, GREEN, BLUE, ORANGE, VIOLET, YELLOW];

    function getRandomColorIndex(maxIndex: number) : number {
        return Math.floor(Math.random() * maxIndex);
    };

    export function getRandomColorOrdering() : Color[] {
        const indices: number[] = [],
              randomColorOrdering: Color[] = [];

        for (let i = 0; i < COLORS.length; ++i) {
            indices.push(i);
        }
        
        let index,
            lengthDifference = indices.length - randomColorOrdering.length;
        
        while (lengthDifference > 0) {
            index = getRandomColorIndex(lengthDifference);
            randomColorOrdering.push(COLORS[indices[index]]);
            indices.splice(index, 1);
            lengthDifference = indices.length - randomColorOrdering.length;
        }

        return randomColorOrdering;
    };

    export function getRandomNonMatchingColorPair() : Color[] {
        const colorPair: Color[] = [],
              randomNumber: number = getRandomColorIndex(COLORS.length);

        let anotherRandomNumber: number = randomNumber;

        colorPair.push(COLORS[randomNumber]);

        while (anotherRandomNumber === randomNumber) {
            anotherRandomNumber = getRandomColorIndex(COLORS.length);

            if (anotherRandomNumber !== randomNumber) {
                colorPair.push(COLORS[anotherRandomNumber]);
            }
        }

        return colorPair;
    };

    export function howManyColorsDoPairOfColorPairsShare(colorPairA: Color[], colorPairB: Color[]) : number {
        if (colorPairA[0] === colorPairB[0] && colorPairA[1] === colorPairB[1]) {
            return 2;
        } else if (colorPairA[0] === colorPairB[0] || colorPairA[0] === colorPairB[1] || colorPairA[1] === colorPairB[0] || colorPairA[1] === colorPairB[1]) {
            return 1;
        }

        return 0;
    };

    export class ColorSquare {
        private static readonly area: number = 4;
        readonly coordinates: Color[][] = [];

        private static mapCoordinates(source: Color[][], target: Color[][]) {
            for (let i = 0; i < ColorSquare.area; ++i) {
                target[i] = source[i];
            }
        }

        constructor() {
            for (let i = 0; i < ColorSquare.area; ++i) {
                this.coordinates.push(getRandomNonMatchingColorPair());
            }
        };

        rotateColorSquare(counterClockwise: boolean = false) : void {
            const transformedCoordinates: Color[][] = [
                counterClockwise ? this.coordinates[1] : this.coordinates[2],
                counterClockwise ? this.coordinates[3] : this.coordinates[0],
                counterClockwise ? this.coordinates[0] : this.coordinates[3],
                counterClockwise ? this.coordinates[2] : this.coordinates[1]
            ];

            ColorSquare.mapCoordinates(transformedCoordinates, this.coordinates);
        };

        flipColorSquareAlongDiagonal() : void {
            const transformedCoordinates: Color[][] = [
                this.coordinates[0],
                this.coordinates[2],
                this.coordinates[1],
                this.coordinates[3]
            ];

            ColorSquare.mapCoordinates(transformedCoordinates, this.coordinates);
        };
    }
};