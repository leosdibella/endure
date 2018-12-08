import { General } from './general';
import { Maybe } from './maybe';

export namespace Animation {
    export enum Timing {
        linear = 0,
        accelerate,
        bounceEaseOut
    }

    function makeEaseOut(timing: (timeFraction: number) => number) {
        return (timeFraction: number) => 1 - timing(1 - timeFraction);
    }

    function bounce(timeFraction: number) {
        let a: number = 0,
            b: number = 1;

        while (true) {
            if (timeFraction >= (7 - 4 * a) / 11) {
                return -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2);
            }

            a += b;
            b /= 2;
        }
    }

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
            this.timing = new Maybe(Timing[timing]).switchInto(timing, Timing.linear);
            this.id = new Maybe();
        }

        animate(duration?: number): void {
            this.startTime.justDo(t => {
                this.resetAnimationParameters();
                this.duration = new Maybe(duration).getOrDefault(this.duration);
            });

            this.startTime = new Maybe(performance.now());
            this.id = new Maybe(requestAnimationFrame(this.loopAnimation));
        }

        cancel(): void {
            this.id.justDo(this.resetAnimationParameters);
        }

        togglePaused(): void {
            this.pausedTime.justDo(pt => {
                this.startTime = new Maybe(performance.now() - (pt - this.startTime.getOrDefault(pt)));
                this.pausedTime = new Maybe();
                this.id = new Maybe(requestAnimationFrame(this.loopAnimation));
            }).otherwiseJustDo(this.id, t => {
                cancelAnimationFrame(t);
                this.id = new Maybe();
                this.pausedTime = new Maybe(performance.now());
            });
        }

        private resetAnimationParameters(): void {
            this.id.justDo(id => cancelAnimationFrame(id));
            this.id = new Maybe();
            this.startTime = new Maybe();
            this.pausedTime = new Maybe();
            this.onComplete();
        }

        private loopAnimation(time: number): void {
            let timeFraction: number = (time - this.startTime.getOrDefault(time)) / this.duration;
            timeFraction = Math.min(timeFraction, 1);

            if (timeFraction < 1) {
                this.draw(timingFunctions[this.timing](timeFraction));
                this.id = new Maybe(requestAnimationFrame(this.loopAnimation));
            } else {
                this.resetAnimationParameters();
            }
        }
    }
}