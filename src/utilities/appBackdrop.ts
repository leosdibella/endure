export namespace AppBackdrop {
    export const topMarginHeight: number = 100;
    export const sideMarginWidth: number = 75;
    export const lineHeight: number = 25;
    export const numberOfBinderHoles: number = 3;

    export function calculateNumberOfLines() : number {
        return Math.floor((window.innerHeight - topMarginHeight) / lineHeight);
    };
};