export namespace ViewModes {
    export class Mode {
        readonly baseClass: string;
        readonly accentClass: string;

        constructor(baseClass: string, accentClass: string) {
            this.baseClass = baseClass;
            this.accentClass = accentClass;
        };
    }

    export const DARK_MODE: Mode  = new Mode('dark-mode', 'dark-mode-accent');
    export const LIOHT_MODE: Mode = new Mode('light-mode', 'light-mode-accent');
};