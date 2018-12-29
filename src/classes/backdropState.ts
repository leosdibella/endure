export class BackdropState {
    private static readonly topMarginHeight: number = 100;
    private static readonly lineHeight: number = 25;

    private static calculateNumberOfLines(): number {
        return Math.floor((window.innerHeight - BackdropState.topMarginHeight) / BackdropState.lineHeight);
    }

    public static readonly numberOfBinderHoles: number = 3;

    public numberOfLines: number;

    constructor() {
        this.numberOfLines = BackdropState.calculateNumberOfLines();
    }
}