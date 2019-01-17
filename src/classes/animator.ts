import { IDictionary } from '../interfaces/iDictionary';
import { AnimationTiming } from '../utilities/enum';
import * as Shared from '../utilities/shared';

export class Animator {
    private static readonly timingFunctions: IDictionary<(timeFraction: number) => number> = {
        [AnimationTiming.linear]: (x: number) => x,
        [AnimationTiming.easeInOut]: (pValue: number) => {
            const pSquared: number = pValue * pValue,
                  qValue: number = 1 - pValue;

            return pSquared / (pSquared + (qValue * qValue));
        }
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
                this.stop();
                this.pausedTime = undefined;
                this.startTime = undefined;
                this.onComplete();
            }
        }
    }

    public stop(): void {
        if (Shared.isDefined(this.id)) {
            cancelAnimationFrame(this.id as number);
            this.id = undefined;
        }
    }

    public pause(): void {
        this.stop();
        this.pausedTime = performance.now();
    }

    public start(): void {
        this.startTime = performance.now() - (Shared.isDefined(this.pausedTime) ? (this.pausedTime as number) - (this.startTime as number) : 0);
        this.pausedTime = undefined;
        this.id = requestAnimationFrame(this.onAnimate);
    }

    public constructor(private duration: number,
                       private draw: (progress: number) => void,
                       private onComplete: (passThrough?: () => void) => void,
                       animationTiming: AnimationTiming = AnimationTiming.linear) {
        this.duration = Math.max(Math.abs(duration), 1);
        this.timingFunction = Animator.timingFunctions[Shared.isDefined(AnimationTiming[animationTiming]) ? animationTiming : AnimationTiming.linear];
    }
}