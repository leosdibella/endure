/// <reference path="Utilities.ts" />
namespace Utilities {
    export namespace Combo {
        export const millisecondsPerSecond: number = 1000;
        export const minimumViableCombo: number = 2;

        export enum Class {
            Healthy = 'healthy-combo',
            Warning = 'warning-combo',
            Danger = 'danger-combo'
        };
        
        export const classMap: { [key: string]: Class; } = {
            0: Class.Danger,
            1: Class.Warning,
            2: Class.Healthy,
            3: Class.Healthy
        };

        export const decrementIntervalBases: { [key: string]: number } = {
            0: 419,
            1: 379,
            2: 337,
            3: 293,
            4: 257
        };
    };
};