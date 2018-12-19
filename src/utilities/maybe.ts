import * as GeneralUtilities from './general';

class Maybe<T> {
    public static filterCollection<T>(collection: Maybe<T>[]): T[] {
        return collection.filter(t => GeneralUtilities.isDefined(t.value)).map(t => t.value as T);
    }

    public static mapThrough<T>(maybe: Maybe<any>, defaultValue: T, t?: T): T {
        return GeneralUtilities.isDefined(maybe.value) ? maybe.value : GeneralUtilities.isDefined(t) ? t as T : defaultValue;
    }

    private readonly value: T | undefined;

    public bind<U>(f: (t: T) => Maybe<U>): Maybe<U> {
        return GeneralUtilities.isDefined(this.value) ? f(this.value as T) : new Maybe();
    }

    public caseOf<U>(just: (t: T) => U, nothing: () => U): U {
        return GeneralUtilities.isDefined(this.value) ? just(this.value as T) : nothing();
    }

    public justDo(f: (t: T) => void): Maybe<boolean> {
        if (GeneralUtilities.isDefined(this.value)) {
            f(this.value as T);

            return new Maybe();
        }

        return new Maybe(true);
    }

    public otherwiseJustDo<U>(maybeU: Maybe<U>, f: (u: U) => void): Maybe<boolean> {
        if (GeneralUtilities.isDefined(this.value)) {
            return maybeU.justDo(f);
        }

        return new Maybe();
    }

    public otherwiseDo(f: () => void): void {
        if (GeneralUtilities.isDefined(this.value)) {
            f();
        }
    }

    public getOrDefault<U extends T>(defaultValue: U): U | T {
        return GeneralUtilities.isDefined(this.value) ? this.value as T : defaultValue;
    }

    public constructor(value?: T | undefined | null) {
        this.value = GeneralUtilities.isNotNull(value) ? value as T : undefined;
    }
}

export {
    Maybe
};