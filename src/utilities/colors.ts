import { Utilities } from '../utilities/utilities';

export namespace Colors {
    export enum Color {
        Red = 'red',
        Green = 'green',
        Blue = 'blue',
        Violet = 'violet',
        Yellow = 'yellow',
        Orange = 'orange'
    };

    export const VALUES: Color[] = [
        Color.Red,
        Color.Green,
        Color.Blue,
        Color.Orange,
        Color.Violet,
        Color.Yellow
    ];

    export function howManyColorsDoPairOfColorPairsShare(colorPairA: Color[], colorPairB: Color[], skipComparison: boolean = false) : number {
        if (colorPairA[0] === colorPairB[0] && colorPairA[1] === colorPairB[1]) {
            return 2;
        } else if (skipComparison || (colorPairA[0] === colorPairB[0] || colorPairA[0] === colorPairB[1] || colorPairA[1] === colorPairB[0] || colorPairA[1] === colorPairB[1])) {
            return 1;
        }

        return 0;
    };

    export class Square {
        private static readonly area: number = 4;
        readonly coordinates: Color[][] = [];

        private static mapCoordinates(source: Color[][], target: Color[][]) {
            for (let i = 0; i < Square.area; ++i) {
                target[i] = source[i];
            }
        }

        private static getRandomColorIndex(maxIndex: number) : number {
            return Math.floor(Math.random() * maxIndex);
        };
    
        private static getRandomNonMatchingColorPair() : Color[] {
            const colorPair: Color[] = [],
                  randomNumber: number = Square.getRandomColorIndex(VALUES.length);
    
            let anotherRandomNumber: number = randomNumber;
    
            colorPair.push(VALUES[randomNumber]);
    
            while (anotherRandomNumber === randomNumber) {
                anotherRandomNumber = Square.getRandomColorIndex(VALUES.length);
    
                if (anotherRandomNumber !== randomNumber) {
                    colorPair.push(VALUES[anotherRandomNumber]);
                }
            }
    
            return colorPair;
        };

        constructor() {
            for (let i = 0; i < Square.area; ++i) {
                this.coordinates.push(Square.getRandomNonMatchingColorPair());
            }
        };

        rotateColorSquare(counterClockwise: boolean = false) : void {
            const transformedCoordinates: Color[][] = [
                counterClockwise ? this.coordinates[1] : this.coordinates[2],
                counterClockwise ? this.coordinates[3] : this.coordinates[0],
                counterClockwise ? this.coordinates[0] : this.coordinates[3],
                counterClockwise ? this.coordinates[2] : this.coordinates[1]
            ];

            Square.mapCoordinates(transformedCoordinates, this.coordinates);
        };

        flipColorSquareAlongDiagonal() : void {
            const transformedCoordinates: Color[][] = [
                this.coordinates[0],
                this.coordinates[2],
                this.coordinates[1],
                this.coordinates[3]
            ];

            Square.mapCoordinates(transformedCoordinates, this.coordinates);
        };
    }
};