export interface IOverlayMenuOption {
    readonly title: string;
    readonly className: string;
    readonly options: string[];
    readonly actions: (() => void)[];
    readonly defaultOptionsIndex?: number;
}