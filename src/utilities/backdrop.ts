import * as AppUtilities from './app';

interface IProps {
    theme: AppUtilities.Theme;
    orientation: AppUtilities.Orientation;
}

class State {
    private static readonly topMarginHeight: number = 100;
    private static readonly lineHeight: number = 25;

    private static calculateNumberOfLines(): number {
        return Math.floor((window.innerHeight - State.topMarginHeight) / State.lineHeight);
    }

    public static readonly numberOfBinderHoles: number = 3;

    public numberOfLines: number;

    constructor() {
        this.numberOfLines = State.calculateNumberOfLines();
    }
}

export {
    IProps,
    State
};