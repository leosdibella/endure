export namespace App {
    export enum Theme {
        dark = 'dark',
        light = 'light'
    };

    export enum Orientation {
        portrait = 0,
        landscape
    };

    export interface Updates {
        theme?: Theme;
    };

    export function getOrientation() : Orientation {
        if (window.innerWidth / window.innerHeight > 1) {
            return Orientation.landscape;
        }

        return Orientation.portrait;
    };
};