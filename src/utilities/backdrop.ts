import * as App from './app';

interface IProps {
    theme: App.Theme;
    orientation: App.Orientation;
}

const topMarginHeight: number = 100;
const lineHeight: number = 25;
const numberOfBinderHoles: number = 3;

function calculateNumberOfLines(): number {
    return Math.floor((window.innerHeight - topMarginHeight) / lineHeight);
}

class State {
    public numberOfLines: number;

    constructor() {
        this.numberOfLines = calculateNumberOfLines();
    }
}

export {
    IProps,
    numberOfBinderHoles,
    State
};