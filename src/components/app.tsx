import * as React from 'react';
import '../styles/app.scss';
import { Utilities } from '../utilities/utilities';
import { Backdrop } from './backdrop';
import { Game } from './game';

interface AppState {
    numberOfLines: number;
    viewMode: Utilities.ViewMode;
    difficultyMode: Utilities.DifficultyMode;
    highScores: Utilities.Score[]
};

export interface AppUpdates {
    viewMode?: Utilities.ViewMode;
    difficultyMode?: Utilities.DifficultyMode;
    score?: Utilities.Score;
};

export class App extends React.Component<object, AppState> {
    private static readonly numberOfHighScoresToPersist: number = 10;
    readonly state: AppState;

    public static isLocalStorageSupported() : boolean {
        return typeof(Storage) !== 'undefined' && Utilities.isWellDefinedValue(window.localStorage);
    };

    private static getPersistedAppState() : AppState {
        const state: AppState = {
            numberOfLines: 0,
            viewMode: Utilities.ViewMode.light,
            difficultyMode: Utilities.DifficultyMode.medium,
            highScores: []
        };

        if (App.isLocalStorageSupported()) {
            const viewMode: string = window.localStorage.getItem(Utilities.LocalStorageKeys.viewMode),
                  difficultyMode: string = window.localStorage.getItem(Utilities.LocalStorageKeys.difficultyMode),
                  highScores: string = window.localStorage.getItem(Utilities.LocalStorageKeys.highScores);

            if (Utilities.isWellDefinedValue(difficultyMode)) {
                const parsedFifficultyMode: Utilities.DifficultyMode = parseInt(difficultyMode);

                if (parsedFifficultyMode >= Utilities.DifficultyMode.low || parsedFifficultyMode <= Utilities.DifficultyMode.expert) {
                    state.difficultyMode = parsedFifficultyMode;
                }
            };

            if (Utilities.isWellDefinedValue(viewMode) && viewMode === Utilities.ViewMode.dark) {
                state.viewMode = Utilities.ViewMode.dark;
            }

            if (Utilities.isWellDefinedValue(highScores)) {
                const parsedHighScores = JSON.parse(highScores);

                if (Array.isArray(parsedHighScores)) {
                    state.highScores = parsedHighScores;
                }
            }
        }
    
        return state;
    };

    private recalculateNumberOfLines() : number {
        return Math.floor((window.innerHeight - Utilities.Constants.topBarHeight) / Utilities.Constants.lineHeight);
    };

    private static persistAppState(state: AppState) : void {
        if (App.isLocalStorageSupported()) {
            window.localStorage.setItem(Utilities.LocalStorageKeys.viewMode, state.viewMode);
            window.localStorage.setItem(Utilities.LocalStorageKeys.difficultyMode, state.difficultyMode.toString());
            window.localStorage.setItem(Utilities.LocalStorageKeys.highScores, JSON.stringify(state.highScores));
        }
    };

    private readonly handleAppUpdates = (appUpdates: AppUpdates) : void => {
        if (appUpdates.viewMode !== this.state.viewMode || appUpdates.difficultyMode !== this.state.difficultyMode) {
            const nextState: AppState = {
                numberOfLines: this.state.numberOfLines,
                highScores: this.state.highScores,
                viewMode: Utilities.or(appUpdates.viewMode, this.state.viewMode),
                difficultyMode: Utilities.or(appUpdates.difficultyMode, this.state.difficultyMode)
            };

            if (Utilities.isWellDefinedValue(appUpdates.score)) {
                nextState.highScores = this.state.highScores.concat(appUpdates.score)
                                                            .sort((a, b) => b.value - a.value)
                                                            .slice(0, App.numberOfHighScoresToPersist);;
            }

            this.setState(nextState);
            App.persistAppState(nextState);
        }
    };

    private readonly setNumberOfLines = (event: UIEvent) : void => {
        this.setState({
            numberOfLines: this.recalculateNumberOfLines()
        });
    };

    private readonly handleActionableDomEvent = (event: UIEvent) : void => {
        setTimeout(this.setNumberOfLines, 100);
    };

    constructor(props: object) {
        super(props);

        this.state = App.getPersistedAppState();
        this.state.numberOfLines =  this.recalculateNumberOfLines();
    };

    shouldComponentUpdate(nextProps: object, nextState: AppState) : boolean {
        return nextState.numberOfLines !== this.state.numberOfLines || nextState.viewMode !== this.state.viewMode || nextState.difficultyMode !== this.state.difficultyMode;
    };

    componentDidMount() {
        window.addEventListener(Utilities.DomEvent.resize, this.handleActionableDomEvent);
        window.addEventListener(Utilities.DomEvent.orientationChange, this.handleActionableDomEvent);
    };

    componentWillUnmount() {
        window.removeEventListener(Utilities.DomEvent.resize, this.handleActionableDomEvent);
        window.removeEventListener(Utilities.DomEvent.orientationChange, this.handleActionableDomEvent);
    };

    render() {
        return <div className={'app ' + this.state.viewMode}>
            <Backdrop viewMode={this.state.viewMode}
                      numberOfLines={this.state.numberOfLines}>
            </Backdrop>
            <Game viewMode={this.state.viewMode}
                  difficultyMode={this.state.difficultyMode}
                  onUpdate={this.handleAppUpdates}>
            </Game>
        </div>;
    };
};