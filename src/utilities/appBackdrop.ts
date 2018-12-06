import { App } from './app';

export namespace AppBackdrop {
    export interface IProps {
        theme: App.Theme;
        orientation: App.Orientation;
    };

    const topMarginHeight: number = 100;
    const lineHeight: number = 25;
    export const numberOfBinderHoles: number = 3;

    function calculateNumberOfLines() : number {
        return Math.floor((window.innerHeight - topMarginHeight) / lineHeight);
    };
    
    export class State {
        numberOfLines: number;

        constructor() {
            this.numberOfLines = calculateNumberOfLines();
        };
    };
};