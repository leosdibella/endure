import { Orientation, Theme } from '../utilities/enum';
import { fetchStorableEnumValue, persistLocalData } from '../utilities/persistence';

export class AppState {
    private static readonly themeLocalStorageKey: string = 'ENDURE_THEME';
    private static readonly defaultTheme: Theme = Theme.light;

    public static getOrientation(): Orientation {
        return window.innerWidth / window.innerHeight > 1 ? Orientation.landscape : Orientation.portrait;
    }

    public static getPersistedState(): AppState {
        return new AppState(fetchStorableEnumValue(AppState.themeLocalStorageKey, Theme, AppState.defaultTheme) as Theme, AppState.getOrientation());
    }

    public static persistState(state: AppState): void {
        persistLocalData(AppState.themeLocalStorageKey, state.theme);
    }

    public constructor(public theme: Theme, public orientation: Orientation) {
    }
}