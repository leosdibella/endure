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
            this.inverse = inverse;

            if (!Utilities.isWellDefinedValue(inverse.inverse)) {
                inverse.inverse = this;
            }
        };
    };

    export const RED: Color = new Color(Values.Red, new Color(Values.Green));
    export const GREEN: Color = RED.getInverse();
    export const BLUE: Color = new Color(Values.Blue, new Color(Values.Orange));
    export const ORANGE: Color = BLUE.getInverse();
    export const VIOLET: Color = new Color(Values.Red, new Color(Values.Yellow));
    export const YELLOW: Color = VIOLET.getInverse();
};