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
            this.state.menu.menuOptions[this.props.mode].justDo(mo => mo.actions[this.state.selectedOptionIndex]());
        }
    };

    private readonly onKeyDown = (keyboardEvent: KeyboardEvent) : void => {
        new Utilities.Maybe(this.keyDownEventActionMap[keyboardEvent.key.toLowerCase()]).justDo(kdh => kdh());
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

    private getGameOverlayTitle() : Utilities.Maybe<JSX.Element> {
        return this.state.menu.menuOptions[this.props.mode].bind(mo => {
            const overlayTile: JSX.Element = <div className={'game-overlay-tile ' + Utilities.App.Theme[this.props.theme]}>
                                             </div>;

            return new Utilities.Maybe(<div key={1}
                                            className={'game-overlay-' + mo.className + '-text'}>
                                            {overlayTile}
                                            {mo.title}
                                            {overlayTile}
                                       </div>);
        });
    };

    private getHighScoresOverlayExtras() : JSX.Element {
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
            </div>;
    };

    private getGameOverlayExtras() : Utilities.Maybe<JSX.Element> {
        let maybeJsx: Utilities.Maybe<JSX.Element> = new Utilities.Maybe();
        
        new Utilities.Maybe(this.props.mode === Utilities.Game.Mode.highScores).justDo(() => {
            maybeJsx = new Utilities.Maybe(this.getHighScoresOverlayExtras());
        }).otherwiseJustDo(new Utilities.Maybe(this.props.mode === Utilities.Game.Mode.specifyName), () => {
            maybeJsx = new Utilities.Maybe(<div key={2}
                                                className='game-overlay-player-name-input-container'>
                                                <input value={this.state.playerName}
                                                       className={Utilities.App.Theme[this.props.theme]}
                                                       onChange={this.handleNameChanges}/>
                                           </div>);
        });

        return maybeJsx;
    };

    private getGameOverlayButtonPanel() : Utilities.Maybe<JSX.Element> {
        return this.state.menu.menuOptions[this.props.mode].bind(mo => {
            const buttons: JSX.Element[] = Utilities.General.fillArray(mo.options.length, i => {
                return <button key={i}
                               className={'game-overlay-button' + (this.state.selectedOptionIndex === i ? ' game-overlay-selected-option': '')}
                               onClick={mo.actions[i]}>
                            {mo.options[i]}
                       </button>;
            });

            return new Utilities.Maybe(<div key={3}
                                            className='game-overlay-button-panel'>
                                            {buttons}
                                       </div>);
        });
    };

    private getGameOverlayBody() : JSX.Element[] {
        return Utilities.Maybe.filterCollection([
            this.getGameOverlayTitle(),
            this.getGameOverlayExtras(),
            this.getGameOverlayButtonPanel()
        ]);
    };

    private getDefaultOptionIndex() : number {
        if (this.props.mode === Utilities.Game.Mode.selectDifficulty) {
            return this.props.difficulty;
        }

        if (this.props.mode === Utilities.Game.Mode.setTheme) {
            return this.props.theme === Utilities.App.Theme.light ? 0 : 1
        }

        return this.state.menu.menuOptions[this.props.mode].caseOf(mo => mo.defaultOptionsIndex.getOrDefault(Utilities.GameOverlay.defaultDefaultOptionsIndex),
                                                                   () => Utilities.GameOverlay.defaultDefaultOptionsIndex);
    };

    private incrementOrDecrementOptionsIndex(direction: number) : void {
        this.state.menu.menuOptions[this.props.mode].justDo(mo => {
            let optionIndex = this.state.selectedOptionIndex + direction;

            this.setState({
                selectedOptionIndex: optionIndex >= 0 ? (optionIndex % mo.options.length) : (mo.options.length - 1)
            });
        });
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