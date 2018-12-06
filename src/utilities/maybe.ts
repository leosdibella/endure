import { General } from './utilities';

enum MaybeType {
    nothing,
    just
};

interface MaybePatterns<T,U> {
    just: (t: T) => U;
    nothing: () => U;
}

export class Maybe<T> {
    private readonly value: T | undefined;
    private readonly type: MaybeType;

    static nothing<T>() : Maybe<T> {
        return new Maybe<T>(MaybeType.nothing);
    };

    static just<T>(value: T) : Maybe<T> {
        return new Maybe<T>(MaybeType.just, value);
    };

    static maybe<T>(t?: T | undefined | null) : Maybe<T> {
        return General.isWellDefinedValue(t) ? new Maybe<T>(MaybeType.nothing) : new Maybe<T>(MaybeType.just, t);
    };

    static filterCollection<T>(collection: Maybe<T>[]) : T[] {
        return collection.filter(t => t.type === MaybeType.just).map(t => t.value as T);
    };

    private constructor(type: MaybeType, value?: T | undefined | null) {
        this.value = value === null ? undefined : value;
        this.type = type;
    };

    bind<U>(f: (t: T) => Maybe<U>) : Maybe<U> {
        return this.type === MaybeType.just ? f(this.value as T) : Maybe.nothing<U>();
    };

    caseOf<U>(patterns: MaybePatterns<T, U>) : U {
        return this.type === MaybeType.just ? patterns.just(this.value as T) : patterns.nothing();
    };

    switchInto<U>(justValue: U, nothingValue: U) : U {
        return this.type === MaybeType.just ? justValue : nothingValue;
    };

    justDo(f: (t: T) => void) : Maybe<boolean> {
        if (this.type === MaybeType.just) {
            f(this.value as T);

            return Maybe.just(true);
        }

        return Maybe.nothing();
    };

    otherwiseDo<U>(maybeU: Maybe<U>, f: (u: U) => void) : Maybe<boolean> {
        if (this.type === MaybeType.nothing) {
            return maybeU.justDo(f);
        }

        return Maybe.nothing();
    };

    getOrDefault<U extends T>(defaultValue: U) : U | T {
        return this.type === MaybeType.just ? this.value as T : defaultValue;
    };
};