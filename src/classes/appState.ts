import { Orientation, Theme } from '../utilities/enum';
import * as Persistence from '../utilities/persistence';
import * as Shared from '../utilities/shared';

export class AppState {
    private static readonly themeLocalStorageKey: string = 'ENDURE_THEME';
    private static readonly defaultTheme: Theme = Theme.light;

    public static getOrientation(): Orientation {
        return window.innerWidth / window.innerHeight > 1 ? Orientation.landscape : Orientation.portrait;
    }

    public static getPersistedState(): AppState {
        return new AppState(Persistence.fetchStorableEnumValue(AppState.themeLocalStorageKey, Theme, AppState.defaultTheme) as Theme, AppState.getOrientation());
    }

    public static removeElementFocus(): void {
        if (Shared.isDefined(document.activeElement)
                && document.activeElement instanceof HTMLInputElement
                && document.activeElement.type !== 'text') {
            document.activeElement.blur();
        }
    }

    public static persistState(state: AppState): void {
        Persistence.persistData(AppState.themeLocalStorageKey, state.theme);
    }

    public constructor(public theme: Theme, public orientation: Orientation) {
    }
}