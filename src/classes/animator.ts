import { isDefined } from '../utilities/shared';

export class Animator {
    private pausedTime?: number;
    private startTime?: number;
    private id?: number;
    private onAnimate: (time: number) => void = this.loopAnimation.bind(this);

    private loopAnimation(time: number): void {
        if (isDefined(this.id)) {
            let timeFraction: number = (time - (this.startTime as number)) / this.duration;

            timeFraction = Math.min(timeFraction, 1);

            if (timeFraction < 1) {
                this.draw(timeFraction);
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
        if (isDefined(this.id)) {
            cancelAnimationFrame(this.id as number);
            this.id = undefined;
        }
    }

    public pause(): void {
        this.stop();
        this.pausedTime = performance.now();
    }

    public start(): void {
        this.startTime = performance.now() - (isDefined(this.pausedTime) ? (this.pausedTime as number) - (this.startTime as number) : 0);
        this.pausedTime = undefined;
        this.id = requestAnimationFrame(this.onAnimate);
    }

    public constructor(private duration: number,
                       private draw: (progress: number) => void,
                       private onComplete: (passThrough?: () => void) => void) {
        this.duration = Math.max(Math.abs(duration), 1);
    }
}