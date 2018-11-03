export namespace Tile {
    export const dimension: number = 50;
    export const margin: number = 5;
    export const dimensionWithMargin: number = dimension + margin;
    export const selectedPadding: number = 7;
    export const selectedPlacementModifier: number = margin + selectedPadding;
    export const selectedDimensionModifier: number = 2 * (margin + selectedPadding);
};