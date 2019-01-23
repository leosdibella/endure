import * as React from 'react';
import { OverlayState } from '../classes/overlayState';
import { IDictionary } from '../interfaces/iDictionary';
import { IHighScore } from '../interfaces/iHighScore';
import { IOverlayMenuOption } from '../interfaces/iOverlayMenuOption';
import { IOverlayProps } from '../interfaces/iOverlayProps';
import { Difficulty, DomEvent, GameMode, HighScoreListing, Theme } from '../utilities/enum';
import * as Persistence from '../utilities/persistence';
import * as Shared from '../utilities/shared';

import '../styles/overlay.scss';

export class Overlay extends React.PureComponent<IOverlayProps, OverlayState> {
    private static readonly firstPositionKey: number = 1;
    private static readonly secondPositionKey: number = 2;
    private static readonly thirdPositionKey: number = 3;

    private static readonly highScoreListingOptions: JSX.Element[] = Shared.getNumericEnumKeys(HighScoreListing).map(hsl =>
        <option value={`${hsl}`}
                key={hsl}
                className='overlay-high-score-select-option'>
            {Shared.formatCamelCaseString(HighScoreListing[hsl], ' ', true)}
        </option>);

    private static readonly difficultyOptions: JSX.Element[] = Shared.getNumericEnumKeys(Difficulty).map(d =>
        <option value={`${d}`}
                key={d}
                className='overlay-high-score-select-option'>
            {Shared.formatCamelCaseString(Difficulty[d], ' ', true)}
        </option>);

    private static formatHighScore(highScore: IHighScore, index: number): JSX.Element {
        return <div key={index}
                    className='overlay-high-score'>
                    <div>
                        <span>
                            {highScore.dateStamp}
                        </span>
                         <span>
                            {highScore.name}
                        </span>
                    </div>
                    <div>
                        <span>
                            Score:
                        </span>
                        <span>
                            {highScore.value}
                        </span>
                    </div>
                    <div>
                        <span>
                            Max Combo:
                        </span>
                        <span>
                            {highScore.maxCombo}
                        </span>
                    </div>
               </div>;
    }

    private readonly onKeyDown: (keyboardEvent: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void = this.handleNameChange.bind(this);
    private readonly onHighScoreListingChange: (event: React.ChangeEvent<HTMLSelectElement>) => void = this.handleHighScoreListingChange.bind(this);
    private readonly onHighScoreDifficultyChange: (event: React.ChangeEvent<HTMLSelectElement>) => void = this.handleHighScoreDifficultyChange.bind(this);
    private readonly onLoadGlobalHighScores: () => void = this.loadGlobalHighScores.bind(this);

    private readonly keyDownEventActionMap: IDictionary<() => void> = {
        arrowdown: this.onArrowDown.bind(this),
        arrowup: this.onArrowUp.bind(this),
        enter: this.onEnter.bind(this)
    };

    private onArrowDown(): void {
        this.incrementOrDecrementOptionsIndex(1);
    }

    private onArrowUp(): void {
        this.incrementOrDecrementOptionsIndex(-1);
    }

    private onEnter(): void {
        const menuOption: IOverlayMenuOption | undefined = this.state.menu.menuOptions[this.props.gameMode];

        if (Shared.isDefined(menuOption)) {
            (menuOption as IOverlayMenuOption).actions[this.state.selectedOptionIndex]();
        }
    }

    private loadGlobalHighScores(): void {
        const globalHighScores: IHighScore[] = [];

        /* TODO
        let noConnectivity: boolean = false;

        Persistence.fetchGlobalHighScores(this.state.highScoreDifficulty).then((response) => {
            if (Array.isArray(response.data)) {
                response.data.forEach(hs => {
                    if (Persistence.isValidHighScore(hs)) {
                        globalHighScores.push(hs);
                    }
                });
            }
        }).catch(() => {
            noConnectivity = true;
        }).then(() => {
            this.setState({
                globalHighScores,
                noConnectivity,
                waiting: false
            });
        }); */

        this.setState({
            globalHighScores,
            noConnectivity: false, // TODO
            waiting: false
        });
    }

    private handleHighScoreListingChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        const highScoreListing: HighScoreListing = parseInt(event.target.value, Shared.decimalBase) as HighScoreListing,
              waiting: boolean = highScoreListing === HighScoreListing.global;

        this.setState({
            highScoreListing,
            waiting
        }, waiting ? this.onLoadGlobalHighScores : undefined);
    }

    private handleHighScoreDifficultyChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        const highScoreDifficulty: Difficulty = parseInt(event.target.value, Shared.decimalBase) as Difficulty,
              waiting: boolean = this.state.highScoreListing === HighScoreListing.global;

        this.setState({
            highScoreDifficulty,
            waiting
        }, waiting ? this.onLoadGlobalHighScores : undefined);
    }

    private handleKeyDown(keyboardEvent: KeyboardEvent): void {
        const handler: (() => void) | undefined = this.keyDownEventActionMap[keyboardEvent.key.toLowerCase()];

        if (Shared.isDefined(handler)) {
            handler();
        }
    }

    private saveNameChange(): void {
        this.props.onUpdate({
            gameMode: GameMode.newGame,
            playerName: this.state.playerName
        });
    }

    private handleNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({
            playerName: event.target.value
        });
    }

    private getOverlayTitle(): JSX.Element | boolean {
        const menuOption: IOverlayMenuOption | undefined = this.state.menu.menuOptions[this.props.gameMode];

        if (Shared.isDefined(menuOption)) {
            const overlayTile: JSX.Element = <div className={`overlay-tile ${Theme[this.props.theme]}`}>
                                             </div>;

            return <div key={Overlay.firstPositionKey}
                        className={`overlay-${(menuOption as IOverlayMenuOption).className}-text`}>
                        {overlayTile}
                        {(menuOption as IOverlayMenuOption).title}
                        {overlayTile}
                    </div>;
        }

        return false;
    }

    private getHighScoresOverlayExtras(): JSX.Element {
        const highScoreArray: IHighScore[] = this.state.highScoreListing === HighScoreListing.local ? this.props.highScores[this.state.highScoreDifficulty] : this.state.globalHighScores,
              highScores: JSX.Element[] = highScoreArray.map(Overlay.formatHighScore);

        return <div key={Overlay.secondPositionKey}
                    className='overlay-high-scores-listings'>
                    <div className={`overlay-high-scores-local overlay-high-scores-listing ${Theme[this.props.theme]}`}>
                        <div className='overlay-high-scores-listing-title'>
                            <label className='overlay-high-score-selection'>
                                Listing:
                                <select className='overlay-high-score-select'
                                        value={this.state.highScoreListing}
                                        onChange={this.onHighScoreListingChange}>
                                        {Overlay.highScoreListingOptions}
                                </select>
                            </label>
                            <label className='overlay-high-score-selection'>
                                Difficulty:
                                <select className='overlay-high-score-select'
                                        value={this.state.highScoreDifficulty}
                                        onChange={this.onHighScoreDifficultyChange}>
                                        {Overlay.difficultyOptions}
                                </select>
                            </label>
                        </div>
                        <div className={`overlay-waiting ${this.state.waiting ? ' hide' : ''}`}>

                        </div>
                        <div className={`overlay-high-scores ${highScores.length === 0 || this.state.waiting ? ' hide' : ''}`}>
                            {highScores}
                        </div>
                        <div className={`overlay-no-high-scores ${highScores.length > 0 || this.state.waiting ? ' hide' : ''}`}>
                            {`${this.state.noConnectivity ? 'No internet access ...' : 'Nothing yet ...'} :(`}
                        </div>
                    </div>
               </div>;
    }

    private getOverlayExtras(): JSX.Element | boolean {
        if (this.props.gameMode === GameMode.highScores) {
            return this.getHighScoresOverlayExtras();
        } else if (this.props.gameMode === GameMode.specifyName) {
            return <div key={Overlay.secondPositionKey}
                        className='overlay-player-name-input-container'>
                        <input value={this.state.playerName}
                               className={Theme[this.props.theme]}
                               onChange={this.onNameChange}/>
                   </div>;
        }

        return false;
    }

    private getOverlayButtonPanel(): JSX.Element | boolean {
        const menuOption: IOverlayMenuOption | undefined = this.state.menu.menuOptions[this.props.gameMode];

        // TODO: We need to focus the element on keyboard inputs so that using the keyboard shortcuts don't break after clicking.
        if (Shared.isDefined(menuOption)) {
            const buttons: JSX.Element[] = (menuOption as IOverlayMenuOption).options.map((option, index) => {
                return <button key={index}
                               className={`overlay-button ${this.state.selectedOptionIndex === index ? 'overlay-selected-option' : ''}`}
                               onClick={(menuOption as IOverlayMenuOption).actions[index]}>
                            {option}
                        </button>;
            });

            return <div key={Overlay.thirdPositionKey}
                        className='overlay-button-panel'>
                        {buttons}
                   </div>;
        }

        return false;
    }

    private getOverlayBody(): JSX.Element[] {
        return [
            this.getOverlayTitle(),
            this.getOverlayExtras(),
            this.getOverlayButtonPanel()
        ].filter(e => !!e) as JSX.Element[];
    }

    private incrementOrDecrementOptionsIndex(direction: number): void {
        const menuOption: IOverlayMenuOption | undefined = this.state.menu.menuOptions[this.props.gameMode];

        if (Shared.isDefined(menuOption)) {
            const optionIndex = this.state.selectedOptionIndex + direction;

            this.setState({
                selectedOptionIndex: optionIndex >= 0 ? (optionIndex % (menuOption as IOverlayMenuOption).options.length) : ((menuOption as IOverlayMenuOption).options.length - 1)
            });
        }
    }

    public readonly state: OverlayState = new OverlayState(this.props, this.saveNameChange.bind(this));

    public componentDidUpdate(previousProps: IOverlayProps): void {
        const noConnectivity: boolean = this.props.gameMode !== GameMode.highScores ? false : this.state.noConnectivity,
              waiting: boolean = this.props.gameMode !== GameMode.highScores ? false : this.state.waiting,
              playerName: string = this.props.gameMode !== GameMode.specifyName ? this.props.playerName : this.state.playerName;

        if (previousProps.gameMode !== this.props.gameMode) {
            this.setState({
                noConnectivity,
                playerName,
                selectedOptionIndex: this.state.menu.getDefaultOptionIndex(this.props),
                waiting
            });
        }
    }

    public componentDidMount(): void {
        document.addEventListener(DomEvent.keyDown, this.onKeyDown);
    }

    public componentWillUnmount(): void {
        document.removeEventListener(DomEvent.keyDown, this.onKeyDown);
    }

    public render(): JSX.Element {
        return <div className={`overlay-container ${Theme[this.props.theme]}`}>
                   <div className='overlay'>
                        {this.getOverlayBody()}
                   </div>
               </div>;
    }
}