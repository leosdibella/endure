import React, { PureComponent } from 'react';
import { OverlayMenuOption } from '../classes/overlayMenuOption';
import { OverlayState } from '../classes/overlayState';
import { IDictionary } from '../interfaces/iDictionary';
import { IHighScore } from '../interfaces/iHighScore';
import { IOverlayProps } from '../interfaces/iOverlayProps';
import { Difficulty, DomEvent, GameMode, HighScoreListing, Theme } from '../utilities/enum';
import { fetchGlobalHighScoresAsync } from '../utilities/persistence';
import { decimalBase, formatCamelCaseString, getNumericEnumKeys, isDefined } from '../utilities/shared';
import { isValidHighScore } from '../utilities/validation';

import '../styles/overlay.scss';

export class Overlay extends PureComponent<IOverlayProps, OverlayState> {
    private static readonly firstPositionKey: number = 1;
    private static readonly secondPositionKey: number = 2;
    private static readonly thirdPositionKey: number = 3;

    private static readonly highScoreListingOptions: JSX.Element[] = getNumericEnumKeys(HighScoreListing).map(hsl =>
        <option value={`${hsl}`}
                key={hsl}
                className='overlay-high-score-select-option'>
            {formatCamelCaseString(HighScoreListing[hsl], ' ', true)}
        </option>);

    private static readonly difficultyOptions: JSX.Element[] = getNumericEnumKeys(Difficulty).map(d =>
        <option value={`${d}`}
                key={d}
                className='overlay-high-score-select-option'>
            {formatCamelCaseString(Difficulty[d], ' ', true)}
        </option>);

    private static focusSelectedOption(menuOption: OverlayMenuOption, selectedOptionIndex: number): void {
        const buttonReference: React.RefObject<HTMLButtonElement> = menuOption.buttonReferences[selectedOptionIndex];

        if (isDefined(buttonReference) && isDefined(buttonReference.current)) {
            (buttonReference.current as HTMLButtonElement).focus();
        }
    }

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

    private readonly onKeyDown: (event: KeyboardEvent) => void = this.handleKeyDown.bind(this);
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
        const menuOption: OverlayMenuOption | undefined = this.state.menu.menuOptions[this.props.gameMode];

        if (isDefined(menuOption)) {
            (menuOption as OverlayMenuOption).actions[this.state.selectedOptionIndex]();
        }
    }

    private loadGlobalHighScores(): void {
        const globalHighScores: IHighScore[] = [];

        let noConnectivity: boolean = false;

        fetchGlobalHighScoresAsync(this.state.highScoreDifficulty).then((response) => {
            if (Array.isArray(response.data)) {
                response.data.forEach(hs => {
                    if (isValidHighScore(hs)) {
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
        });
    }

    private handleHighScoreListingChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        const highScoreListing: HighScoreListing = parseInt(event.target.value, decimalBase) as HighScoreListing,
              waiting: boolean = highScoreListing === HighScoreListing.global;

        this.setState({
            highScoreListing,
            waiting
        }, waiting ? this.onLoadGlobalHighScores : undefined);
    }

    private handleHighScoreDifficultyChange(event: React.ChangeEvent<HTMLSelectElement>): void {
        const highScoreDifficulty: Difficulty = parseInt(event.target.value, decimalBase) as Difficulty,
              waiting: boolean = this.state.highScoreListing === HighScoreListing.global;

        this.setState({
            highScoreDifficulty,
            waiting
        }, waiting ? this.onLoadGlobalHighScores : undefined);
    }

    private handleKeyDown(event: KeyboardEvent): void {
        const handler: ((event: KeyboardEvent) => void) | undefined = this.keyDownEventActionMap[event.key.toLowerCase()];

        if (isDefined(handler)) {
            event.preventDefault();
            event.stopPropagation();
            handler(event);
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
        const menuOption: OverlayMenuOption | undefined = this.state.menu.menuOptions[this.props.gameMode];

        if (isDefined(menuOption)) {
            const overlayTile: JSX.Element = <div className={`overlay-tile ${Theme[this.props.theme]}`}>
                                             </div>;

            return <div key={Overlay.firstPositionKey}
                        className={`overlay-${(menuOption as OverlayMenuOption).className}-text`}>
                        {overlayTile}
                        {(menuOption as OverlayMenuOption).title}
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
        const menuOption: OverlayMenuOption | undefined = this.state.menu.menuOptions[this.props.gameMode];

        if (isDefined(menuOption)) {
            const buttons: JSX.Element[] = (menuOption as OverlayMenuOption).options.map((option, index) => {
                return <button key={index}
                               ref={(menuOption as OverlayMenuOption).buttonReferences[index]}
                               className={`overlay-button ${this.state.selectedOptionIndex === index ? 'overlay-selected-option' : ''}`}
                               onClick={(menuOption as OverlayMenuOption).actions[index]}>
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
        const menuOption: OverlayMenuOption | undefined = this.state.menu.menuOptions[this.props.gameMode];

        if (isDefined(menuOption)) {
            const optionIndex: number = this.state.selectedOptionIndex + direction,
                  selectedOptionIndex: number = optionIndex >= 0 ? (optionIndex % (menuOption as OverlayMenuOption).options.length) : ((menuOption as OverlayMenuOption).options.length - 1);

            this.setState({
                selectedOptionIndex
            }, () => Overlay.focusSelectedOption(menuOption as OverlayMenuOption, selectedOptionIndex));
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