import { Animation } from './animation';
import { App } from './app';
import { Game } from './game';
import { General } from './general';
import { Grade } from './grade';

export namespace Combo {
    enum CssClass {
        healthy = 0,
        warning,
        danger
    };

    export const durationModifiers: General.IDictionary<number> = {
        [Game.Difficulty.beginnger]: 10,
        [Game.Difficulty.low]: 15,
        [Game.Difficulty.medium]: 20,
        [Game.Difficulty.hard]: 25,
        [Game.Difficulty.expert]: 30
    };

    export const durations: General.IDictionary<number> = {
        [Game.Difficulty.beginnger]: 3000,
        [Game.Difficulty.low]: 2800,
        [Game.Difficulty.medium]: 2600,
        [Game.Difficulty.hard]: 2400,
        [Game.Difficulty.expert]: 2200
    };
    
    export const minimumViableCombo: number = 2;

    export class State {
        readonly animator: Animation.Animator;
        overlayWidthPercentage: number;
        overlayClass: string;

        constructor(draw: (timeFraction: number) => void, duration: number, callback: () => void) {
            this.animator = new Animation.Animator(draw, duration, Animation.Timing.linear, callback);
            this.overlayWidthPercentage = 0;
            this.overlayClass = '';
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
    
    export function getClassFromTimeFraction(timeFraction: number) : string {
        let cssClass: string = 'combo-';

        if (timeFraction >= 0.67) {
            cssClass += CssClass[CssClass.healthy];
        } else if (timeFraction >= 0.33) {
            cssClass += CssClass[CssClass.warning];
        } else {
            cssClass += CssClass[CssClass.danger];
        }

        return cssClass;
    };
};