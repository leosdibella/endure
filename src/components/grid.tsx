import * as React from 'react';
import { GridState } from '../classes/gridState';
import { TileContainer } from '../classes/tileContainer';
import { ICssStyle } from '../interfaces/iCssStyle';
import { IDictionary } from '../interfaces/iDictionary';
import { IGridProps } from '../interfaces/iGridProps';
import { IGridReduction } from '../interfaces/iGridReduction';
import { Boundary, DetonationRange, DomEvent, GameMode, Orientation, Theme } from '../utilities/enum';
import * as Shared from '../utilities/shared';
import { Tile } from './tile';

import '../styles/grid.scss';

export class Grid extends React.PureComponent<IGridProps, GridState> {
    private readonly onKeyDown: (keyboardEvent: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onUpdate: (row: number, column: number) => void = this.handleUpdate.bind(this);
    private readonly onMoveLeft: () => void = this.moveLeft.bind(this);
    private readonly onMoveRight: () => void = this.moveRight.bind(this);
    private readonly onMoveUp: () => void = this.moveUp.bind(this);
    private readonly onMoveDown: () => void = this.moveDown.bind(this);

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

    private removeReducedTiles(reduction: IGridReduction): void {
         // TODO: Add Reduction Animations

         // TODO ---- BELOW
        if (reduction.collapsingTiles.reduce((accumulator, currentValue) => accumulator + currentValue) > 0) {
            // TODO --- CASCADE TILES
            this.setState({
                processingInput: false
            });
        } else {
            this.setState({
                processingInput: false
            });
        }
        // TODO ---- ABOVE
    }

    private reduceTiles = (): void => {
        const reduction: IGridReduction = GridState.reduceTiles(this.props, this.state);

        this.setState({
            processingInput: true,
            tiles: reduction.tiles
        }, () => this.removeReducedTiles(reduction));
    }

    private detonateTile(): void {
        const tiles: TileContainer[] = GridState.detonateTile(this.state);

        // TODO: Add Detonation Animations
        this.setState({
            tiles
        }, this.reduceTiles);
    }

    private rotateTile(): void {
        const rotatedTiles: IDictionary<TileContainer> = GridState.rotateTiles(this.state);

        // TODO: Add Rotation Animations
        this.setState({
            tiles: this.state.tiles.map(t => Shared.castSafeOr(rotatedTiles[t.index], t))
        }, this.reduceTiles);
    }

    private takeAction() {
        const tile: TileContainer = this.state.tiles[this.state.gridDefinition.getTileIndexFromCoordinates(this.state.row, this.state.column)];

        tile.detonationRange === DetonationRange.none ? this.rotateTile() : this.detonateTile();
    }

    private handleUpdate(row?: number, column?: number): void {
        if (!this.state.processingInput) {
            this.setState({
                column: Shared.castSafeOr(column, this.state.column),
                processingInput: true,
                row: Shared.castSafeOr(row, this.state.row)
            }, this.takeAction);
        }
    }

    private moveRight(): void {
        this.setState({
            column: GridState.moves[Boundary.right](this.state)
        });
    }

    private moveLeft(): void {
        this.setState({
            column: GridState.moves[Boundary.left](this.state)
        });
    }

    private moveUp(): void {
        this.setState({
            row: GridState.moves[Boundary.top](this.state)
        });
    }

    private moveDown(): void {
        this.setState({
            row: GridState.moves[Boundary.bottom](this.state)
        });
    }

    private handleKeyDown(keyboardEvent: KeyboardEvent): void {
        if (this.props.gameMode === GameMode.inGame) {
            const handler: (() => void) | undefined = this.keyDownEventActionMap[keyboardEvent.key.toLocaleLowerCase()];

            if (Shared.isDefined(handler)) {
                handler();
            }
        }
    }

    public readonly state: GridState = new GridState(this.props, true);

    public componentDidMount(): void {
        document.addEventListener(DomEvent.keyDown, this.onKeyDown);

        const reduction: IGridReduction = GridState.reduceTiles(this.props, this.state);

         // TODO: Animate reduction
        this.setState({
            tiles: reduction.tiles
        }, () => this.removeReducedTiles(reduction));
    }

    public componentWillUnmount(): void {
        document.removeEventListener(DomEvent.keyDown, this.onKeyDown);
    }

    public componentDidUpdate(previousProps: IGridProps): void {
        if (previousProps.orientation !== this.props.orientation) {
            const nextState = GridState.transpose(this.props, this.state);
            const reduction: IGridReduction = GridState.reduceTiles(this.props, nextState);
            nextState.tiles = reduction.tiles;

            // TODO: Animate reduction
            this.setState(nextState, () => this.removeReducedTiles(reduction));
        }
    }

    public render(): JSX.Element {
        const tiles: JSX.Element[] = this.state.tiles.map(tile => <Tile key={tile.index}
                                                                        selectedColumn={this.state.column}
                                                                        selectedRow={this.state.row}
                                                                        gridDefinition={this.state.gridDefinition}
                                                                        gameMode={this.props.gameMode}
                                                                        container={tile}
                                                                        onUpdate={this.onUpdate}/>),
              style: ICssStyle = {
                  height: this.props.orientation === Orientation.portrait ? '685px' : '500px',
                  width: this.props.orientation === Orientation.portrait ? '475px' : '700px'
              };

        return <div className={`grid ${Theme[this.props.theme]}`}
                    style={style}>
                    {tiles}
               </div>;
    }
}