import { Game } from './game';

export namespace Combo {
    export const stageDurationModifier: number = 10;
    export const decrementInterval: number = 17;
    export const minimumViableCombo: number = 2;

    export enum CssClass {
        healthy = 'healthy-combo',
        warning = 'warning-combo',
        danger = 'danger-combo'
    };

    export const totalDurationBases: number[] = [
        5000,
        4500,
        4000,
        3500,
        3000
    ];
    
    export function getClassFromMillisecondsRemaining(milliseconds: number, difficulty: Game.Difficulty, stage: number) : CssClass {
        const totalDuration: number = totalDurationBases[difficulty] + (stage * stageDurationModifier);

        if (milliseconds < totalDuration / 3) {
            return CssClass.danger;
        }

        if (milliseconds < 2 * totalDuration / 3) {
            return CssClass.warning;
        }

        return CssClass.healthy;
    };
};