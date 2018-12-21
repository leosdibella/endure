import { Maybe } from './maybe';
import * as Persistence from './persistence';
import * as Shared from './shared';

interface IUpdate {
    theme?: Shared.Theme;
}

class State {
    private static readonly themeLocalStorageKey: string = 'ENDURE_THEME';
    private static readonly defaultTheme: Shared.Theme = Shared.Theme.light;

    public static getOrientation(): Shared.Orientation {
        return window.innerWidth / window.innerHeight > 1 ? Shared.Orientation.landscape : Shared.Orientation.portrait;
    }

    public static getPersistedState(): State {
        return new State(Persistence.fetchStorableEnumValue(State.themeLocalStorageKey, Shared.Theme, State.defaultTheme) as Shared.Theme, State.getOrientation());
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

    public constructor(public theme: Shared.Theme, public orientation: Shared.Orientation) {
    }
}

export {
    IUpdate,
    State
};