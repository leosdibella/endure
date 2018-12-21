import { Maybe } from './maybe';
import * as Shared from './shared';

enum Timing {
    linear = 0,
    accelerate,
    bounceEaseOut
}

const accelerationExponent: number = 4;

const timingFunctions: Shared.IDictionary<(timeFraction: number) => number> = {
    [Timing.linear]: (timeFraction: number) => timeFraction,
    [Timing.accelerate]: (timeFraction: number) => Math.pow(timeFraction, accelerationExponent),
    // TODO: Implmenet bounce function
    [Timing.bounceEaseOut]: (timeFraction: number) => timeFraction
};

class Animator {
    private pausedTime: Maybe<number>;
    private startTime: Maybe<number>;
    private id: Maybe<number>;

    private resetAnimationParameters(): void {
        this.id.justDo(cancelAnimationFrame);
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

    public animate(duration?: number, draw?: (progress: number) => void, onComplete?: () => void, timing?: Timing): void {
        this.startTime.justDo(t => {
            this.resetAnimationParameters();

            this.duration = new Maybe(duration).getOrDefault(this.duration);
            this.draw = new Maybe(draw).getOrDefault(this.draw);
            this.onComplete = new Maybe(onComplete).getOrDefault(this.onComplete);
            this.timing = new Maybe(timing).getOrDefault(this.timing);
        });

        this.startTime = new Maybe(performance.now());
        this.id = new Maybe(requestAnimationFrame(this.loopAnimation));
    }

    public cancel(): void {
        this.id.justDo(this.resetAnimationParameters);
    }

    public togglePaused(): void {
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

    public constructor(private draw: (progress: number) => void, private duration: number, private timing: Timing, private onComplete: () => void) {
        this.duration = Math.abs(duration);
        this.timing = new Maybe(Timing[timing]).mapTo(timing, Timing.linear);
        this.id = new Maybe();
        this.pausedTime = new Maybe();
        this.startTime = new Maybe();
    }
}

export {
    Timing,
    Animator
};