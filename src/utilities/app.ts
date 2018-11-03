export namespace App {
    export enum View {
        dark = 'dark',
        light = 'light'
    };

    export interface Updates {
        view?: View;
    };
};