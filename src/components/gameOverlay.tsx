import * as React from 'react';
import * as Utilities from '../utilities/utilities';

import '../styles/gameOverlay.scss';

export class GameOverlay extends React.PureComponent<Utilities.GameOverlay.IProps, Utilities.GameOverlay.State> {
    private readonly keyDownEventActionMap: Utilities.General.IDictionary<() => void> = {
        arrowup: () => {
            this.incrementOrDecrementOptionsIndex(-1);
        },
        arrowdown: () => {
            this.incrementOrDecrementOptionsIndex(1);
        },
        enter: () => {
            this.state.menu.menuOptions[this.props.mode].actions[this.state.selectedOptionIndex]();
        }
    };

    private readonly onKeyDown = (keyboardEvent: KeyboardEvent) : void => {
        const keyDownHandler = this.keyDownEventActionMap[keyboardEvent.key.toLowerCase()];

        if (Utilities.General.isWellDefinedValue(keyDownHandler)) {
            keyDownHandler();
        }
    };

    private readonly saveNameChanges = () : void => {
        this.props.onUpdate({
            mode: Utilities.Game.Mode.newGame,
            playerName: this.state.playerName
        });
    };

    private readonly handleNameChanges = (event: React.ChangeEvent<HTMLInputElement>) : void => {
        this.setState({
            playerName: event.target.value
        });
    };

    private getGameOverlayTitle() : JSX.Element {
        if (this.props.mode !== Utilities.Game.Mode.inGame) {
            const overlayTile: JSX.Element = <div className={'game-overlay-tile ' + Utilities.App.Theme[this.props.theme]}>
                                             </div>

            return <div key={1}
                        className={'game-overlay-' + this.state.menu.menuOptions[this.props.mode].className + '-text'}>
                        {overlayTile}
                        {this.state.menu.menuOptions[this.props.mode].title}
                        {overlayTile}
                   </div>;
        }

        return undefined;
    };

    private getGameOverlayExtras() : JSX.Element {
        if (this.props.mode === Utilities.Game.Mode.highScores) {
            const localHighScores: JSX.Element[] = this.props.highScores.map((s, i) => <div key={i}
                                                                                            className='game-overlay-high-score'>
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
                                                                                                </span>
                                                                                                <span>
                                                                                                    {s.value}
                                                                                                </span>
                                                                                            </div>
                                                                                       </div>),
                  globalHighScores: JSX.Element[] = [];

            return <div key={2}
                        className='game-overlay-high-scores-listings'>
                <div className={'game-overlay-high-scores-local game-overlay-high-scores-listing ' + Utilities.App.Theme[this.props.theme]}>
                    <div className='game-overlay-high-scores-listing-title'>
                        You
                    </div>
                    {localHighScores}
                    <div className={'game-overlay-no-high-scores' + (localHighScores.length > 0 ? ' hide' : '')}>
                        Nothing yet ...
                    </div>
                </div>
                <div className={'game-overlay-high-scores-listing-separator ' + Utilities.App.Theme[this.props.theme]}>
                </div>
                <div className={'game-overlay-high-scores-global game-overlay-high-scores-listing ' + Utilities.App.Theme[this.props.theme]}>
                    <div className='game-overlay-high-scores-listing-title'>
                        The Entire Class
                    </div>
                    {globalHighScores}
                    <div className={'game-overlay-no-high-scores' + (globalHighScores.length > 0 ? ' hide' : '')}>
                        Nothing yet ...
                    </div>
                </div>
            </div>
        }

        if (this.props.mode === Utilities.Game.Mode.specifyName) {
            return <div key={2}
                        className='game-overlay-player-name-input-container'>
                        <input value={this.state.playerName}
                               className={Utilities.App.Theme[this.props.theme]}
                               onChange={this.handleNameChanges}/>
                   </div>
        }

        return undefined;
    };

    private getGameOverlayButtonPanel() : JSX.Element {
        const options: string[] = this.state.menu.menuOptions[this.props.mode].options;

        if (Utilities.General.isWellDefinedValue(options)) {
            const buttons: JSX.Element[] = [];

            for (let i = 0; i < options.length; ++i) {
                buttons.push(<button key={i}
                                     className={'game-overlay-button' + (this.state.selectedOptionIndex === i ? ' game-overlay-selected-option': '')}
                                     onClick={this.state.menu.menuOptions[this.props.mode].actions[i]}>
                                 {options[i]}
                             </button>);
            }

            return <div key={3}
                        className='game-overlay-button-panel'>
                       {buttons}
                   </div>;
        }

        return undefined;
    };

    private getGameOverlayBody() : JSX.Element[] {
        const overleyBody: JSX.Element[] = [
            this.getGameOverlayTitle(),
            this.getGameOverlayExtras(),
            this.getGameOverlayButtonPanel()
        ];

        return overleyBody.filter(jsx => Utilities.General.isWellDefinedValue(jsx));
    };

    private getDefaultOptionIndex() : number {
        if (this.props.mode === Utilities.Game.Mode.selectDifficulty) {
            return this.props.difficulty;
        }

        if (this.props.mode === Utilities.Game.Mode.setTheme) {
            return this.props.theme === Utilities.App.Theme.light ? 0 : 1
        }

        if (Utilities.General.isWellDefinedValue(this.state)) {
            return this.state.menu.menuOptions[this.props.mode].defaultOptionsIndex;
        }

        return undefined;
    };

    private incrementOrDecrementOptionsIndex(direction: number) : void {
        const options: string[] = this.state.menu.menuOptions[this.props.mode].options;

        if (Utilities.General.isWellDefinedValue(options)) {
            let optionIndex = this.state.selectedOptionIndex + direction;

            this.setState({
                selectedOptionIndex: optionIndex >= 0 ? (optionIndex % options.length) : (options.length - 1)
            });
        }
    };

    readonly state: Utilities.GameOverlay.State = new Utilities.GameOverlay.State(this.props.playerName, this.getDefaultOptionIndex(), this.props.onUpdate, this.saveNameChanges);
    
    componentDidUpdate(previousProps: Utilities.GameOverlay.IProps, previousState: Utilities.GameOverlay.State) : void {
        if (previousProps.mode !== this.props.mode) {
            this.setState({
                selectedOptionIndex: this.getDefaultOptionIndex()
            });
        }

        if (this.props.mode !== Utilities.Game.Mode.specifyName) {
            this.setState({
                playerName: this.props.playerName
            });
        }
    };

    componentDidMount() : void {
        document.addEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    componentWillUnmount() : void {
        document.removeEventListener(Utilities.General.DomEvent.keyDown, this.onKeyDown);
    };

    render() : JSX.Element {
        return <div className={'game-overlay-container ' + Utilities.App.Theme[this.props.theme]}>
                   <div className='game-overlay'>
                        {this.getGameOverlayBody()}
                   </div>
               </div>;
    };
};