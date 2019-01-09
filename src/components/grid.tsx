import * as React from 'react';
import { Animator } from '../classes/animator';
import { GridState } from '../classes/gridState';
import { TileContainer } from '../classes/tileContainer';
import { IDictionary } from '../interfaces/iDictionary';
import { IGridProps } from '../interfaces/iGridProps';
import { IGridReduction } from '../interfaces/iGridReduction';
import { AnimationTiming, Boundary, DetonationRange, DomEvent, GameMode, GridMode, Theme } from '../utilities/enum';
import * as Shared from '../utilities/shared';
import { Tile } from './tile';

import '../styles/grid.scss';

export class Grid extends React.PureComponent<IGridProps, GridState> {
    private static readonly animationDurations: IDictionary<number> = {
        [GridMode.rotating]: 333,
        [GridMode.collapsing]: 500,
        [GridMode.cascading]: 500
    };

    private readonly onKeyDown: (keyboardEvent: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onUpdate: (row: number, column: number) => void = this.handleUpdate.bind(this);
    private readonly onMoveLeft: () => void = this.move(Boundary.left).bind(this);
    private readonly onMoveRight: () => void = this.move(Boundary.right).bind(this);
    private readonly onMoveUp: () => void = this.move(Boundary.top).bind(this);
    private readonly onMoveDown: () => void = this.move(Boundary.bottom).bind(this);
    private readonly onCascadeTiles: (transpose: boolean) => void = this.cascadeTiles.bind(this);
    private readonly onInitializeAnimator: () => void = this.initializeAnimator.bind(this);
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

    private readonly gridModeHandlerMap: IDictionary<(transpose: boolean) => void> = {
        [GridMode.ready]: () => {
            this.setState(GridState.transpose(this.props, this.state));
        },
        [GridMode.rotating]: this.onCascadeTiles,
        [GridMode.collapsing]: (transpose: boolean) => {
            const nextState: GridState = this.getNextState(transpose);

            nextState.gridMode = GridMode.cascading;
            nextState.updatedTiles = GridState.cascadeTiles(this.props, nextState);
            nextState.animator = this.generateAnimator(Grid.animationDurations[nextState.gridMode]);
            nextState.animationTimeFraction = 0;

            this.setState(nextState, this.onInitializeAnimator);
        },
        [GridMode.cascading]: this.onCascadeTiles
    };

    private readonly tileTransformationMap: IDictionary<() => TileContainer[]> = {
        [GridMode.rotating]: () => {
            const tiles: TileContainer[] = this.state.tiles.slice();

            this.state.updatedTiles.forEach((value, index, array) => {
                const nexTile: TileContainer = this.state.tiles[index === array.length - 1 ? 0 : index + 1];

                tiles[nexTile.index] = nexTile.cloneWith(value.color, value.detonationRange);
            });

            return tiles;
        },
        [GridMode.collapsing]: () => this.state.tiles,
        [GridMode.cascading]: () => this.state.updatedTiles
    };

    private cascadeTiles(transpose: boolean): void {
        const nextState: GridState = this.getNextState(transpose),
              reduction: IGridReduction = GridState.reduceTiles(this.props, nextState);

        nextState.tiles = reduction.tiles;

        if (reduction.numberOfCollapsingTiles > 0) {
            nextState.gridMode = GridMode.collapsing;
            nextState.updatedTiles = reduction.collapsingTiles;
            nextState.animator = this.generateAnimator(Grid.animationDurations[nextState.gridMode]);
            nextState.animationTimeFraction = 0;

            this.props.onUpdate({
                points: reduction.numberOfCollapsingTiles
            });
        }

        this.setState(nextState, this.onInitializeAnimator);
    }

    private getNextState(transpose: boolean): GridState {
        const tiles: TileContainer[] = this.tileTransformationMap[this.state.gridMode]();

        return transpose ? new GridState(this.props, tiles, this.state.graph) : GridState.transpose(this.props, this.state, tiles);
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

    private initializeAnimator(): void {
        if (Shared.isDefined(this.state.animator)) {
            (this.state.animator as Animator).start();
        }
    }

    private generateAnimator(duration: number): Animator {
        return new Animator(duration, this.onDrawAnimationFrame, this.onAnimationComplete, AnimationTiming.accelerate);
    }

    private handleUpdate(row: number = this.state.row, column: number = this.state.column): void {
        if (this.state.gridMode === GridMode.ready) {
            const tile: TileContainer = this.state.tiles[this.state.gridDefinition.getTileIndexFromCoordinates(this.state.row, this.state.column)],
                  isRotation: boolean = tile.detonationRange === DetonationRange.none,
                  gridMode: GridMode = isRotation ? GridMode.collapsing : GridMode.rotating;

            this.setState({
                animator: this.generateAnimator(Grid.animationDurations[gridMode]),
                column,
                gridMode,
                row,
                updatedTiles: isRotation ? GridState.rotateTiles(this.state, tile): GridState.detonateTile(this.state, tile)
            }, this.onInitializeAnimator);
        }
    }

    private move(boundary: Boundary): () => void {
        return (): void => {
            if (this.state.gridMode === GridMode.ready) {
                const row: number = (Boundary.topBottom & boundary) === 0 ? this.state.row : GridState.moves[boundary](this.state),
                      column: number = (Boundary.rightLeft & boundary) === 0 ? this.state.column : GridState.moves[boundary](this.state);

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
        // TODO: Add in overrride styles based on the GridMode
        // Use opacity and animationTimingFraction
        const additionalStyles: React.CSSProperties = {
            opacity: 1
        };

        return this.state.tiles.map(tile => {
            return <Tile key={tile.index}
                         selectedColumn={this.state.column}
                         selectedRow={this.state.row}
                         gridMode={this.state.gridMode}
                         gridDefinition={this.state.gridDefinition}
                         gameMode={this.props.gameMode}
                         additionalStyles={additionalStyles}
                         container={tile}
                         onUpdate={this.onUpdate}/>;
        });
    }

    public readonly state: GridState = new GridState(this.props);

    public componentDidMount(): void {
        document.addEventListener(DomEvent.keyDown, this.onKeyDown);

        this.setState({
            tiles: this.state.gridDefinition.generateTiles()
        });
    }

    public componentWillUnmount(): void {
        document.removeEventListener(DomEvent.keyDown, this.onKeyDown);
        this.stopAnimator();
    }

    public componentDidUpdate(previousProps: IGridProps): void {
        if (previousProps.orientation !== this.props.orientation) {
            this.stopAnimator();

            this.gridModeHandlerMap[this.state.gridMode](true);
        } else if (this.state.gridMode !== GridMode.ready && !Shared.isDefined(this.state.animator)) {
            this.gridModeHandlerMap[this.state.gridMode](false);
        }
    }

    public render(): JSX.Element {
        const style: React.CSSProperties = {
            height: `${this.state.gridDefinition.numberOfRows * Tile.dimensionWithMargin}px`,
            width: `${this.state.gridDefinition.numberOfColumns * Tile.dimensionWithMargin}px`
        };

        return <div className={`grid ${Theme[this.props.theme]}`}
                    style={style}>
                    {this.getTileElements()}
               </div>;
    }
}