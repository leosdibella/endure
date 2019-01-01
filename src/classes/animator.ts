import { IDictionary } from '../interfaces/iDictionary';
import { AnimationTiming } from '../utilities/enum';
import * as Shared from '../utilities/shared';

export class Animator {
    private static readonly accelerationExponent: number = 4;

    private static readonly timingFunctions: IDictionary<(timeFraction: number) => number> = {
        [AnimationTiming.linear]: (timeFraction: number) => timeFraction,
        [AnimationTiming.accelerate]: (timeFraction: number) => Math.pow(timeFraction, Animator.accelerationExponent),
        // TODO: Implmenet bounce function
        [AnimationTiming.bounceEaseOut]: (timeFraction: number) => timeFraction
    };

    private pausedTime?: number;
    private startTime?: number;
    private id?: number;
    private timingFunction: (timeFraction: number) => number;
    private onAnimate = this.loopAnimation.bind(this);

    private loopAnimation(time: number): void {
        if (Shared.isDefined(this.id)) {
            let timeFraction: number = (time - (this.startTime as number)) / this.duration;

            timeFraction = Math.min(timeFraction, 1);

            if (timeFraction < 1) {
                this.draw(this.timingFunction(timeFraction));
                this.id = requestAnimationFrame(this.onAnimate);
            } else {
                this.cancel();
                this.onComplete();
            }
        }
    }

    private animate(): void {
        this.startTime = performance.now();
        this.id = requestAnimationFrame(this.onAnimate);
    }

    public cancel(): void {
        if (Shared.isDefined(this.id)) {
            cancelAnimationFrame(this.id as number);

            this.id = undefined;
            this.startTime = undefined;
            this.pausedTime = undefined;
        }
    }

    public togglePaused(): void {
        if (Shared.isDefined(this.pausedTime)) {
            this.startTime = performance.now() - ((this.pausedTime as number) - (this.startTime as number) || (this.pausedTime as number));
            this.pausedTime = undefined;
            this.id = requestAnimationFrame(this.onAnimate);
        } else if (Shared.isDefined(this.id)) {
            cancelAnimationFrame(this.id as number);
            this.id = undefined;
            this.pausedTime = performance.now();
        }
    }

    public constructor(private duration: number,
                       private draw: (progress: number) => void,
                       private onComplete: () => void,
                       animationTiming: AnimationTiming = AnimationTiming.linear) {
        this.duration = Math.max(Math.abs(duration), 1);
        this.timingFunction = Animator.timingFunctions[Shared.isDefined(AnimationTiming[animationTiming]) ? animationTiming : AnimationTiming.linear];
        this.animate();
    }
}