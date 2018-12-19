import { Maybe } from './maybe';
import * as Persistence from './persistence';

enum Theme {
    dark = 0,
    light
}

enum Orientation {
    portrait = 0,
    landscape
}

enum Difficulty {
    beginner = 0,
    low,
    medium,
    hard,
    expert
}

enum LetterGrade {
    aPlus = 0,
    a,
    aMinus,
    bPlus,
    b,
    bMinus,
    cPlus,
    c,
    cMinus,
    dPlus,
    d,
    dMinus,
    f
}

interface IUpdate {
    theme?: Theme;
}

class State {
    private static readonly themeLocalStorageKey: string = 'ENDURE_THEME';
    private static readonly defaultTheme: Theme = Theme.light;

    public static getOrientation(): Orientation {
        if (window.innerWidth / window.innerHeight > 1) {
            return Orientation.landscape;
        }

        return Orientation.portrait;
    }

    public static getPersistedState(): State {
        return new State(Persistence.fetchEnumValue(State.themeLocalStorageKey, Theme, State.defaultTheme), State.getOrientation());
    }

    public static removeElementFocus(): void {
        new Maybe(document.activeElement as HTMLElement).justDo(e => {
            if (!(e instanceof HTMLInputElement) || e.type !== 'text') {
                e.blur();
            }
        });
    }

    public static persistState(state: State): void {
        Persistence.persistData(State.themeLocalStorageKey, state.theme);
    }

    public theme: Theme;
    public orientation: Orientation;

    public constructor(theme: Theme, orientation: Orientation) {
        this.theme = theme;
        this.orientation = orientation;
    }
}

export {
    Theme,
    Orientation,
    Difficulty,
    LetterGrade,
    IUpdate,
    State
};