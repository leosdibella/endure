import * as Shared from './shared';

class Maybe<T> {
    public static filterCollection<T>(collection: Maybe<T>[]): T[] {
        return collection.filter(t => Shared.isDefined(t.value)).map(t => t.value as T);
    }

    private readonly value: T | undefined;

    public bind<U>(f: (t: T) => Maybe<U>): Maybe<U> {
        return Shared.isDefined(this.value) ? f(this.value as T) : new Maybe();
    }

    public caseOf<U>(just: (t: T) => U, nothing: () => U): U {
        return Shared.isDefined(this.value) ? just(this.value as T) : nothing();
    }

    public justDo(f: (t: T) => void): Maybe<boolean> {
        if (Shared.isDefined(this.value)) {
            f(this.value as T);

            return new Maybe();
        }

        return new Maybe(true);
    }

    public otherwiseJustDo<U>(maybeU: Maybe<U>, f: (u: U) => void): Maybe<boolean> {
        if (Shared.isDefined(this.value)) {
            return maybeU.justDo(f);
        }

        return new Maybe();
    }

    public otherwiseDo(f: () => void): void {
        if (Shared.isDefined(this.value)) {
            f();
        }
    }

    public getOrDefault<U extends T>(defaultValue: U): U | T {
        return Shared.isDefined(this.value) ? this.value as T : defaultValue;
    }

    public constructor(value?: T | undefined | null) {
        this.value = Shared.isNotNull(value) ? value as T : undefined;
    }
}

export {
    Maybe
};