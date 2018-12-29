import * as React from 'react';
import { GameState } from '../classes/gameState';
import { IDictionary } from '../interfaces/iDictionary';
import { IGameProps } from '../interfaces/iGameProps';
import { IGameUpdate } from '../interfaces/iGameUpdate';
import { DomEvent, GameMode, Theme } from '../utilities/enum';
import * as Shared from '../utilities/shared';
import { Grid } from './grid';
import { Header } from './header';
import { Overlay } from './overlay';

export class Game extends React.PureComponent<IGameProps, GameState> {
    private static readonly overlayKey: number = 1;
    private static readonly headerKey: number = 2;
    private static readonly gridKey: number = 3;

    private readonly onKeyDown: (keyboardEvent: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onUpdate: (update: IGameUpdate) => void = this.handleUpdate.bind(this);
    private readonly onThemeChange: () => void = this.toggleTheme.bind(this);
    private readonly onQuit: () => void = this.quit.bind(this);

    private readonly keyDownEventActionMap: IDictionary<() => void> = {
        p: this.togglePaused.bind(this),
        q: this.onQuit,
        v: this.onThemeChange
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
        if (Shared.isInteger(update.theme)) {
            this.onThemeChange();
            this.onQuit();
        } else {
            const nextState: GameState = GameState.getNextStateFromUpdate(update, this.state);

            this.setState(nextState);
            GameState.persistState(nextState);
        }
    }

    private handleKeyDown(keyboardEvent: KeyboardEvent): void {
        const handler: (() => void) | undefined = this.keyDownEventActionMap[keyboardEvent.key.toLowerCase()];

        if (Shared.isDefined(handler)) {
            handler();
        }
    }

    private getOverlay(): JSX.Element | boolean {
        if (this.state.gameMode !== GameMode.inGame) {
            return <Overlay key={Game.overlayKey}
                            theme={this.props.theme}
                            gameMode={this.state.gameMode}
                            playerName={this.state.playerName}
                            difficulty={this.state.difficulty}
                            highScores={this.state.highScores}
                            onUpdate={this.onUpdate}>
                   </Overlay>;
        }

        return false;
    }

    private getInProgressLayout(): JSX.Element[] | boolean {
        if (GameState.isInProgress(this.state.gameMode)) {
            return [
                <Header key={Game.headerKey}
                        theme={this.props.theme}
                        gameMode={this.state.gameMode}
                        combo={this.state.combo}
                        difficulty={this.state.difficulty}
                        letterGrade={this.state.letterGrade}
                        score={this.state.score}
                        playerName={this.state.playerName}
                        stage={this.state.stage}
                        onUpdate={this.onUpdate}>
                </Header>,
                <Grid key={Game.gridKey}
                      difficulty={this.state.difficulty}
                      theme={this.props.theme}
                      gameMode={this.state.gameMode}
                      orientation={this.props.orientation}
                      onUpdate={this.onUpdate}>
                </Grid>
            ];
        }

        return false;
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
            {this.getOverlay()}
            {this.getInProgressLayout()}
        </div>;
    }
}