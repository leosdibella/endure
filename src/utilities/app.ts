import { Maybe } from './maybe';
import { PersistentStorage } from './persistentStorage';

export namespace App {
    export enum Theme {
        dark = 0,
        light
    };

    export enum Orientation {
        portrait = 0,
        landscape
    };

    const themeLocalStorageKey: string = 'ENDURE_THEME';
    const defaultTheme: Theme = Theme.light;

    export interface IUpdate {
        theme?: Theme;
    };

    export class State {
        theme: Theme;
        orientation: Orientation;
    
        constructor(theme: Theme, orientation: Orientation) {
            this.theme = theme;
            this.orientation = orientation;
        };
    };

    export function getOrientation() : Orientation {
        if (window.innerWidth / window.innerHeight > 1) {
            return Orientation.landscape;
        }

        return Orientation.portrait;
    };

    export function getPersistedState() : State {
        const theme: Theme = PersistentStorage.fetch(themeLocalStorageKey).caseOf({
            just: t => Maybe.maybe(Theme[t]).switchInto(t, defaultTheme),
            nothing: () => defaultTheme
        });

        return new State(theme, getOrientation());
    };
    
    export function removeElementFocus() : void {
        Maybe.maybe(document.activeElement as HTMLElement).justDo(e => {
            if (!(e instanceof HTMLInputElement) || e.type !== 'text') {
                e.blur();
            }
        });
    };

    export function persistState(state: State) : void {
        PersistentStorage.persist(themeLocalStorageKey, state.theme);
    };
};