import * as General from './general';

class Maybe<T> {
    public static filterCollection<T>(collection: Maybe<T>[]): T[] {
        return collection.filter(t => General.isDefined(t.value)).map(t => t.value as T);
    }

    public static mapThrough<T>(maybe: Maybe<any>, defaultValue: T, t?: T): T {
        return General.isDefined(maybe.value) ? maybe.value : General.isDefined(t) ? t as T : defaultValue;
    }

    private readonly value: T | undefined;

    public bind<U>(f: (t: T) => Maybe<U>): Maybe<U> {
        return General.isDefined(this.value) ? f(this.value as T) : new Maybe();
    }

    public caseOf<U>(just: (t: T) => U, nothing: () => U): U {
        return General.isDefined(this.value) ? just(this.value as T) : nothing();
    }

    public justDo(f: (t: T) => void): Maybe<boolean> {
        if (General.isDefined(this.value)) {
            f(this.value as T);

            return new Maybe();
        }

        return new Maybe(true);
    }

    public otherwiseJustDo<U>(maybeU: Maybe<U>, f: (u: U) => void): Maybe<boolean> {
        if (General.isDefined(this.value)) {
            return maybeU.justDo(f);
        }

        return new Maybe();
    }

    public otherwiseDo(f: () => void): void {
        if (General.isDefined(this.value)) {
            f();
        }
    }

    public getOrDefault<U extends T>(defaultValue: U): U | T {
        return General.isDefined(this.value) ? this.value as T : defaultValue;
    }

    public constructor(value?: T | undefined | null) {
        this.value = value === null ? undefined : value;
    }
}

export {
    Maybe
};