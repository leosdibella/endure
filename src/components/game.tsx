import React, { PureComponent } from 'react';
import { GameState } from '../classes/gameState';
import { IDictionary } from '../interfaces/iDictionary';
import { IGameProps } from '../interfaces/iGameProps';
import { IGameUpdate } from '../interfaces/iGameUpdate';
import { DomEvent, GameMode, Theme } from '../utilities/enum';
import { isDefined, isInteger } from '../utilities/shared';
import { Combo } from './combo';
import { Grade } from './grade';
import { Grid } from './grid';
import { Overlay } from './overlay';

import '../styles/game.scss';

export class Game extends PureComponent<IGameProps, GameState> {
    private static readonly overlayKey: number = 1;
    private static readonly headerKey: number = 2;
    private static readonly gridKey: number = 3;

    private readonly onKeyDown: (event: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onUpdate: (update: IGameUpdate) => void = this.handleUpdate.bind(this);
    private readonly onPause: () => void = this.togglePaused.bind(this);
    private readonly onToggleTheme: () => void = this.toggleTheme.bind(this);

    private readonly keyDownEventActionMap: IDictionary<() => void> = {
        p: this.onPause,
        q: this.quit.bind(this),
        v: this.onToggleTheme
    };

    private toggleTheme(): void {
        if (this.state.gameMode !== GameMode.specifyName) {
            this.props.onUpdate({
                theme: this.props.theme === Theme.dark ? Theme.light : Theme.dark
            });
        }
    }

    private quit(): void {
        this.handleUpdate({
            gameMode: GameMode.newGame
        });
    }

    private togglePaused(): void {
        if (GameState.isInProgress(this.state.gameMode)) {
            this.setState({
                gameMode: this.state.gameMode === GameMode.paused ? GameMode.inGame : GameMode.paused
            });
        }
    }

    private handleUpdate(update: IGameUpdate): void {
        if (isInteger(update.theme)) {
            this.props.onUpdate({
                theme: update.theme
            });

            this.quit();
        } else {
            const nextState: GameState = GameState.getNextStateFromUpdate(update, this.state);

            this.setState(nextState);
            GameState.persistState(nextState);
        }
    }

    private handleKeyDown(event: KeyboardEvent): void {
        const handler: (() => void) | undefined = this.keyDownEventActionMap[event.key.toLowerCase()];

        if (isDefined(handler)) {
            event.preventDefault();
            event.stopPropagation();
            handler();
        }
    }

    private getLayout(): JSX.Element[] {
        const elements: JSX.Element[] = [];

        if (this.state.gameMode !== GameMode.inGame) {
            elements.push(<Overlay key={Game.overlayKey}
                                   theme={this.props.theme}
                                   gameMode={this.state.gameMode}
                                   playerName={this.state.playerName}
                                   difficulty={this.state.difficulty}
                                   highScores={this.state.highScores}
                                   onUpdate={this.onUpdate}>
                          </Overlay>);
        }

        if (GameState.isInProgress(this.state.gameMode)) {
            // TODO: Need a pause button (maybe in grade component) and a maybe a view mode component as well...
            elements.push(<div key={Game.headerKey}
                               className={`header ${Theme[this.props.theme]}`}>
                              <div className='header-left-hud'>
                                   <div className='header-pause'
                                        onClick={this.onPause}>
                                       {this.state.gameMode === GameMode.paused ? '\u25B6' : '\u2759\u2759'}
                                   </div>
                                   <div className='header-left-sub-hud'>
                                       <div className='header-name'>
                                            {this.state.playerName}
                                       </div>
                                       <Combo combo={this.state.combo}
                                              stage={this.state.stage}
                                              difficulty={this.state.difficulty}
                                              onUpdate={this.onUpdate}
                                              letterGrade={this.state.letterGrade}
                                              gameMode={this.state.gameMode}>
                                       </Combo>
                                   </div>
                              </div>
                              <Grade letterGrade={this.state.letterGrade}
                                     difficulty={this.state.difficulty}
                                     stage={this.state.stage}
                                     gameMode={this.state.gameMode}
                                     onUpdate={this.onUpdate}>
                              </Grade>
                              <div className='header-right-hud'>
                                  <div className='header-right-sub-hud'>
                                      <div className='header-score'>
                                         Score: {this.state.score}
                                      </div>
                                      <div className='header-stage'>
                                         Stage: {this.state.stage}
                                      </div>
                                  </div>
                                  <div className='header-theme'
                                       onClick={this.onToggleTheme}>
                                      {this.props.theme === Theme.dark ? '\u2600' : '\u263e'}
                                  </div>
                              </div>
                          </div>);

            elements.push(<Grid key={Game.gridKey}
                                difficulty={this.state.difficulty}
                                theme={this.props.theme}
                                gameMode={this.state.gameMode}
                                orientation={this.props.orientation}
                                onUpdate={this.onUpdate}>
                          </Grid>);
        }

        return elements;
    }

    public readonly state: GameState = GameState.getPersistedState();

    public componentDidMount(): void {
        document.addEventListener(DomEvent.keyDown, this.onKeyDown);
    }

    public componentWillUnmount(): void {
        document.removeEventListener(DomEvent.keyDown, this.onKeyDown);
    }

    public render(): JSX.Element {
        return <div className={`game ${Theme[this.props.theme]}`}>
                    {this.getLayout()}
                </div>;
    }
}