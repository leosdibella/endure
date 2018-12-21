import * as React from 'react';

import * as GameUtilities from '../utilities/game';
import * as GridUtilities from '../utilities/grid';
import { Maybe } from '../utilities/maybe';
import * as Shared from '../utilities/shared';
import * as TileUtilities from '../utilities/tile';

import '../styles/grid.scss';

import { Tile } from './tile';

class Grid extends React.PureComponent<GridUtilities.IProps, GridUtilities.State> {
    private readonly onKeyDown: (keyboardEvent: KeyboardEvent) => void = this.handleKeyDown.bind(this);
    private readonly onUpdate: (row: number, column: number) => void = this.handleUpdate.bind(this);
    private readonly onMoveLeft: () => void = this.moveLeft.bind(this);
    private readonly onMoveRight: () => void = this.moveRight.bind(this);
    private readonly onMoveUp: () => void = this.moveUp.bind(this);
    private readonly onMoveDown: () => void = this.moveDown.bind(this);

    private readonly keyDownEventActionMap: Shared.IDictionary<() => void> = {
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

    private removeReducedTiles(reduction: GridUtilities.IReduction): void {
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
        const reduction: GridUtilities.IReduction = GridUtilities.State.reduceTiles(this.state);

        this.setState({
            processingInput: true,
            tiles: reduction.tiles
        }, () => this.removeReducedTiles(reduction));
    }

    private detonateTile(): void {
        const tiles: TileUtilities.Container[] = GridUtilities.State.detonateTile(this.state);

        // TODO: Add Detonation Animations
        this.setState({
            tiles
        }, this.reduceTiles);
    }

    private rotateTile(): void {
        const rotatedTiles: Shared.IDictionary<TileUtilities.Container> = GridUtilities.State.rotateTiles(this.state);

        // TODO: Add Rotation Animations
        this.setState({
            tiles: this.state.tiles.map(t => new Maybe(rotatedTiles[t.index]).getOrDefault(t))
        }, this.reduceTiles);
    }

    private takeAction() {
        const tile: TileUtilities.Container = this.state.tiles[this.state.dimension.getTileIndexFromCoordinates(this.state.row, this.state.column)];

        tile.detonationRange === TileUtilities.DetonationRange.none ? this.rotateTile() : this.detonateTile();
    }

    private handleUpdate(row?: number, column?: number): void {
        if (!this.state.processingInput) {
            this.setState({
                column: new Maybe(column).getOrDefault(this.state.column),
                processingInput: true,
                row: new Maybe(row).getOrDefault(this.state.row)
            }, this.takeAction);
        }
    }

    private moveRight(): void {
        this.setState({
            column: GridUtilities.State.moves[TileUtilities.Link.right](this.state)
        });
    }

    private moveLeft(): void {
        this.setState({
            column: GridUtilities.State.moves[TileUtilities.Link.left](this.state)
        });
    }

    private moveUp(): void {
        this.setState({
            row: GridUtilities.State.moves[TileUtilities.Link.top](this.state)
        });
    }

    private moveDown(): void {
        this.setState({
            row: GridUtilities.State.moves[TileUtilities.Link.bottom](this.state)
        });
    }

    private handleKeyDown(keyboardEvent: KeyboardEvent): void {
        if (this.props.mode === GameUtilities.Mode.inGame) {
           new Maybe(this.keyDownEventActionMap[keyboardEvent.key.toLocaleLowerCase()]).justDo(kdh => kdh.call(this));
        }
    }

    public readonly state: GridUtilities.State = new GridUtilities.State(this.props);

    public componentDidMount(): void {
        document.addEventListener(Shared.DomEvent.keyDown, this.onKeyDown);

        this.setState({
            processingInput: false
        });
    }

    public componentWillUnmount(): void {
        document.removeEventListener(Shared.DomEvent.keyDown, this.onKeyDown);
    }

    public componentDidUpdate(previousProps: GridUtilities.IProps): void {
        let nextState: GridUtilities.State = this.state;

        if (!GameUtilities.State.isInProgress(previousProps.mode) && GameUtilities.State.isInProgress(this.props.mode)) {
            nextState = new GridUtilities.State(this.props);
            nextState.tiles = this.state.dimension.generateTiles();
        }

        if (previousProps.orientation !== this.props.orientation && GameUtilities.State.isInProgress(this.props.mode)) {
            nextState = GridUtilities.State.transpose(this.props, nextState);
        }

        // TODO: Animate reduction
        const reduction: GridUtilities.IReduction = GridUtilities.State.reduceTiles(nextState);
        nextState.tiles = reduction.tiles;

        this.setState(nextState, () => this.removeReducedTiles(reduction));
    }

    public render(): JSX.Element {
        const tiles: JSX.Element[] = this.state.tiles.map(tile => <Tile key={tile.index}
                                                                        mode={this.props.mode}
                                                                        color={tile.color}
                                                                        detonationRange={tile.detonationRange}
                                                                        row={tile.row}
                                                                        column={tile.column}
                                                                        selectedRow={this.state.row}
                                                                        selectedColumn={this.state.column}
                                                                        link={tile.link}
                                                                        onUpdate={this.onUpdate}/>);

        return <div className={`grid ${GameUtilities.State.isInProgress(this.props.mode) ? '' : 'hide '} ${Shared.Theme[this.props.theme]}`}>
                    {tiles}
               </div>;
    }
}

export {
    Grid
};