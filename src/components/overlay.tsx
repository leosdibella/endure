import * as React from 'react';

import * as AppUtilities from '../utilities/app';
import * as GameUtilities from '../utilities/game';
import * as GeneralUtilities from '../utilities/general';
import { Maybe } from '../utilities/maybe';
import * as OverlayUtilities from '../utilities/overlay';

import '../styles/overlay.scss';

class Overlay extends React.PureComponent<OverlayUtilities.IProps, OverlayUtilities.State> {
    private readonly onKeyDown: (keyboardEvent: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void = this.handleNameChange.bind(this);

    private readonly keyDownEventActionMap: GeneralUtilities.IDictionary<() => void> = {
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
        this.state.menu.menuOptions[this.props.mode].justDo(mo => mo.actions[this.state.selectedOptionIndex]());
    }

    private handleKeyDown(keyboardEvent: KeyboardEvent): void {
        new Maybe(this.keyDownEventActionMap[keyboardEvent.key.toLowerCase()]).justDo(kdh => kdh());
    }

    private saveNameChange(): void {
        this.props.onUpdate({
            mode: GameUtilities.Mode.newGame,
            playerName: this.state.playerName
        });
    }

    private handleNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({
            playerName: event.target.value
        });
    }

    private getOverlayTitle(): Maybe<JSX.Element> {
        return this.state.menu.menuOptions[this.props.mode].bind(mo => {
            const overlayTile: JSX.Element = <div className={`overlay-tile ${AppUtilities.Theme[this.props.theme]}`}>
                                             </div>;

            return new Maybe(<div key={1}
                                  className={`overlay-${mo.className}-text`}>
                                  {overlayTile}
                                  {mo.title}
                                  {overlayTile}
                              </div>);
        });
    }

    private getHighScoresOverlayExtras(): JSX.Element {
        const localHighScores: JSX.Element[] = this.props.highScores.map((s, i) => <div key={i}
                                                                                            className='overlay-high-score'>
                                                                                            <div>
                                                                                                <span>
                                                                                                    {s.dateStamp}
                                                                                                </span>
                                                                                                <span>
                                                                                                    {s.name}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <span>
                                                                                                    {GeneralUtilities.formatCamelCaseString(AppUtilities.Difficulty[s.difficulty], ' ', true)}
                                                                                                </span>
                                                                                                <span>
                                                                                                    {s.value}
                                                                                                </span>
                                                                                            </div>
                                                                                       </div>),
               globalHighScores: JSX.Element[] = [];

        return <div key={2}
                    className='overlay-high-scores-listings'>
                    <div className={`overlay-high-scores-local overlay-high-scores-listing ${AppUtilities.Theme[this.props.theme]}`}>
                        <div className='overlay-high-scores-listing-title'>
                            You
                        </div>
                        {localHighScores}
                        <div className={`overlay-no-high-scores ${localHighScores.length > 0 ? ' hide' : ''}`}>
                            Nothing yet ...
                        </div>
                    </div>
                    <div className={`overlay-high-scores-listing-separator ${AppUtilities.Theme[this.props.theme]}`}>
                    </div>
                    <div className={`overlay-high-scores-global overlay-high-scores-listing ${AppUtilities.Theme[this.props.theme]}`}>
                        <div className='overlay-high-scores-listing-title'>
                            The Entire Class
                        </div>
                        {globalHighScores}
                        <div className={`overlay-no-high-scores ${globalHighScores.length > 0 ? ' hide' : ''}`}>
                            Nothing yet ...
                        </div>
                    </div>
                </div>;
    }

    private getOverlayExtras(): Maybe<JSX.Element> {
        if (this.props.mode === GameUtilities.Mode.highScores) {
            return new Maybe(this.getHighScoresOverlayExtras());
        } else if (this.props.mode === GameUtilities.Mode.specifyName) {
            return new Maybe(<div key={2}
                                  className='overlay-player-name-input-container'>
                                  <input value={this.state.playerName}
                                         className={AppUtilities.Theme[this.props.theme]}
                                         onChange={this.onNameChange}/>
                             </div>);
        }

        return new Maybe() as Maybe<JSX.Element>;
    }

    private getOverlayButtonPanel(): Maybe<JSX.Element> {
        return this.state.menu.menuOptions[this.props.mode].bind(mo => {
            const buttons: JSX.Element[] = GeneralUtilities.fillArray(mo.options.length, i => {
                return <button key={i}
                               className={`overlay-button ${this.state.selectedOptionIndex === i ? 'overlay-selected-option' : ''}`}
                               onClick={mo.actions[i]}>
                            {mo.options[i]}
                       </button>;
            });

            return new Maybe(<div key={3}
                                  className='overlay-button-panel'>
                                 {buttons}
                             </div>);
        });
    }

    private getOverlayBody(): JSX.Element[] {
        return Maybe.filterCollection([
            this.getOverlayTitle(),
            this.getOverlayExtras(),
            this.getOverlayButtonPanel()
        ]);
    }

    private incrementOrDecrementOptionsIndex(direction: number): void {
        this.state.menu.menuOptions[this.props.mode].justDo(mo => {
            const optionIndex = this.state.selectedOptionIndex + direction;

            this.setState({
                selectedOptionIndex: optionIndex >= 0 ? (optionIndex % mo.options.length) : (mo.options.length - 1)
            });
        });
    }

    public readonly state: OverlayUtilities.State = new OverlayUtilities.State(this.props, this.saveNameChange.bind(this));

    public componentDidUpdate(previousProps: OverlayUtilities.IProps): void {
        if (previousProps.mode !== this.props.mode) {
            this.setState({
                selectedOptionIndex: this.state.menu.getDefaultOptionIndex(this.props)
            });
        }

        if (this.props.mode !== GameUtilities.Mode.specifyName) {
            this.setState({
                playerName: this.props.playerName
            });
        }
    }

    public componentDidMount(): void {
        document.addEventListener(GeneralUtilities.DomEvent.keyDown, this.onKeyDown);
    }

    public componentWillUnmount(): void {
        document.removeEventListener(GeneralUtilities.DomEvent.keyDown, this.onKeyDown);
    }

    public render(): JSX.Element {
        return <div className={`overlay-container ${AppUtilities.Theme[this.props.theme]}`}>
                   <div className='overlay'>
                        {this.getOverlayBody()}
                   </div>
               </div>;
    }
}

export {
    Overlay
};