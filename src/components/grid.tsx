import React, { PureComponent } from 'react';
import { Animator } from '../classes/animator';
import { GridState } from '../classes/gridState';
import { TileContainer } from '../classes/tileContainer';
import { IDictionary } from '../interfaces/iDictionary';
import { IGridProps } from '../interfaces/iGridProps';
import { IGridReduction } from '../interfaces/iGridReduction';
import { Boundary, DetonationRange, DomEvent, GameMode, GridMode, Theme } from '../utilities/enum';
import { fillArray, isDefined, totalPercentage } from '../utilities/shared';
import { Tile } from './tile';

import '../styles/grid.scss';

export class Grid extends PureComponent<IGridProps, GridState> {
    private static readonly animationDuration: number = 250;
    private static readonly radialModifier: number = 50;
    private static readonly styleOverrideThreshold: number = 0.5;

    private static readonly standardTileAdditionalStyles: React.CSSProperties = {
        opacity: 1
    };

    private static symmetrizeTimingCurve(timeFraction: number): number {
        return timeFraction < Grid.styleOverrideThreshold ? 1 - timeFraction : timeFraction;
    }

    private readonly onKeyDown: (event: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onUpdate: (row: number, column: number) => void = this.handleUpdate.bind(this);
    private readonly onMoveLeft: () => void = this.move(Boundary.left).bind(this);
    private readonly onMoveRight: () => void = this.move(Boundary.right).bind(this);
    private readonly onMoveUp: () => void = this.move(Boundary.top).bind(this);
    private readonly onMoveDown: () => void = this.move(Boundary.bottom).bind(this);
    private readonly onStartAnimator: () => void = this.startAnimator.bind(this);
    private readonly onAnimationComplete: () => void = this.completeAnimation.bind(this);
    private readonly onDrawAnimationFrame: (timeFraction: number) => void = this.drawAnimationFrame.bind(this);
    private readonly onCollapseTiles: (transposeTiles: boolean) => void = this.collapseTiles.bind(this);
    private readonly onCascadeTiles: (transposeTiles: boolean) => void = this.cascadeTiles.bind(this);

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
        [GridMode.ready]: this.onCollapseTiles,
        [GridMode.collapsing]: this.onCascadeTiles,
        [GridMode.cascading]: this.onCollapseTiles
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
              reduction: IGridReduction = GridState.reduceTiles(nextState);

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
        return transposeTiles
                ? GridState.transpose(this.props, this.state, this.state.updatedTiles)
                : new GridState(this.props, this.state.updatedTiles, this.state.neighborGraph, this.state.row, this.state.column);
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
        if (isDefined(this.state.animator)) {
            (this.state.animator as Animator).stop();
        }
    }

    private startAnimator(): void {
        if (isDefined(this.state.animator)) {
            (this.state.animator as Animator).start();
        }
    }

    private generateAnimator(): Animator {
        return new Animator(Grid.animationDuration, this.onDrawAnimationFrame, this.onAnimationComplete);
    }

    private handleUpdate(row: number = this.state.row, column: number = this.state.column): void {
        if (this.state.gridMode === GridMode.ready) {
            const tile: TileContainer = this.state.gridDefinition.getTile(this.state.tiles, row, column);

            this.setState({
                animationTimeFraction: 0,
                animator: this.generateAnimator(),
                column,
                gridMode: GridMode.cascading,
                row,
                updatedTiles: tile.detonationRange === DetonationRange.none ? GridState.rotateTiles(this.state, tile): GridState.detonateTile(this.state, tile)
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

    private handleKeyDown(event: KeyboardEvent): void {
        if (this.props.gameMode === GameMode.inGame && this.state.gridMode === GridMode.ready) {
            const handler: (() => void) | undefined = this.keyDownEventActionMap[event.key.toLocaleLowerCase()];

            if (isDefined(handler)) {
                event.preventDefault();
                event.stopPropagation();
                handler();
            }
        }
    }

    private getTileElements(): JSX.Element[] {
        const fraction: number = Grid.symmetrizeTimingCurve(isDefined(this.state.animationTimeFraction) ? (this.state.animationTimeFraction as number) : 0),
              additionalStyles: React.CSSProperties = {
                  borderRadius: `${fraction * totalPercentage - Grid.radialModifier}%`,
                  opacity: fraction
              };

        return fillArray(this.state.gridDefinition.numberOfRows, row => {
            const tileRow: JSX.Element[] = fillArray(this.state.gridDefinition.numberOfColumns, column => {
                const index: number = this.state.gridDefinition.getTileIndexFromCoordinates(row, column);

                let tile: TileContainer = this.state.tiles[index],
                    useOverrides: boolean = false;

                if (isDefined(this.state.animationTimeFraction)) {
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

            return <div className='grid-row'
                        key={`row-${row}`}>
                        {tileRow}
                   </div>;
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

        if (isDefined(this.state.animator) && this.props.gameMode !== previousProps.gameMode) {
            const animator: Animator = this.state.animator as Animator;

            if (this.props.gameMode === GameMode.paused) {
                animator.pause();
            } else {
                animator.start();
            }
        }

        if (previousProps.orientation !== this.props.orientation) {
            this.stopAnimator();
            transposeTiles = true;
        } else if (this.state.gridMode !== GridMode.ready && !isDefined(this.state.animator)) {
            transposeTiles = false;
        }

        if (isDefined(transposeTiles)) {
            this.gridModeHandlerMap[this.state.gridMode](!!transposeTiles);
        }
    }

    public render(): JSX.Element {
        return <div className={`grid ${Theme[this.props.theme]}`}>
                    {this.getTileElements()}
               </div>;
    }
}