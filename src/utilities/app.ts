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

const themeLocalStorageKey: string = 'ENDURE_THEME';
const defaultTheme: Theme = Theme.light;

interface IUpdate {
    theme?: Theme;
}

class State {
    public theme: Theme;
    public orientation: Orientation;

    public constructor(theme: Theme, orientation: Orientation) {
        this.theme = theme;
        this.orientation = orientation;
    }
}

function getOrientation(): Orientation {
    if (window.innerWidth / window.innerHeight > 1) {
        return Orientation.landscape;
    }

    return Orientation.portrait;
}

function getPersistedState(): State {
    return new State(Persistence.fetchEnumValue(themeLocalStorageKey, Theme, defaultTheme), getOrientation());
}

function removeElementFocus(): void {
    new Maybe(document.activeElement as HTMLElement).justDo(e => {
        if (!(e instanceof HTMLInputElement) || e.type !== 'text') {
            e.blur();
        }
    });
}

function persistState(state: State): void {
    Persistence.persistData(themeLocalStorageKey, state.theme);
}

export {
    Theme,
    Orientation,
    Difficulty,
    LetterGrade,
    IUpdate,
    State,
    getOrientation,
    getPersistedState,
    removeElementFocus,
    persistState
};