import { General } from './general';

export namespace Animate {
    export enum Timing {
        linear = 0,
        accelerate,
        bounceEaseOut
    };

    function makeEaseOut(timing: (timeFraction: number) => number) {
        return function(timeFraction: number) {
            return 1 - timing(1 - timeFraction);
        }
    };

    function bounce(timeFraction: number) {
        let a: number = 0,
            b: number = 1;

        while (true) {
            if (timeFraction >= (7 - 4 * a) / 11) {
                return -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2);
            }

            a += b;
            b /= 2;
        };
    };

    const timingFunctions: General.IDictionary<(timeFraction: number) => number> = {
        [Timing.linear]: (timeFraction: number) => timeFraction,
        [Timing.accelerate]: (timeFraction: number) => Math.pow(timeFraction, 4),
        [Timing.bounceEaseOut]: makeEaseOut(bounce)
    };

    export class Animation {
        private readonly draw: (progress: number) => void;
        private readonly callback: () => void;
        private readonly timing: Timing;
        private duration: number;
        private pausedTime: number;
        private startTime: number;
        private id: number;
        
        constructor(draw: (progress: number) => void, duration: number, timing: Timing, callback: () => void = undefined) {
            this.draw = draw;
            this.callback = callback;
            this.duration = duration;
            this.timing = General.castSafeOr(timing, Timing.linear);
            this.id = undefined;
        };

        private resetAnimationParameters(drawFinalFrame: boolean = false) : void {
            if (General.isWellDefinedValue(this.id)) {
                cancelAnimationFrame(this.id);
            }

            this.id = undefined;
            this.startTime = undefined;
            this.pausedTime = undefined;

            if (drawFinalFrame) {
                this.draw(1);
            }

            if (General.isWellDefinedValue(this.callback)) {
                this.callback();
            }
        };

        private animate(time: number) : void {
            let timeFraction = (time - this.startTime) / this.duration;
            timeFraction = Math.min(timeFraction, 1);
    
            if (timeFraction < 1) {
                this.draw(timingFunctions[this.timing](timeFraction));
                this.id = requestAnimationFrame(this.animate);
            } else {
                this.resetAnimationParameters(true);
            }
        };

        start(duration: number = undefined) : void {
            if (General.isWellDefinedValue(this.startTime)) {
                this.resetAnimationParameters();
                this.duration = General.castSafeOr(duration, this.duration);
            }

            this.startTime = performance.now();
            this.draw(0);
            this.id = requestAnimationFrame(this.animate);
        };

        cancel(drawFinalFrame: boolean = true) : void {
            if (General.isWellDefinedValue(this.id)) {
                this.resetAnimationParameters(drawFinalFrame);
            }
        };

        togglePaused() : void {
            if (General.isWellDefinedValue(this.pausedTime)) {
                this.startTime = performance.now() - (this.pausedTime - this.startTime);
                this.pausedTime = undefined;
                this.id = requestAnimationFrame(this.animate);
            } else if (General.isWellDefinedValue(this.id)) {
                cancelAnimationFrame(this.id);
                this.id = undefined;
                this.pausedTime = performance.now();
            }
        };
    };
};