export class Maybe<T> {
    private readonly value: T | undefined;

    constructor(value?: T | undefined | null) {
        this.value = value === null ? undefined : value;
    };

    static filterCollection<T>(collection: Maybe<T>[]) : T[] {
        return collection.filter(t => t.value !== undefined).map(t => t.value as T);
    };

    bind<U>(f: (t: T) => Maybe<U>) : Maybe<U> {
        return this.value === undefined ? new Maybe() : f(this.value as T);
    };

    caseOf<U>(just: (t: T) => U, nothing: () => U) : U {
        return this.value === undefined ? nothing() : just(this.value as T);
    };

    switchInto<U>(justValue: U, nothingValue: U) : U {
        return this.value === undefined ? nothingValue : justValue;
    };

    justDo(f: (t: T) => void) : Maybe<boolean> {
        if (this.value !== undefined) {
            f(this.value as T);

            return new Maybe(true);
        }

        return new Maybe();
    };

    otherwiseJustDo<U>(maybeU: Maybe<U>, f: (u: U) => void) : Maybe<boolean> {
        if (this.value !== undefined) {
            return maybeU.justDo(f);
        }

        return new Maybe();
    };

    otherwiseDo(f: () => void) : void {
        if (this.value !== undefined) {
            f();
        }
    };

    getOrDefault<U extends T>(defaultValue: U) : U | T {
        return this.value === undefined ? defaultValue: this.value as T;
    };
};