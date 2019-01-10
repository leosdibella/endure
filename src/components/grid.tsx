import * as React from 'react';
import { Animator } from '../classes/animator';
import { GridDefinition } from '../classes/gridDefinition';
import { GridState } from '../classes/gridState';
import { TileContainer } from '../classes/tileContainer';
import { IDictionary } from '../interfaces/iDictionary';
import { IGridProps } from '../interfaces/iGridProps';
import { IGridReduction } from '../interfaces/iGridReduction';
import { AnimationTiming, Boundary, DetonationRange, DomEvent, GameMode, GridMode, Orientation, Theme } from '../utilities/enum';
import * as Shared from '../utilities/shared';
import { Tile } from './tile';

import '../styles/grid.scss';

export class Grid extends React.PureComponent<IGridProps, GridState> {
    private static readonly animationDuration: number = 333;
    private static readonly homeomorphismSlope: number = 2;
    private static readonly styleOverrideThreshold: number = 0.5;

    private static readonly standardTileAdditionalStyles: React.CSSProperties = {
        opacity: 1
    };

    private static readonly orientationStyles: IDictionary<React.CSSProperties> = {
        [Orientation.landscape]: {
            height: `${GridDefinition.orientedDefinitions[Orientation.landscape].numberOfRows * Tile.dimensionWithMargin}px`,
            width: `${GridDefinition.orientedDefinitions[Orientation.landscape].numberOfColumns * Tile.dimensionWithMargin}px`
        },
        [Orientation.portrait]: {
            height: `${GridDefinition.orientedDefinitions[Orientation.portrait].numberOfRows * Tile.dimensionWithMargin}px`,
            width: `${GridDefinition.orientedDefinitions[Orientation.portrait].numberOfColumns * Tile.dimensionWithMargin}px`
        }
    };

    private static symetrizeAndNormalizeTimingCurve(timeFraction: number): number {
        const reductedTimeFraction: number = timeFraction < Grid.styleOverrideThreshold ? 1 - timeFraction : timeFraction;

        return (Grid.homeomorphismSlope * reductedTimeFraction) - 1;
    }

    private readonly onKeyDown: (keyboardEvent: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onUpdate: (row: number, column: number) => void = this.handleUpdate.bind(this);
    private readonly onMoveLeft: () => void = this.move(Boundary.left).bind(this);
    private readonly onMoveRight: () => void = this.move(Boundary.right).bind(this);
    private readonly onMoveUp: () => void = this.move(Boundary.top).bind(this);
    private readonly onMoveDown: () => void = this.move(Boundary.bottom).bind(this);
    private readonly onStartAnimator: () => void = this.startAnimator.bind(this);
    private readonly onAnimationComplete: () => void = this.completeAnimation.bind(this);
    private readonly onDrawAnimationFrame: (timeFraction: number) => void = this.drawAnimationFrame.bind(this);

    private readonly keyDownEventActionMap: IDictionary<() => void> = {
        ' ': this.handleUpdate.bind(this),
        a: this.onMoveLeft,
        arrowdown: this.onMoveDown,
        arrowleft: this.onMoveLeft,
        arrowright: this.onMoveRight,
        arrowup: this.onMoveUp,
        d: this.onMoveRight,
        s: this.onMoveDown,
        w: this.onMoveUp
    };

    private readonly gridModeHandlerMap: IDictionary<(transposeTiles: boolean) => void> = {
        [GridMode.ready]: () => this.setState(GridState.transpose(this.props, this.state)),
        [GridMode.collapsing]: this.cascadeTiles.bind(this),
        [GridMode.cascading]: this.collapseTiles.bind(this)
    };

    private readonly movements: IDictionary<() => number> = {
        [Boundary.top]: () => this.state.row > 0 ? this.state.row - 1 : this.state.gridDefinition.numberOfRows - 1,
        [Boundary.bottom]: () => this.state.row < this.state.gridDefinition.numberOfRows - 1 ? this.state.row + 1 : 0,
        [Boundary.right]: () => this.state.column < this.state.gridDefinition.numberOfColumns - 1 ? this.state.column + 1 : 0,
        [Boundary.left]: () => this.state.column > 0 ? this.state.column - 1 : this.state.gridDefinition.numberOfColumns - 1
    };

    private cascadeTiles(transposeTiles: boolean = false): void {
        const nextState: GridState = this.getNextState(transposeTiles);

        nextState.gridMode = GridMode.cascading;
        nextState.updatedTiles = GridState.cascadeTiles(this.props, nextState);
        nextState.animator = this.generateAnimator();
        nextState.animationTimeFraction = 0;

        this.setState(nextState, this.onStartAnimator);
    }

    private collapseTiles(transposeTiles: boolean = false): void {
        const nextState: GridState = this.getNextState(transposeTiles),
              reduction: IGridReduction = GridState.reduceTiles(this.props, nextState);

        nextState.tiles = reduction.tiles;

        if (reduction.numberOfCollapsingTiles > 0) {
            nextState.gridMode = GridMode.collapsing;
            nextState.updatedTiles = reduction.collapsingTiles;
            nextState.animator = this.generateAnimator();
            nextState.animationTimeFraction = 0;

            this.props.onUpdate({
                points: reduction.numberOfCollapsingTiles
            });
        }

        this.setState(nextState, this.onStartAnimator);
    }

    private getNextState(transposeTiles: boolean): GridState {
        return transposeTiles ? new GridState(this.props, this.state.updatedTiles, this.state.graph) : GridState.transpose(this.props, this.state, this.state.updatedTiles);
    }

    private drawAnimationFrame(timeFraction: number): void {
        this.setState({
            animationTimeFraction: timeFraction
        });
    }

    private completeAnimation(): void {
        this.setState({
            animationTimeFraction: undefined,
            animator: undefined
        });
    }

    private stopAnimator(): void {
        if (Shared.isDefined(this.state.animator)) {
            (this.state.animator as Animator).stop();
        }
    }

    private startAnimator(): void {
        if (Shared.isDefined(this.state.animator)) {
            (this.state.animator as Animator).start();
        }
    }

    private generateAnimator(): Animator {
        return new Animator(Grid.animationDuration, this.onDrawAnimationFrame, this.onAnimationComplete, AnimationTiming.easeInOut);
    }

    private handleUpdate(row: number = this.state.row, column: number = this.state.column): void {
        if (this.state.gridMode === GridMode.ready) {
            const tile: TileContainer = this.state.tiles[this.state.gridDefinition.getTileIndexFromCoordinates(this.state.row, this.state.column)],
                  isRotation: boolean = tile.detonationRange === DetonationRange.none,
                  gridMode: GridMode = isRotation ? GridMode.cascading : GridMode.collapsing;

            this.setState({
                animationTimeFraction: isRotation ? 0 : undefined,
                animator: isRotation ? this.generateAnimator() : undefined,
                column,
                gridMode,
                row,
                updatedTiles: isRotation ? GridState.rotateTiles(this.state, tile): GridState.detonateTile(this.state, tile)
            }, this.onStartAnimator);
        }
    }

    private move(boundary: Boundary): () => void {
        return (): void => {
            if (this.state.gridMode === GridMode.ready) {
                const row: number = (Boundary.topBottom & boundary) === 0 ? this.state.row : this.movements[boundary](),
                      column: number = (Boundary.rightLeft & boundary) === 0 ? this.state.column : this.movements[boundary]();

                this.setState({
                    column,
                    row
                });
            }
        };
    }

    private handleKeyDown(keyboardEvent: KeyboardEvent): void {
        if (this.props.gameMode === GameMode.inGame && this.state.gridMode === GridMode.ready) {
            const handler: (() => void) | undefined = this.keyDownEventActionMap[keyboardEvent.key.toLocaleLowerCase()];

            if (Shared.isDefined(handler)) {
                handler();
            }
        }
    }

    private getTileElements(): JSX.Element[] {
        const additionalStyles: React.CSSProperties = {
                  opacity: Grid.symetrizeAndNormalizeTimingCurve(Shared.isDefined(this.state.animationTimeFraction) ? (this.state.animationTimeFraction as number) : 0)
              };

        return Shared.fillArray(this.state.tiles.length, index => {
            let tile: TileContainer = this.state.tiles[index],
                useOverrides: boolean = false;

            if (Shared.isDefined(this.state.animationTimeFraction)) {
                const updatedTile: TileContainer = this.state.updatedTiles[index];

                if (updatedTile.color !== tile.color || updatedTile.detonationRange !== tile.detonationRange) {
                    useOverrides = true;

                    if ((this.state.animationTimeFraction as number) > Grid.styleOverrideThreshold) {
                        tile = updatedTile;
                    }
                }
            }

            return <Tile key={tile.index}
                         selectedColumn={this.state.column}
                         selectedRow={this.state.row}
                         gridMode={this.state.gridMode}
                         gridDefinition={this.state.gridDefinition}
                         gameMode={this.props.gameMode}
                         additionalStyles={useOverrides ? additionalStyles : Grid.standardTileAdditionalStyles}
                         container={tile}
                         onUpdate={this.onUpdate}/>;
        });
    }

    public readonly state: GridState = new GridState(this.props);

    public componentDidMount(): void {
        document.addEventListener(DomEvent.keyDown, this.onKeyDown);
        this.collapseTiles();
    }

    public componentWillUnmount(): void {
        document.removeEventListener(DomEvent.keyDown, this.onKeyDown);
        this.stopAnimator();
    }

    public componentDidUpdate(previousProps: IGridProps): void {
        let transposeTiles: boolean | undefined;

        if (previousProps.orientation !== this.props.orientation) {
            this.stopAnimator();
            transposeTiles = true;
        } else if (this.state.gridMode !== GridMode.ready && !Shared.isDefined(this.state.animator)) {
            transposeTiles = false;
        }

        if (Shared.isDefined(transposeTiles)) {
            this.gridModeHandlerMap[this.state.gridMode](!!transposeTiles);
        }
    }

    public render(): JSX.Element {
        return <div className={`grid ${Theme[this.props.theme]}`}
                    style={Grid.orientationStyles[this.props.orientation]}>
                    {this.getTileElements()}
               </div>;
    }
}