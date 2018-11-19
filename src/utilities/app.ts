import { General } from './general';

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
        let theme: number;

        if (General.isLocalStorageSupported()) {
            theme = parseInt(window.localStorage.getItem(themeLocalStorageKey));

            if (!General.isWellDefinedValue(Theme[theme])) {
                theme = defaultTheme;
            }
        }

        return new State(theme as Theme, getOrientation());;
    };
    
    export function removeElementFocus() : void {
        const focalElement: HTMLElement = document.activeElement as HTMLElement;

        if (General.isWellDefinedValue(focalElement)) {
            if (focalElement instanceof HTMLInputElement) {
                const input: HTMLInputElement = focalElement as HTMLInputElement;

                if (input.type === 'text') {
                    return;
                }
            }

            focalElement.blur();
        }
    };

    export function persistState(state: State) : void {
        if (General.isLocalStorageSupported()) {
            window.localStorage.setItem(themeLocalStorageKey, String(state.theme));
        }
    };
};