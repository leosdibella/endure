import { App } from './app';
import { Game } from './game';
import { General } from './general';
import { Grade } from './grade';

export namespace Combo {
    export const stageDurationModifier: number = 10;
    export const decrementInterval: number = 17;
    export const minimumViableCombo: number = 2;

    export const totalDurationBases: number[] = [
        5000,
        4500,
        4000,
        3500,
        3000
    ];

    export class State {
        readonly timer: General.Timer;
        milliseconds: number;

        constructor(timerCallback: (milliseconds: number) => void) {
            this.milliseconds = 0;
            this.timer = new General.Timer(timerCallback);
        };
    };
    
    export interface IProps {
        theme: App.Theme,
        combo: number;
        letterGrade: Grade.LetterGrade;
        stage: number;
        difficulty: Game.Difficulty;
        mode: Game.Mode;
        readonly onUpdate: (updates: Game.IUpdate) => void;
    };
    
    function getComboColor(milliseconds: number, totalDuration: number, stage: number, theme: App.Theme) : string {
        let color: string = '';
        return color;
    };

    export function getClassFromMillisecondsRemaining(milliseconds: number, difficulty: Game.Difficulty, stage: number, theme: App.Theme) : General.ICssStyle {
        const totalDuration: number = totalDurationBases[difficulty] + (stage * stageDurationModifier),
              cssStyle: General.ICssStyle = {
                  color: getComboColor(milliseconds, totalDuration, stage, theme)
              };

        return cssStyle;
    };
};