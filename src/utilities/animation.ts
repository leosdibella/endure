import { General } from './general';
import { Maybe } from './maybe';

export namespace Animation {
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

    export class Animator {
        private readonly draw: (progress: number) => void;
        private readonly onComplete: () => void;
        private readonly timing: Timing;
        private duration: number;
        private pausedTime: Maybe<number>;
        private startTime: Maybe<number>;
        private id: Maybe<number>;
        
        constructor(draw: (progress: number) => void, duration: number, timing: Timing, onComplete: () => void) {
            this.draw = draw;
            this.onComplete = onComplete;
            this.duration = duration;
            this.timing = Maybe.maybe(Timing[timing]).switchInto(timing, Timing.linear);
            this.id = Maybe.nothing();
        };

        private resetAnimationParameters() : void {
            this.id.justDo(id => cancelAnimationFrame(id));
            this.id = Maybe.nothing();
            this.startTime = Maybe.nothing();
            this.pausedTime = Maybe.nothing();
            this.onComplete();
        };

        private loopAnimation(time: number) : void {
            let timeFraction: number = (time - this.startTime.getOrDefault(time)) / this.duration;
            timeFraction = Math.min(timeFraction, 1);
    
            if (timeFraction < 1) {
                this.draw(timingFunctions[this.timing](timeFraction));
                this.id = Maybe.just(requestAnimationFrame(this.loopAnimation));
            } else {
                this.resetAnimationParameters();
            }
        };

        animate(duration?: number) : void {
            this.startTime.justDo(t => {
                this.resetAnimationParameters();
                this.duration = Maybe.maybe(duration).getOrDefault(this.duration);
            });

            this.startTime = Maybe.just(performance.now());
            this.id = Maybe.just(requestAnimationFrame(this.loopAnimation));
        };

        cancel() : void {
            this.id.justDo(this.resetAnimationParameters);
        };

        togglePaused() : void {
            this.pausedTime.justDo(pt => {
                this.startTime = Maybe.just(performance.now() - (pt- this.startTime.getOrDefault(pt)));
                this.pausedTime = Maybe.nothing();
                this.id = Maybe.just(requestAnimationFrame(this.loopAnimation));
            }).otherwiseDo(this.id, t => {
                cancelAnimationFrame(t);
                this.id = Maybe.nothing();
                this.pausedTime = Maybe.just(performance.now());
            });
        };
    };
};