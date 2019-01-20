import * as React from 'react';
import { OverlayState } from '../classes/overlayState';
import { IDictionary } from '../interfaces/iDictionary';
import { IHighScore } from '../interfaces/iHighScore';
import { IOverlayMenuOption } from '../interfaces/iOverlayMenuOption';
import { IOverlayProps } from '../interfaces/iOverlayProps';
import { Difficulty, DomEvent, GameMode, Theme } from '../utilities/enum';
import * as Shared from '../utilities/shared';

import '../styles/overlay.scss';

export class Overlay extends React.PureComponent<IOverlayProps, OverlayState> {
    private static readonly firstPositionKey: number = 1;
    private static readonly secondPositionKey: number = 2;
    private static readonly thirdPositionKey: number = 3;

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
                             {Shared.formatCamelCaseString(Difficulty[highScore.difficulty], ' ', true)}
                        </span>
                        <span>
                            {highScore.value}
                        </span>
                    </div>
               </div>;
    }

    private readonly onKeyDown: (keyboardEvent: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void = this.handleNameChange.bind(this);

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
        const localHighScores: JSX.Element[] = this.props.highScores[this.props.difficulty].map(Overlay.formatHighScore),
              globalHighScores: JSX.Element[] = [];

        return <div key={Overlay.secondPositionKey}
                    className='overlay-high-scores-listings'>
                    <div className={`overlay-high-scores-local overlay-high-scores-listing ${Theme[this.props.theme]}`}>
                        <div className='overlay-high-scores-listing-title'>
                            You
                        </div>
                        <div className={`overlay-high-scores ${localHighScores.length === 0 ? ' hide' : ''}`}>
                            {localHighScores}
                        </div>
                        <div className={`overlay-no-high-scores ${localHighScores.length > 0 ? ' hide' : ''}`}>
                            Nothing yet ...
                        </div>
                    </div>
                    <div className={`overlay-high-scores-listing-separator ${Theme[this.props.theme]}`}>
                    </div>
                    <div className={`overlay-high-scores-global overlay-high-scores-listing ${Theme[this.props.theme]}`}>
                        <div className='overlay-high-scores-listing-title'>
                            The Entire Class
                        </div>
                        <div className={`overlay-high-scores ${globalHighScores.length === 0 ? ' hide' : ''}`}>
                            {globalHighScores}
                        </div>
                        <div className={`overlay-no-high-scores ${globalHighScores.length > 0 ? ' hide' : ''}`}>
                            Nothing yet ...
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
        if (previousProps.gameMode !== this.props.gameMode) {
            this.setState({
                selectedOptionIndex: this.state.menu.getDefaultOptionIndex(this.props)
            });
        }

        if (this.props.gameMode !== GameMode.specifyName) {
            this.setState({
                playerName: this.props.playerName
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