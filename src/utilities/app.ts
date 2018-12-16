import { Maybe } from './maybe';
import { PersistentStorage } from './persistentStorage';

export namespace App {
    export enum Theme {
        dark = 0,
        light
    }

    export enum Orientation {
        portrait = 0,
        landscape
    }

    export enum Difficulty {
        beginner = 0,
        low,
        medium,
        hard,
        expert
    }

    export enum LetterGrade {
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

    export interface IUpdate {
        theme?: Theme;
    }

    export class State {
        theme: Theme;
        orientation: Orientation;

        constructor(theme: Theme, orientation: Orientation) {
            this.theme = theme;
            this.orientation = orientation;
        }
    }

    export function getOrientation(): Orientation {
        if (window.innerWidth / window.innerHeight > 1) {
            return Orientation.landscape;
        }

        return Orientation.portrait;
    }

    export function getPersistedState(): State {
        return new State(PersistentStorage.fetchEnumValue(themeLocalStorageKey, Theme, defaultTheme), getOrientation());
    }

    export function removeElementFocus(): void {
        new Maybe(document.activeElement as HTMLElement).justDo(e => {
            if (!(e instanceof HTMLInputElement) || e.type !== 'text') {
                e.blur();
            }
        });
    }

    export function persistState(state: State): void {
        PersistentStorage.persistData(themeLocalStorageKey, state.theme);
    }
}